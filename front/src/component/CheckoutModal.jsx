import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart,
  user,
  onCartUpdated
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  
  // Checkout form states
  const [buyerName, setBuyerName] = useState(user?.name || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [paymentTime, setPaymentTime] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = 100;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsCheckingOut(true);
    try {
      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('cartItems', JSON.stringify(cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }))));
      formData.append('buyerInfo', JSON.stringify({ 
        name: buyerName, 
        phone: buyerPhone, 
        email: buyerEmail 
      }));
      formData.append('recipientInfo', JSON.stringify({ 
        name: recipientName, 
        address: recipientAddress, 
        phone: recipientPhone 
      }));
      formData.append('cardMessage', cardMessage);
      formData.append('paymentMethod', 'Promptpay (QRcode)');
      formData.append('paymentTime', paymentTime);
      formData.append('totalAmount', totalPrice + shippingFee);

      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      }

      const response = await axios.post(`${API_URL}/orders/checkout`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(`สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: ${response.data.order.orderId}`);
      
      // Reset form
      setBuyerName(user?.name || '');
      setBuyerPhone(user?.phone || '');
      setBuyerEmail(user?.email || '');
      setRecipientName('');
      setRecipientAddress('');
      setRecipientPhone('');
      setCardMessage('');
      setPaymentSlip(null);
      setPaymentTime('');
      
      // Refresh cart (should be empty now)
      if (onCartUpdated) onCartUpdated();
      onClose();
    } catch (err) {
      console.error('Checkout failed', err);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่');
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} id="checkoutModal">
      <div className="modal-overlay" id="checkoutModalOverlay" onClick={onClose}></div>
      <div className="modal-content checkout-modal-content">
        <button className="modal-close" id="checkoutCloseBtn" onClick={onClose} aria-label="Close Checkout">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--primary-dark)' }}>
          ส่งสินค้าและชำระเงิน
        </h2>

        <form onSubmit={handleCheckoutSubmit} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Left Column */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: '600' }}>
                ข้อมูลผู้สั่งซื้อ
              </h4>
              <div className="form-group">
                <label>ชื่อผู้สั่งซื้อ *</label>
                <input 
                  type="text" 
                  value={buyerName} 
                  onChange={e => setBuyerName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>เบอร์โทรผู้สั่งซื้อ *</label>
                <input 
                  type="tel" 
                  value={buyerPhone} 
                  onChange={e => setBuyerPhone(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>E-mail *</label>
                <input 
                  type="email" 
                  value={buyerEmail} 
                  onChange={e => setBuyerEmail(e.target.value)} 
                  required 
                />
              </div>

              <h4 style={{ marginBottom: '12px', marginTop: '20px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: '600' }}>
                ข้อมูลผู้รับ
              </h4>
              <div className="form-group">
                <label>ชื่อผู้รับ *</label>
                <input 
                  type="text" 
                  value={recipientName} 
                  onChange={e => setRecipientName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>เบอร์โทรผู้รับ *</label>
                <input 
                  type="tel" 
                  value={recipientPhone} 
                  onChange={e => setRecipientPhone(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>ที่อยู่จัดส่ง *</label>
                <textarea 
                  value={recipientAddress} 
                  onChange={e => setRecipientAddress(e.target.value)} 
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--border-color)', 
                    fontFamily: 'inherit', 
                    minHeight: '60px',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>

            {/* Right Column */}
            <div>
              <h4 style={{ marginBottom: '12px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: '600' }}>
                รายละเอียดสินค้า
              </h4>
              <div style={{
                background: 'var(--light-bg)',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '16px',
                maxHeight: '150px',
                overflowY: 'auto'
              }}>
                {cart.map((item) => (
                  <div key={item.cartItemId || item.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingBottom: '8px',
                    marginBottom: '8px',
                    borderBottom: '1px solid var(--border-color)'
                  }}>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{item.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
                        × {item.quantity}
                      </div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)', fontSize: '0.9rem' }}>
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <h4 style={{ marginBottom: '12px', color: 'var(--primary-dark)', fontSize: '0.95rem', fontWeight: '600' }}>
                ข้อมูลการชำระเงิน
              </h4>
              <div className="form-group">
                <label>วิธีชำระเงิน</label>
                <div style={{
                  padding: '12px',
                  background: 'var(--light-bg)',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-solid fa-qrcode"></i>
                  <span>Promptpay (QRcode)</span>
                </div>
              </div>
              <div className="form-group">
                <label>เวลาที่โอนเงิน *</label>
                <input 
                  type="datetime-local" 
                  value={paymentTime} 
                  onChange={e => setPaymentTime(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>อัปโหลดสลิปการโอน</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setPaymentSlip(e.target.files[0])} 
                  style={{ fontSize: '0.9rem' }}
                />
              </div>

              <div className="form-group">
                <label>ข้อความในการ์ด (ถ้ามี)</label>
                <input 
                  type="text" 
                  value={cardMessage} 
                  onChange={e => setCardMessage(e.target.value)} 
                  placeholder="ไม่บังคับ" 
                />
              </div>
            </div>
          </div>

          {/* Summary Section */}
          <div style={{
            borderTop: '2px solid var(--border-color)',
            paddingTop: '16px',
            marginTop: '20px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '8px',
              fontSize: '0.95rem'
            }}>
              <span>ค่าสินค้า:</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              fontSize: '0.95rem'
            }}>
              <span>ค่าจัดส่ง (EMS):</span>
              <span>฿{shippingFee}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 'bold',
              fontSize: '1.2rem',
              color: 'var(--primary)'
            }}>
              <span>รวมทั้งสิ้น:</span>
              <span>฿{(totalPrice + shippingFee).toLocaleString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn btn-block"
              style={{ background: 'var(--border-color)', color: 'var(--text-dark)' }}
            >
              ยกเลิก
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-block" 
              disabled={isCheckingOut}
            >
              {isCheckingOut ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
