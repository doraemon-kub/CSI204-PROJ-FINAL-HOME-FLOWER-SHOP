import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

// Backend อาจส่งบาง field (เช่น items, buyerInfo, recipientInfo, payment)
// กลับมาเป็น JSON string แทนที่จะเป็น object/array ที่ parse แล้ว
// ฟังก์ชันนี้ช่วยแปลงให้ปลอดภัย ป้องกันหน้าเว็บพังเป็นจอขาว
function safeParse(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  }
  return value;
}

function normalizeOrder(order) {
  if (!order || typeof order !== 'object') return order;
  return {
    ...order,
    items: Array.isArray(order.items) ? order.items : safeParse(order.items, []),
    buyerInfo: safeParse(order.buyerInfo, {}),
    recipientInfo: safeParse(order.recipientInfo, {}),
    payment: safeParse(order.payment, {}),
  };
}

// สถานะบางค่ามีช่องว่างแปลกปนมากับข้อมูลจริง (ไม่ใช่ปัญหา CSS) เช่น
// "กำ ลังตรวจสอบการชำ ระเงิน" -> ต้องตัดช่องว่างส่วนเกินออกก่อนแสดงผล
function cleanThaiText(text) {
  if (typeof text !== 'string') return text;
  return text.replace(/\s+/g, '');
}

