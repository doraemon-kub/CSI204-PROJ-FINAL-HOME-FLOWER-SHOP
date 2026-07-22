import React, { useState } from 'react';
import axios from 'axios';
import { ThailandAddressTypeahead } from 'react-thailand-address-typeahead';
import '../styles/profile-view.css';

const API_URL = '/api';

export default function ProfileView({ user, onLogout, onViewChange, refetchUser }) {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  
  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [addressValue, setAddressValue] = useState({
    subdistrict: '',
    district: '',
    province: '',
    postalCode: ''
  });
  const [isDefault, setIsDefault] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    return (
      <div className="section">
        <div className="container" style={{ textAlign: 'center', padding: '100px 0' }}>
          <h2>กรุณาเข้าสู่ระบบเพื่อดูโปรไฟล์</h2>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const openAddModal = () => {
    setEditingAddressId(null);
    setName(user.name || '');
    setPhone(user.phone || '');
    setAddressDetail('');
    setAddressValue({ subdistrict: '', district: '', province: '', postalCode: '' });
    setIsDefault(user.addresses?.length ? false : true);
    setIsAddressModalOpen(true);
  };

  const openEditModal = (addr) => {
    setEditingAddressId(addr.id);
    setName(addr.name);
    setPhone(addr.phone);
    setAddressDetail(addr.addressDetail || addr.address);
    setAddressValue({
      subdistrict: addr.subdistrict || '',
      district: addr.district || '',
      province: addr.province || '',
      postalCode: addr.zipcode || ''
    });
    setIsDefault(addr.isDefault);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    setEditingAddressId(null);
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const fullAddress = `${addressDetail} ต.${addressValue.subdistrict} อ.${addressValue.district} จ.${addressValue.province} ${addressValue.postalCode}`.trim();
      
      const payload = { 
        name, 
        phone, 
        address: fullAddress, 
        addressDetail,
        subdistrict: addressValue.subdistrict,
        district: addressValue.district,
        province: addressValue.province,
        zipcode: addressValue.postalCode,
        isDefault 
      };
      
      if (editingAddressId) {
        // Edit address
        await axios.put(`${API_URL}/users/${user.id}/addresses/${editingAddressId}`, payload);
      } else {
        // Add address
        await axios.post(`${API_URL}/users/${user.id}/addresses`, payload);
      }
      
      if (refetchUser) {
        await refetchUser();
      }
      closeAddressModal();
    } catch (err) {
      console.error('Failed to save address', err);
      alert('เกิดข้อผิดพลาดในการบันทึกที่อยู่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('คุณต้องการลบที่อยู่นี้ใช่หรือไม่?')) return;
    
    try {
      await axios.delete(`${API_URL}/users/${user.id}/addresses/${addressId}`);
      if (refetchUser) {
        await refetchUser();
      }
    } catch (err) {
      console.error('Failed to delete address', err);
      alert('เกิดข้อผิดพลาดในการลบที่อยู่');
    }
  };

  return (
    <div className="section profile-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">โปรไฟล์ของฉัน</h2>
          <p className="section-subtitle">ข้อมูลบัญชีผู้ใช้ของคุณ</p>
        </div>

        <div className="profile-layout">
          {/* ข้อมูลโปรไฟล์หลัก */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                <i className="fa-solid fa-user"></i>
              </div>
              <h3>{user.name || 'ผู้ใช้'}</h3>
              <span className="profile-role">{user.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}</span>
            </div>

            <div className="profile-details">
              <div className="detail-group">
                <label><i className="fa-solid fa-envelope"></i> อีเมล</label>
                <p>{user.email}</p>
              </div>
              <div className="detail-group">
                <label><i className="fa-solid fa-phone"></i> เบอร์โทรศัพท์</label>
                <p>{user.phone || '-'}</p>
              </div>
              <div className="detail-group">
                <label><i className="fa-solid fa-calendar-alt"></i> วันที่สมัครสมาชิก</label>
                <p>{formatDate(user.createdAt)}</p>
              </div>
            </div>

            <div className="profile-actions">
              <button 
                className="btn btn-primary" 
                onClick={() => onViewChange('#orders')}
              >
                <i className="fa-solid fa-box-open"></i> ประวัติการสั่งซื้อ
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={onLogout}
              >
                <i className="fa-solid fa-sign-out-alt"></i> ออกจากระบบ
              </button>
            </div>
          </div>

          {/* ส่วนจัดการที่อยู่จัดส่ง */}
          <div className="addresses-card">
            <div className="addresses-header">
              <h3><i className="fa-solid fa-map-location-dot"></i> ที่อยู่สำหรับจัดส่ง</h3>
              <button className="btn btn-sm btn-outline" onClick={openAddModal}>
                <i className="fa-solid fa-plus"></i> เพิ่มที่อยู่ใหม่
              </button>
            </div>

            <div className="addresses-list">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map(addr => (
                  <div key={addr.id} className={`address-item ${addr.isDefault ? 'default-address' : ''}`}>
                    <div className="address-content">
                      <div className="address-name-phone">
                        <strong>{addr.name}</strong>
                        <span>{addr.phone}</span>
                        {addr.isDefault && <span className="badge-default">ค่าเริ่มต้น</span>}
                      </div>
                      <p className="address-text">{addr.address}</p>
                    </div>
                    <div className="address-actions">
                      <button className="btn-icon" onClick={() => openEditModal(addr)} title="แก้ไข">
                        <i className="fa-regular fa-pen-to-square"></i>
                      </button>
                      <button className="btn-icon text-danger" onClick={() => handleDeleteAddress(addr.id)} title="ลบ">
                        <i className="fa-regular fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-addresses">
                  <i className="fa-regular fa-address-book"></i>
                  <p>ยังไม่มีข้อมูลที่อยู่สำหรับจัดส่ง</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {isAddressModalOpen && (
        <div className="modal open" style={{ zIndex: 1100 }}>
          <div className="modal-overlay" onClick={closeAddressModal}></div>
          <div className="modal-content address-modal-content">
            <button className="modal-close" onClick={closeAddressModal}>
              <i className="fa-solid fa-xmark"></i>
            </button>
            
            <h3 className="modal-title">
              {editingAddressId ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่จัดส่งใหม่'}
            </h3>
            
            <form onSubmit={handleAddressSubmit} className="address-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>ชื่อ-นามสกุล *</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    placeholder="ชื่อ-นามสกุล"
                    required 
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>เบอร์โทรศัพท์ *</label>
                  <input 
                    type="tel" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                    placeholder="เบอร์โทรศัพท์"
                    maxLength="10"
                    pattern="[0-9]{10}"
                    title="กรุณากรอกเบอร์โทรศัพท์ 10 หลัก"
                    required 
                  />
                </div>
              </div>

              <ThailandAddressTypeahead 
                value={addressValue} 
                onValueChange={(val) => setAddressValue(val)}
              >
                <div className="form-row" style={{ flexWrap: 'wrap' }}>
                  <div className="form-group half-width">
                    <label>จังหวัด *</label>
                    <ThailandAddressTypeahead.ProvinceInput className="form-control" placeholder="เลือกจังหวัด" required />
                  </div>
                  <div className="form-group half-width">
                    <label>เขต/อำเภอ *</label>
                    <ThailandAddressTypeahead.DistrictInput className="form-control" placeholder="เลือกอำเภอ" required />
                  </div>
                  <div className="form-group half-width">
                    <label>แขวง/ตำบล *</label>
                    <ThailandAddressTypeahead.SubdistrictInput className="form-control" placeholder="เลือกตำบล" required />
                  </div>
                  <div className="form-group half-width">
                    <label>รหัสไปรษณีย์ *</label>
                    <ThailandAddressTypeahead.PostalCodeInput className="form-control" placeholder="รหัสไปรษณีย์" required />
                  </div>
                </div>
                <ThailandAddressTypeahead.Suggestion containerProps={{ className: 'address-suggestion-container' }} optionItemProps={{ className: 'address-suggestion-item' }} />
              </ThailandAddressTypeahead>

              <div className="form-group mt-3">
                <label>รายละเอียดที่อยู่ (บ้านเลขที่, ซอย, ถนน) *</label>
                <textarea 
                  value={addressDetail} 
                  onChange={e => setAddressDetail(e.target.value)} 
                  placeholder="บ้านเลขที่, ซอย, หมู่, ถนน"
                  required
                  rows="2"
                ></textarea>
              </div>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    disabled={user.addresses?.length === 0 || (editingAddressId && user.addresses?.find(a => a.id === editingAddressId)?.isDefault && user.addresses.length === 1)}
                  />
                  <span>ตั้งเป็นที่อยู่สำหรับจัดส่งเริ่มต้น</span>
                </label>
              </div>

              <div className="form-actions" style={{ marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={closeAddressModal} style={{ marginRight: '10px' }}>ยกเลิก</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
