import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  user,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem,
  onCartUpdated
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // 'cart' | 'checkout'
  
  // Checkout form states
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [paymentTime, setPaymentTime] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleProceedToCheckout = () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าใส่ตะกร้าก่อนดำเนินการสั่งซื้อ');
      return;
    }
    // Pre-fill buyer info from user
    if (user) {
      setBuyerName(user.name || '');
      setBuyerPhone(user.phone || '');
    }
    setCheckoutStep('checkout');
  };

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
      formData.append('buyerInfo', JSON.stringify({ name: buyerName, phone: buyerPhone }));
      formData.append('recipientInfo', JSON.stringify({ name: recipientName, address: recipientAddress, phone: recipientPhone }));
      formData.append('cardMessage', cardMessage);
      formData.append('paymentMethod', 'Promptpay (QRcode)');
      formData.append('paymentTime', paymentTime);
      formData.append('totalAmount', totalPrice + 100); // + shipping

      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      }

      const response = await axios.post(`${API_URL}/orders/checkout`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert(`สั่งซื้อสำเร็จ! หมายเลขคำสั่งซื้อ: ${response.data.order.orderId}`);
      
      // Reset form
      setCheckoutStep('cart');
      setBuyerName('');
      setBuyerPhone('');
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

  const handleClose = () => {
    setCheckoutStep('cart');
    onClose();
  };

  return (
    <div className={`cart-drawer ${isOpen ? 'open' : ''}`} id="cartDrawer">
      <div className="cart-drawer-overlay" id="cartDrawerOverlay" onClick={handleClose}></div>
      <div className="cart-drawer-content">
        <div className="cart-header">
          <h3>{checkoutStep === 'cart' ? 'ตะกร้าสินค้าของคุณ' : 'ชำระเงิน'}</h3>
          <button className="cart-close" id="cartCloseBtn" onClick={handleClose} aria-label="Close Cart">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {checkoutStep === 'cart' && (
          <>
            <div className="cart-items" id="cartItemsContainer">
              {cart.length === 0 ? (
                <div className="empty-cart-message">
                  <i className="fa-solid fa-basket-shopping"></i>
                  <p>ยังไม่มีสินค้าในตะกร้า</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div className="cart-item" key={item.cartItemId || item.id}>
                    <img 
                      src={item.img || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop'} 
                      alt={item.name} 
                      className="cart-item-img" 
                    />
                    <div className="cart-item-details">
                      <h4 className="cart-item-title">{item.name}</h4>
                      <p className="cart-item-price">฿{item.price.toLocaleString()}</p>
                      <div className="cart-item-quantity">
                        <button 
                          className="qty-btn dec-qty" 
                          onClick={() => onDecreaseQty(item.id)}
                        >
                          <i className="fa-solid fa-minus"></i>
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          className="qty-btn inc-qty" 
                          onClick={() => onIncreaseQty(item.id)}
                        >
                          <i className="fa-solid fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <button 
                      className="cart-item-remove remove-btn" 
                      onClick={() => onRemoveItem(item.id)}
                      aria-label="Remove item"
                    >
                      <i className="fa-regular fa-trash-can"></i>
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-summary">
              <div className="cart-total">
                <span>ราคารวมทั้งหมด:</span>
                <span id="cartTotalAmount">฿{totalPrice.toLocaleString()}</span>
              </div>
              <button onClick={handleProceedToCheckout} className="btn btn-primary btn-block checkout-btn">
                ดำเนินการสั่งซื้อ
              </button>
            </div>
          </>
        )}

        {checkoutStep === 'checkout' && (
          <form onSubmit={handleCheckoutSubmit} style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--primary-dark)' }}>ข้อมูลผู้สั่งซื้อ</h4>
            <div className="form-group">
              <label>ชื่อผู้สั่งซื้อ</label>
              <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>เบอร์โทรผู้สั่งซื้อ</label>
              <input type="tel" value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} required />
            </div>

            <h4 style={{ marginBottom: '12px', marginTop: '16px', color: 'var(--primary-dark)' }}>ข้อมูลผู้รับ</h4>
            <div className="form-group">
              <label>ชื่อผู้รับ</label>
              <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>ที่อยู่จัดส่ง</label>
              <textarea value={recipientAddress} onChange={e => setRecipientAddress(e.target.value)} required 
                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--border-color)', fontFamily: 'inherit', minHeight: '60px' }}
              />
            </div>
            <div className="form-group">
              <label>เบอร์โทรผู้รับ</label>
              <input type="tel" value={recipientPhone} onChange={e => setRecipientPhone(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>ข้อความในการ์ด (ถ้ามี)</label>
              <input type="text" value={cardMessage} onChange={e => setCardMessage(e.target.value)} placeholder="ไม่บังคับ" />
            </div>

            <h4 style={{ marginBottom: '12px', marginTop: '16px', color: 'var(--primary-dark)' }}>การชำระเงิน</h4>
            <div className="form-group">
              <label>เวลาที่โอนเงิน</label>
              <input type="datetime-local" value={paymentTime} onChange={e => setPaymentTime(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>อัปโหลดสลิปการโอน</label>
              <input type="file" accept="image/*" onChange={e => setPaymentSlip(e.target.files[0])} />
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>ค่าสินค้า:</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>ค่าจัดส่ง (EMS):</span>
                <span>฿100</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem', marginTop: '8px' }}>
                <span>รวมทั้งสิ้น:</span>
                <span>฿{(totalPrice + 100).toLocaleString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setCheckoutStep('cart')} className="btn btn-block"
                style={{ background: 'var(--border-color)', color: 'var(--text-dark)' }}>
                ← กลับ
              </button>
              <button type="submit" className="btn btn-primary btn-block" disabled={isCheckingOut}>
                {isCheckingOut ? 'กำลังสั่งซื้อ...' : 'ยืนยันสั่งซื้อ'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
