import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './adminOrders.css';
const API_URL = '/api';

const STATUS_OPTIONS = [
  'กำลังตรวจสอบการชำระเงิน',
  'ชำระเงินแล้ว',
  'กำลังจัดเตรียมสินค้า',
  'จัดส่งแล้ว',
  'รอคืนเงิน',
  'คืนเงินสำเร็จ',
  'ยกเลิกคำสั่งซื้อ'
];

const getAvailableStatuses = (currentStatus) => {
  const statusToUse = currentStatus || STATUS_OPTIONS[0];
  const sequence = [
    'กำลังตรวจสอบการชำระเงิน',
    'ชำระเงินแล้ว',
    'กำลังจัดเตรียมสินค้า',
    'จัดส่งแล้ว'
  ];

  const currentIndex = sequence.indexOf(statusToUse);

  if (currentIndex === -1) {
    if (statusToUse === 'ยกเลิกคำสั่งซื้อ') {
      return ['ยกเลิกคำสั่งซื้อ', 'รอคืนเงิน'];
    }
    if (statusToUse === 'รอคืนเงิน') {
      return ['รอคืนเงิน', 'คืนเงินสำเร็จ'];
    }
    if (statusToUse === 'คืนเงินสำเร็จ') {
      return ['คืนเงินสำเร็จ'];
    }
    return [statusToUse]; 
  }

  const allowed = [statusToUse];
  
  if (currentIndex + 1 < sequence.length) {
    allowed.push(sequence[currentIndex + 1]);
  }

  return [...new Set(allowed)];
};

