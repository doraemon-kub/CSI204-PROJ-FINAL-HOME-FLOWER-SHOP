import React, { useState } from 'react';

export default function OrdersModal({ isOpen, onClose }) {
  const [viewState, setViewState] = useState('list'); // 'list' | 'detail'

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} id="ordersModal">
      <div className="modal-overlay" id="ordersModalOverlay" onClick={onClose}></div>
      <div className="modal-content orders-modal-content">
        <button className="modal-close" id="ordersCloseBtn" onClick={onClose} aria-label="Close Orders">
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* Orders List View */}
        {viewState === 'list' && (
          <div id="ordersListView">
            <h2 className="orders-modal-title">คำสั่งซื้อ</h2>
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
                  <tr className="order-row" onClick={() => setViewState('detail')} style={{ cursor: 'pointer' }}>
                    <td>#1234567890</td>
                    <td>Basic 1,<br />Custom 1</td>
                    <td>กำลังจัดส่ง/<br />สำเร็จแล้ว</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Order Detail View */}
        {viewState === 'detail' && (
          <div id="orderDetailView">
            <h2 className="orders-modal-title">รายละเอียดคำสั่งซื้อ</h2>

            <div className="order-detail-section">
              <h3 className="order-detail-heading">Order details</h3>
              <table className="order-detail-table">
                <tbody>
                  <tr>
                    <td>รายละเอียดสินค้า</td>
                    <td className="text-right">ยอดรวม</td>
                  </tr>
                  <tr>
                    <td>Basic 1</td>
                    <td className="text-right">1000 ฿</td>
                  </tr>
                  <tr>
                    <td>Custom 1</td>
                    <td className="text-right">650 ฿</td>
                  </tr>
                  <tr>
                    <td>ค่าจัดส่ง (ems)</td>
                    <td className="text-right">100 ฿</td>
                  </tr>
                  <tr>
                    <td>Payment method/Promptpay (QRcode)</td>
                    <td className="text-right">Promptpay (QRcode)</td>
                  </tr>
                  <tr className="order-total-row">
                    <td><strong>Total:</strong></td>
                    <td className="text-right"><strong>1750 ฿</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="order-detail-section">
              <h3 className="order-detail-heading">Customer details</h3>
              <p>ชื่อจริง</p>
              <p>ที่อยู่</p>
              <p>เบอร์โทร</p>
            </div>

            <div className="order-detail-section order-tracking-section">
              <div className="order-tracking-row">
                <span>เลขพัสดุ (Tracking Number)</span>
                <span className="tracking-number">ED123456789TH</span>
              </div>
            </div>

            <button className="orders-back-btn" onClick={() => setViewState('list')}>
              <i className="fa-solid fa-arrow-left"></i> กลับไปรายการคำสั่งซื้อ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
