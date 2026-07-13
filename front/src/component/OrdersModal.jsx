import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function OrdersModal({ isOpen, onClose, user }) {
  const [viewState, setViewState] = useState('list'); // 'list' | 'detail'
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && user.id) {
      fetchOrders();
    }
  }, [isOpen, user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/orders/user/${user.id}`);
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setViewState('detail');
  };

  const handleBackToList = () => {
    setViewState('list');
    setSelectedOrder(null);
  };

  const handleClose = () => {
    setViewState('list');
    setSelectedOrder(null);
    onClose();
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} id="ordersModal">
      <div className="modal-overlay" id="ordersModalOverlay" onClick={handleClose}></div>
      <div className="modal-content orders-modal-content">
        <button className="modal-close" id="ordersCloseBtn" onClick={handleClose} aria-label="Close Orders">
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Orders List View */}
        {viewState === 'list' && (
          <div id="ordersListView">
            <h2 className="orders-modal-title">คำสั่งซื้อ</h2>
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>กำลังโหลด...</p>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>ไม่มีประวัติคำสั่งซื้อ</p>
            ) : (
              <div className="orders-table-wrapper">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>รายละเอียด</th>
                      <th>สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr 
                        key={order.orderId} 
                        className="order-row" 
                        onClick={() => handleOrderClick(order)} 
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{order.orderId}</td>
                        <td>
                          {(order.items || []).map((item, idx) => (
                            <div key={idx}>{item.name} x{item.quantity}</div>
                          ))}
                        </td>
                        <td>{order.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Order Detail View */}
        {viewState === 'detail' && selectedOrder && (
          <div id="orderDetailView">
            <h2 className="orders-modal-title">รายละเอียดคำสั่งซื้อ</h2>

            <div className="order-detail-section">
              <h3 className="order-detail-heading">Order details — {selectedOrder.orderId}</h3>
              <table className="order-detail-table">
                <tbody>
                  <tr>
                    <td>รายละเอียดสินค้า</td>
                    <td className="text-right">ยอดรวม</td>
                  </tr>
                  {(selectedOrder.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name} x{item.quantity}</td>
                      <td className="text-right">{(item.price * item.quantity).toLocaleString()} ฿</td>
                    </tr>
                  ))}
                  <tr>
                    <td>ค่าจัดส่ง (EMS)</td>
                    <td className="text-right">{selectedOrder.shippingFee || 100} ฿</td>
                  </tr>
                  <tr>
                    <td>Payment method</td>
                    <td className="text-right">{selectedOrder.payment?.method || 'N/A'}</td>
                  </tr>
                  <tr className="order-total-row">
                    <td><strong>Total:</strong></td>
                    <td className="text-right"><strong>{selectedOrder.totalAmount?.toLocaleString()} ฿</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="order-detail-section">
              <h3 className="order-detail-heading">Customer details</h3>
              <p>ชื่อผู้สั่งซื้อ: {selectedOrder.buyerInfo?.name || '-'}</p>
              <p>เบอร์โทร: {selectedOrder.buyerInfo?.phone || '-'}</p>
              <p>ชื่อผู้รับ: {selectedOrder.recipientInfo?.name || '-'}</p>
              <p>ที่อยู่จัดส่ง: {selectedOrder.recipientInfo?.address || '-'}</p>
              {selectedOrder.cardMessage && <p>ข้อความการ์ด: {selectedOrder.cardMessage}</p>}
            </div>

            <div className="order-detail-section order-tracking-section">
              <div className="order-tracking-row">
                <span>สถานะ</span>
                <span style={{ fontWeight: 'bold' }}>{selectedOrder.status}</span>
              </div>
              <div className="order-tracking-row">
                <span>เลขพัสดุ (Tracking Number)</span>
                <span className="tracking-number">{selectedOrder.trackingNumber || 'ยังไม่มีเลขพัสดุ'}</span>
              </div>
            </div>

            <button className="orders-back-btn" onClick={handleBackToList}>
              <i className="fa-solid fa-arrow-left"></i> กลับไปรายการคำสั่งซื้อ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
