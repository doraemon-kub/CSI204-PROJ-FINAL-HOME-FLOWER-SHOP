import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminProducts.css';
const API_URL = '/api';

export default function AdminProducts({ user }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'ready-made',
    tag: '',
    newTag: '',
    description: '',
    existingImage: ''
  });
  const [imageFile, setImageFile] = useState(null);

  const handleAddNew = () => {
    setEditingId(null);
    setIsAdding(true);
    setFormData({ name: '', price: '', category: 'ready-made', tag: '', newTag: '', description: '', existingImage: '' });
    setImageFile(null);
  };

  const handleEdit = (p) => {
    setIsAdding(false);
    setEditingId(p.id);
    setFormData({
      name: p.name || '',
      price: p.price || '',
      category: p.category || 'ready-made',
      tag: p.tag || '',
      newTag: '',
      description: p.description || '',
      existingImage: p.image || ''
    });
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      // If they select an existing tag, clear newTag
      if (name === 'tag') {
        updated.newTag = '';
      }
      // If they change category, reset tag (old tags may not exist in new category)
      if (name === 'category') {
        updated.tag = '';
        updated.newTag = '';
      }
      return updated;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('category', formData.category);
      
      const finalTag = (formData.newTag && formData.newTag.trim() !== '') ? formData.newTag.trim() : formData.tag;
      data.append('tag', finalTag);
      
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      if (editingId) {
        await axios.put(`${API_URL}/products/${editingId}`, data, {
          headers: { 
            'x-user-id': user.id,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('แก้ไขสินค้าเรียบร้อยแล้ว');
      } else {
        await axios.post(`${API_URL}/products`, data, {
          headers: { 
            'x-user-id': user.id,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('เพิ่มสินค้าเรียบร้อยแล้ว');
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ name: '', price: '', category: 'ready-made', tag: '', newTag: '', description: '', existingImage: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product', err);
      alert(`เกิดข้อผิดพลาดในการ${editingId ? 'แก้ไข' : 'เพิ่ม'}สินค้า`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { 'x-user-id': user.id }
      });
      alert('ลบสินค้าสำเร็จ');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  const predefinedTags = {
    'ready-made': ['จัดส่งฟรี', 'แนะนำ Custom'],
    'custom': ['จัดส่งฟรี', 'แนะนำ Custom'],
    'gift': ['ตุ๊กตาหมี', 'เทียนหอม', 'กล่อง/การ์ด', 'การ์ด']
  };

  const existingTags = [...new Set([
    ...(predefinedTags[formData.category] || []),
    ...products
      .filter(p => p.category === formData.category)
      .map(p => p.tag)
      .filter(tag => tag && tag.trim() !== '')
  ])];

  if (isLoading) return <div>กำลังโหลดสินค้า...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>จัดการสินค้า</h1>
        {!isAdding && !editingId && (
          <button className="btn-add-product" onClick={handleAddNew}>
            <i className="fa-solid fa-plus"></i> เพิ่มสินค้าใหม่
          </button>
        )}
      </div>



      {(isAdding || editingId) && (
        <div className="add-product-form">
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>{editingId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group-admin">
                <label>ชื่อสินค้า</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group-admin">
                <label>ราคา (บาท)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="form-group-admin">
                <label>หมวดหมู่</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="ready-made">ดอกไม้แห้ง</option>
                  <option value="custom">ดอกไม้ประดิษฐ์</option>
                  <option value="gift">ของขวัญ</option>
                </select>
              </div>
              <div className="form-group-admin">
                <label>รูปภาพสินค้า</label>
                {editingId && formData.existingImage && !imageFile && (
                  <div style={{ marginBottom: '10px' }}>
                    <img src={`http://localhost:3000/uploads/${formData.existingImage}`} alt="Current" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2d9c9' }} />
                    <div style={{ fontSize: '0.8rem', color: '#8a7a68', marginTop: '4px' }}>รูปภาพปัจจุบัน (หากไม่ต้องการเปลี่ยน ให้เว้นว่างไว้)</div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="form-group-admin">
                <label>เลือกแท็ก / หมวดย่อยที่มีอยู่แล้ว</label>
                <select name="tag" value={formData.tag} onChange={handleInputChange}>
                  <option value="">-- ไม่ระบุ / สร้างใหม่ด้านล่าง --</option>
                  {existingTags.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-admin">
                <label>หรือสร้างแท็กใหม่</label>
                <input 
                  type="text" 
                  name="newTag" 
                  value={formData.newTag} 
                  onChange={handleInputChange} 
                  placeholder="พิมพ์แท็กใหม่ที่นี่..." 
                />
              </div>
            </div>
            <div className="form-group-admin">
              <label>รายละเอียด</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn-cancel" style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid #e2d9c9', background: '#fff', color: '#8a7a68', cursor: 'pointer', fontWeight: '600' }} onClick={() => { setIsAdding(false); setEditingId(null); }}>ยกเลิก</button>
              <button type="submit" className="btn-save" style={{ padding: '12px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', background: 'var(--primary, #846F5B)', color: '#fff', fontWeight: '600', boxShadow: '0 4px 12px rgba(132,111,91,0.2)' }}>บันทึกสินค้า</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={`http://localhost:3000/uploads/${p.image}`} alt={p.name} className="product-img-preview" />
                    ) : (
                      <div className="product-img-preview" style={{ background: '#e2e8f0' }}></div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>฿{p.price}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-edit" onClick={() => handleEdit(p)} style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', color: '#64748b' }}>
                        <i className="fa-solid fa-pen"></i> แก้ไข
                      </button>
                      <button className="btn-danger" onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', borderRadius: '4px' }}>
                        <i className="fa-solid fa-trash"></i> ลบ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