export default function OrdersModal({ isOpen, onClose, user }) {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
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
      // รองรับทั้งกรณี backend ส่ง array ตรงๆ หรือห่อไว้ใน { orders: [...] }
      const raw = Array.isArray(response.data)
        ? response.data
        : (Array.isArray(response.data?.orders) ? response.data.orders : []);
      setOrders(raw.map(normalizeOrder));
    } catch (err) {
      console.error('Failed to fetch orders', err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderClick = (order, idx) => {
    const rowKey = order.orderId || idx;
    setExpandedOrderId((prev) => (prev === rowKey ? null : rowKey));
  };

  const handleClose = () => {
    setExpandedOrderId(null);
    onClose();
  };

  const handleTrackPackage = (order, e) => {
    e.stopPropagation();
    const trackingNumber = order?.trackingNumber;
    const url = trackingNumber
      ? `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingNumber)}`
      : 'https://track.thailandpost.co.th/';
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="modal open" id="ordersModal" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <style>{`
        @keyframes ordersPopupSlideDown {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .orders-popup-content {
          animation: ordersPopupSlideDown 0.28s cubic-bezier(0.16, 1, 0.3, 1);
          margin-top: 90px;
        }
        .track-package-btn {
          background-color: #b76e79;
          color: #fff;
          border: none;
          padding: 8px 18px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 6px rgba(183, 110, 121, 0.2);
        }
        .track-package-btn:hover {
          background-color: #a15c67;
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(183, 110, 121, 0.3);
        }
        .track-package-btn:active {
          transform: translateY(0);
        }
        .order-row {
          cursor: pointer;
          transition: background 0.15s ease;
        }
        .order-row:hover {
          background: var(--light-bg, #f9f5f5);
        }
        .order-row-chevron {
          transition: transform 0.25s ease;
          color: var(--primary, #b76e79);
        }
        .order-row-chevron.open {
          transform: rotate(180deg);
        }
        .order-detail-row td {
          padding: 0 !important;
          border-top: none !important;
        }
        .order-detail-collapse {
          max-height: 0px;
          overflow: hidden;
          transition: max-height 0.35s ease;
          background: #fcfafa;
        }
        .order-detail-collapse.open {
          max-height: 1200px;
        }
        .order-detail-inner {
          padding: 20px 24px 28px;
        }
      `}</style>
      <div className="modal-overlay" id="ordersModalOverlay" onClick={handleClose}></div>
      <div className="modal-content orders-modal-content orders-popup-content">
        <button className="modal-close" id="ordersCloseBtn" onClick={handleClose} aria-label="Close Orders">
          <i className="fa-solid fa-xmark"></i>
        </button>

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
                    <th style={{ width: '32px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, orderIdx) => {
                    const rowKey = order.orderId || orderIdx;
                    const isOpen = expandedOrderId === rowKey;
                    const items = Array.isArray(order.items) ? order.items : [];
                    const shippingFee = Number(order.shippingFee) || 100;

                    return (
                      <React.Fragment key={rowKey}>
                        <tr
                          className="order-row"
                          onClick={() => handleOrderClick(order, orderIdx)}
                          aria-expanded={isOpen}
                        >
                          <td style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}>{order.orderId}</td>
                          <td style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}>
                            {items.map((item, idx) => (
                              <div key={idx}>{item?.name || 'สินค้า'} x{Number(item?.quantity) || 0}</div>
                            ))}
                          </td>
                          <td style={{ letterSpacing: 'normal', wordSpacing: 'normal' }}>{cleanThaiText(order.status)}</td>
                          <td style={{ textAlign: 'center' }}>
                            <i className={`fa-solid fa-chevron-down order-row-chevron ${isOpen ? 'open' : ''}`}></i>
                          </td>
                        </tr>

                        <tr className="order-detail-row">
                          <td colSpan={4}>
                            <div className={`order-detail-collapse ${isOpen ? 'open' : ''}`}>
                              <div className="order-detail-inner">
                                <div className="order-detail-section">
                                  <h3 className="order-detail-heading">Order details — {order.orderId}</h3>
                                  <table className="order-detail-table">
                                    <tbody>
                                      <tr>
                                        <td>รายละเอียดสินค้า</td>
                                        <td className="text-right">ยอดรวม</td>
                                      </tr>
                                      {items.map((item, idx) => {
                                        const qty = Number(item?.quantity) || 0;
                                        const price = Number(item?.price) || 0;
                                        return (
                                          <tr key={idx}>
                                            <td>{item?.name || 'สินค้า'} x{qty}</td>
                                            <td className="text-right">{(price * qty).toLocaleString()} ฿</td>
                                          </tr>
                                        );
                                      })}
                                      <tr>
                                        <td>ค่าจัดส่ง (EMS)</td>
                                        <td className="text-right">{shippingFee} ฿</td>
                                      </tr>
                                      <tr>
                                        <td>Payment method</td>
                                        <td className="text-right">{order.payment?.method || 'N/A'}</td>
                                      </tr>
                                      <tr className="order-total-row">
                                        <td><strong>Total:</strong></td>
                                        <td className="text-right"><strong>{(Number(order.totalAmount) || 0).toLocaleString()} ฿</strong></td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>

                                <div className="order-detail-section">
                                  <h3 className="order-detail-heading">Customer details</h3>
                                  <p>ชื่อผู้สั่งซื้อ: {order.buyerInfo?.name || '-'}</p>
                                  <p>เบอร์โทร: {order.buyerInfo?.phone || '-'}</p>
                                  <p>ชื่อผู้รับ: {order.recipientInfo?.name || '-'}</p>
                                  <p>ที่อยู่จัดส่ง: {order.recipientInfo?.address || '-'}</p>
                                  {order.cardMessage && <p>ข้อความการ์ด: {order.cardMessage}</p>}
                                </div>

                                <div className="order-detail-section order-tracking-section">
                                  <div className="order-tracking-row">
                                    <span>สถานะ</span>
                                    <span style={{ fontWeight: 'bold', letterSpacing: 'normal', wordSpacing: 'normal' }}>{cleanThaiText(order.status)}</span>
                                  </div>
                                  <div className="order-tracking-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                                    <span>เลขพัสดุ (Tracking Number)</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
                                      {order.trackingNumber ? (
                                        <span style={{
                                          fontWeight: 'bold',
                                          fontSize: '0.95rem',
                                          color: 'var(--text-dark, #665342)',
                                          letterSpacing: '0.5px',
                                          userSelect: 'all',
                                          cursor: 'text',
                                          background: 'var(--light-bg, #f9f5f5)',
                                          padding: '6px 14px',
                                          borderRadius: '8px',
                                          border: '1px solid var(--border-color, #e2d9c9)'
                                        }}>
                                          เลขพัสดุ: {order.trackingNumber}
                                        </span>
                                      ) : (
                                        <span style={{
                                          fontSize: '0.88rem',
                                          color: '#a89a89',
                                          fontStyle: 'italic'
                                        }}>
                                          รอเลขพัสดุ
                                        </span>
                                      )}
                                      <button className="track-package-btn" onClick={(e) => handleTrackPackage(order, e)}>
                                        <i className="fa-solid fa-truck-fast" style={{ marginRight: '6px' }}></i>
                                        ติดตามพัสดุ
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
