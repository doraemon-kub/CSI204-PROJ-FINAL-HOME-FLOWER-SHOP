import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminOrders.css';
const API_URL = '/api';

const STATUS_OPTIONS = [
  'กำลังตรวจสอบการชำระเงิน',
  'ชำระเงินแล้ว',
  'กำลังจัดเตรียมสินค้า',
  'จัดส่งแล้ว',
  'รอคืนเงิน',
  'ยกเลิกคำสั่งซื้อ'
];

export default function AdminOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
      alert('อัปเดตสถานะสำเร็จ!');
      setEditingOrderId(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order', err);
      alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
    }
  };

  if (isLoading) return <div>กำลังโหลดคำสั่งซื้อ...</div>;

  return (
    <div>
      <h1 className="admin-page-title">จัดการคำสั่งซื้อ</h1>

      <div className="admin-card">


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
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>ไม่มีคำสั่งซื้อ</td>
                </tr>
              ) : orders.map(order => {
                const isEditing = editingOrderId === order.orderId;
                
                // Determine badge color
                let badgeClass = '';
                if (order.status?.includes('ชำระเงินแล้ว') || order.status?.includes('จัดส่งแล้ว')) badgeClass = 'success';
                else if (order.status?.includes('ยกเลิก')) badgeClass = 'danger';
                else if (order.status?.includes('กำลังจัดเตรียม')) badgeClass = 'info';
                else badgeClass = 'warning';

                const safeBuyer = typeof order.buyerInfo === 'string' ? JSON.parse(order.buyerInfo) : order.buyerInfo;

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
                      <span style={{ fontSize: '0.8rem', color: '#64748b' }}>โทร: {safeBuyer?.phone || '-'}</span>
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
                            {STATUS_OPTIONS.map(opt => (
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
                        <a href={`http://localhost:3000${order.payment.slipUrl}`} target="_blank" rel="noreferrer" className="slip-link">
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
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