export default function AdminOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');
  const [searchOrderId, setSearchOrderId] = useState('');

  // States for updating specific order
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editTracking, setEditTracking] = useState('');

  const fetchOrders = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/orders`, {
        headers: { 'x-user-id': user.id }
      });
      // Sort by newest first
      const sorted = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) fetchOrders();
  }, [user, fetchOrders]);

  const handleEditClick = (order) => {
    setEditingOrderId(order.orderId);
    setEditStatus(order.status || STATUS_OPTIONS[0]);
    setEditTracking(order.trackingNumber || '');
  };

  const handleCancelEdit = () => {
    setEditingOrderId(null);
  };

  const handleSave = async (orderId) => {
    try {
      await axios.put(`${API_URL}/orders/${orderId}/status`, {
        status: editStatus,
        trackingNumber: editTracking || null
      }, {
        headers: { 'x-user-id': user.id }
      });
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'อัปเดตสถานะคำสั่งซื้อเรียบร้อยแล้ว',
        icon: 'success',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#846F5B'
      });
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order', err);
      Swal.fire({
        title: 'เกิดข้อผิดพลาด!',
        text: 'ไม่สามารถอัปเดตสถานะได้ กรุณาลองใหม่อีกครั้ง',
        icon: 'error',
        confirmButtonText: 'ปิด',
        confirmButtonColor: '#a35d6a'
      });
    }
  };

  if (isLoading) return <div>กำลังโหลดคำสั่งซื้อ...</div>;

  return (
    <div>
      <h1 className="admin-page-title">จัดการคำสั่งซื้อ</h1>

      <div className="admin-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '15px', gap: '10px' }}>
          <input 
            type="text"
            placeholder="ค้นหา Order ID..."
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
              color: '#333',
              outline: 'none',
              width: '200px'
            }}
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #ccc',
              backgroundColor: '#fff',
              fontSize: '0.9rem',
              color: '#333',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="ทั้งหมด">คำสั่งซื้อทั้งหมด</option>
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID / วันที่</th>
                <th>ลูกค้า / จัดส่ง</th>
                <th>ยอดรวม</th>
                <th>สถานะ / EMS</th>
                <th>สลิปโอนเงิน</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let filteredOrders = orders;
                
                if (filterStatus !== 'ทั้งหมด') {
                  filteredOrders = filteredOrders.filter(order => order.status === filterStatus);
                }
                
                if (searchOrderId.trim()) {
                  filteredOrders = filteredOrders.filter(order => 
                    order.orderId.toLowerCase().includes(searchOrderId.trim().toLowerCase())
                  );
                }
                
                if (filteredOrders.length === 0) {
                  return (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>ไม่พบคำสั่งซื้อที่ค้นหา</td>
                    </tr>
                  );
                }

                return filteredOrders.map(order => {
                const isEditing = editingOrderId === order.orderId;
                


                const safeBuyer = typeof order.buyerInfo === 'string' ? JSON.parse(order.buyerInfo) : order.buyerInfo;
                const safeRecipient = typeof order.recipientInfo === 'string' ? JSON.parse(order.recipientInfo) : order.recipientInfo;

                return (
                  <tr key={order.orderId}>
                    <td>
                      <strong>{order.orderId}</strong><br/>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        {new Date(order.createdAt).toLocaleString('th-TH')}
                      </span>
                    </td>
                    <td>
                      {safeBuyer?.name || 'ไม่ระบุ'}<br/>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>โทร: {safeBuyer?.phone || '-'}</span><br/>
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        จัดส่ง: {safeRecipient?.address || '-'}
                      </span><br/>
                      {safeBuyer?.refundAccount && (
                        <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#e67e22', background: '#fdf3e8', padding: '4px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          <i className="fa-solid fa-money-check-dollar" style={{marginRight: '4px'}}></i>
                          บัญชีคืนเงิน: {safeBuyer.refundAccount}
                        </div>
                      )}<br/>
                      {order.cancelReason && (
                        <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#c0392b', background: '#fadbd8', padding: '4px 6px', borderRadius: '4px', display: 'inline-block' }}>
                          <i className="fa-solid fa-circle-exclamation" style={{marginRight: '4px'}}></i>
                          เหตุผลที่ยกเลิก: {order.cancelReason}
                        </div>
                      )}
                      {(() => {
                        const safeItems = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
                        return safeItems.length > 0 && (
                          <div style={{ marginTop: '6px', fontSize: '0.8rem', color: '#475569' }}>
                            {safeItems.map((item, idx) => (
                              <div key={idx}>
                                • {item.name} x{item.quantity}
                                {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                                  <span style={{ color: '#888' }}> ({Object.values(item.selectedOptions).join(', ')})</span>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td>฿{(order.totalAmount || 0).toLocaleString()}</td>
                    <td>
                      {isEditing ? (
                        <>
                          <select 
                            className="edit-select"
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            {getAvailableStatuses(order.status).map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          <input 
                            type="text" 
                            className="edit-input" 
                            placeholder="เลขพัสดุ EMS" 
                            value={editTracking}
                            onChange={(e) => setEditTracking(e.target.value)}
                          />
                        </>
                      ) : (
                        <>
                          <span className={`status-badge ${
                            order.status === 'จัดส่งแล้ว' ? 'status-delivered' :
                            order.status === 'ชำระเงินแล้ว' ? 'status-paid' :
                            order.status === 'กำลังจัดเตรียมสินค้า' ? 'status-preparing' :
                            order.status === 'กำลังตรวจสอบการชำระเงิน' ? 'status-checking' :
                            order.status === 'รอคืนเงิน' ? 'status-refund' :
                            order.status === 'คืนเงินสำเร็จ' ? 'status-refund-success' :
                            order.status === 'ยกเลิกคำสั่งซื้อ' ? 'status-cancelled' :
                            'status-pending'
                          }`}>
                            {order.status || 'รอดำเนินการ'}
                          </span>
                          {order.trackingNumber && (
                            <div style={{ marginTop: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              <i className="fa-solid fa-truck"></i> {order.trackingNumber}
                            </div>
                          )}
                        </>
                      )}
                    </td>
                    <td>
                      {order.payment?.slipUrl ? (
                        <a href={`${order.payment.slipUrl}`} target="_blank" rel="noreferrer" className="slip-link">
                          <i className="fa-regular fa-image"></i> ดูสลิป
                        </a>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                      )}
                    </td>
                    <td>
                      {isEditing ? (
                        <>
                          <button className="btn-sm btn-save" onClick={() => handleSave(order.orderId)}>บันทึก</button>
                          <button className="btn-sm btn-cancel" onClick={handleCancelEdit}>ยกเลิก</button>
                        </>
                      ) : (
                        <button className="btn-sm btn-edit" onClick={() => handleEditClick(order)}>
                          <i className="fa-solid fa-pen"></i> แก้ไข
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })})()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
