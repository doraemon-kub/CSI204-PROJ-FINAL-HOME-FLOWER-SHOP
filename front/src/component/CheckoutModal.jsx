import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = '/api';

export default function CheckoutModal({
  isOpen,
  onClose,
  cart = [], // ป้องกันเว็บพังหากตะกร้าสินค้าว่างเปล่า
  user,
  onCartUpdated
}) {
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); // ควบคุมการเปิดปิด Custom Success Modal
  const [orderId, setOrderId] = useState(''); // เก็บ Order ID ที่ได้รับกลับมาแสดงผล
  const fileInputRef = useRef(null);
  
  // Checkout form states
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [cardMessage, setCardMessage] = useState('');
  const [paymentSlip, setPaymentSlip] = useState(null);
  const [paymentTime, setPaymentTime] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('new');

  // โหลดข้อมูลผู้เข้าใช้งานเข้าฟอร์มฝั่งซ้ายอัตโนมัติ
  useEffect(() => {
    if (user && isOpen) {
      setBuyerName(user.name || '');
      setBuyerPhone(user.phone || '');
      setBuyerEmail(user.email || '');

      if (user.addresses && user.addresses.length > 0) {
        const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
        setRecipientName(defaultAddr.name);
        setRecipientPhone(defaultAddr.phone);
        setRecipientAddress(defaultAddr.address);
        setSelectedAddressId(defaultAddr.id);
      } else {
        setSelectedAddressId('new');
        setRecipientName('');
        setRecipientPhone('');
        setRecipientAddress('');
      }
    }
  }, [user, isOpen]);

  // คำนวณราคาสินค้า
  const totalPrice = cart ? cart.reduce((sum, item) => sum + item.price * item.quantity, 0) : 0;
  const shippingFee = 100;

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ');
      return;
    }

    if (!paymentSlip) {
      alert('กรุณาแนบสลิปโอนเงินก่อนยืนยันคำสั่งซื้อ');
      return;
    }

    if (paymentTime) {
      const selectedTime = new Date(paymentTime).getTime();
      const currentTime = new Date().getTime();
      // Allow a 5-minute buffer for "current" time due to manual entry delays
      if (selectedTime < currentTime - 5 * 60 * 1000) {
        alert('เวลาโอนสลิปต้องเป็นเวลาปัจจุบันหรือในอนาคตเท่านั้น ห้ามระบุเวลาในอดีตที่ผ่านมาแล้ว');
        return;
      }
    } else {
      alert('กรุณาระบุเวลาที่โอนเงินตามสลิป');
      return;
    }

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
      formData.append('paymentMethod', 'Bank Transfer (Mock)');
      formData.append('paymentTime', paymentTime);
      formData.append('totalAmount', totalPrice + shippingFee);

      if (paymentSlip) {
        formData.append('paymentSlip', paymentSlip);
      }

      const response = await axios.post(`${API_URL}/orders/checkout`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const generatedId = response.data?.order?.orderId || response.data?.orderId || 'ไม่ระบุเลขที่';
      setOrderId(generatedId);
      
      // เคลียร์ตะกร้าบน Navbar ทันทีหลัง checkout สำเร็จ (ไม่ต้องรอกดปิด)
      if (onCartUpdated) onCartUpdated();
      
      setShowSuccess(true); // แสดงหน้าต่างสั่งซื้อสำเร็จแทนการใช้ Browser Alert
      
    } catch (err) {
      console.error('Checkout failed', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // ฟังก์ชันเคลียร์ค่าในฟอร์มเมื่อกดยืนยันปิดหน้าต่างสำเร็จ
  const handleCloseSuccess = () => {
    setBuyerName(user?.name || '');
    setBuyerPhone(user?.phone || '');
    setBuyerEmail(user?.email || '');
    setRecipientName('');
    setRecipientAddress('');
    setRecipientPhone('');
    setCardMessage('');
    setPaymentSlip(null);
    setPaymentTime('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setShowSuccess(false);
    setOrderId('');
    if (onCartUpdated) onCartUpdated();
    onClose();
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation(); // หลีกเลี่ยงเหตุการณ์คลิกซ้ำซ้อนของ Input File
    setPaymentSlip(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  // คลาสสไตล์หลักของกล่องกรอกข้อมูล
  const inputStyle = {
    width: '100%',
    height: '42px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1.5px solid #cbd5e1',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.15s ease'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.82rem',
    fontWeight: '600',
    color: '#475569',
    marginBottom: '6px'
  };

  // ------------------------------------------
  // 1. หน้าจอตอนสั่งซื้อสำเร็จ (Custom Success Modal)
  // ------------------------------------------
  if (showSuccess) {
    return (
      <div className="modal open" id="checkoutSuccessModal">
        <div className="modal-overlay" onClick={handleCloseSuccess}></div>
        <div 
          className="modal-content"
          style={{
            maxWidth: '440px',
            width: '90%',
            padding: '40px 32px',
            borderRadius: '16px',
            background: '#ffffff',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            boxSizing: 'border-box'
          }}
        >
          {/* แอนิเมชันวงกลมติ๊กถูก */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#f0fdf4',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            border: '2px solid #bbf7d0'
          }}>
            <i className="fa-solid fa-check" style={{ fontSize: '2.8rem', color: '#22c55e' }}></i>
          </div>
          
          <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: '#0f172a', marginBottom: '10px' }}>
            สั่งซื้อสินค้าสำเร็จแล้ว!
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '28px', lineHeight: '1.6' }}>
            เราได้รับข้อมูลการโอนเงินและรายการของเรียบร้อยแล้ว <br />
            หมายเลขการสั่งซื้อของคุณคือ: <br />
            <span style={{ 
              display: 'inline-block',
              marginTop: '10px',
              padding: '6px 16px',
              background: '#f1f5f9',
              borderRadius: '20px',
              fontSize: '1rem', 
              fontWeight: '700', 
              color: 'var(--primary)',
              letterSpacing: '0.5px' 
            }}>
              #{orderId}
            </span>
          </p>

          <button 
            onClick={handleCloseSuccess}
            style={{
              width: '100%',
              height: '46px',
              background: 'var(--primary)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(220,38,38,0.25)', // เสริมเงาปุ่มสีแบรนด์
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--primary-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'var(--primary)'}
          >
            ตกลง
          </button>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // 2. หน้าฟอร์มการทำรายการสั่งซื้อ (Main Checkout Form)
  // ------------------------------------------
  return (
    <div className="modal open" id="checkoutModal">
      <div className="modal-overlay" id="checkoutModalOverlay" onClick={onClose}></div>
      <div 
        className="modal-content checkout-modal-content"
        style={{
          maxWidth: '1000px',
          width: '95%',
          padding: '28px',
          borderRadius: '16px',
          background: '#ffffff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          boxSizing: 'border-box'
        }}
      >
        <button className="modal-close" id="checkoutCloseBtn" onClick={onClose} aria-label="Close Checkout">
          <i className="fa-solid fa-xmark"></i>
        </button>

        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: '24px', 
          color: 'var(--primary-dark)',
          fontWeight: '700',
          fontSize: '1.5rem',
          letterSpacing: '-0.3px'
        }}>
          ส่งสินค้าและชำระเงิน
        </h2>

        <form onSubmit={handleCheckoutSubmit} style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: '4px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            
            {/* คอลัมน์ซ้าย: ข้อมูลผู้ส่งและผู้รับ */}
            <div>
              {/* ข้อมูลผู้สั่งซื้อ */}
              <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '16px', marginBottom: '16px' }}>
                <h4 style={{ 
                  marginBottom: '12px', 
                  color: 'var(--primary-dark)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-regular fa-user" style={{ color: 'var(--primary)' }}></i>
                  ข้อมูลผู้สั่งซื้อ
                </h4>
                <div className="form-group" style={{ marginBottom: '12px' }}>
                  <label style={labelStyle}>ชื่อผู้สั่งซื้อ *</label>
                  <input 
                    type="text" 
                    value={buyerName} 
                    onChange={e => setBuyerName(e.target.value)} 
                    required 
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>เบอร์โทรผู้สั่งซื้อ *</label>
                    <input 
                      type="tel" 
                      value={buyerPhone} 
                      onChange={e => setBuyerPhone(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>E-mail *</label>
                    <input 
                      type="email" 
                      value={buyerEmail} 
                      onChange={e => setBuyerEmail(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* ข้อมูลผู้รับจัดส่ง */}
              <div>
                <h4 style={{ 
                  marginBottom: '12px', 
                  color: 'var(--primary-dark)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-solid fa-truck" style={{ color: 'var(--primary)' }}></i>
                  ข้อมูลผู้รับจัดส่ง
                </h4>

                {/* Dropdown สำหรับเลือกที่อยู่ที่บันทึกไว้ */}
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="form-group" style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>เลือกที่อยู่จัดส่ง</label>
                    <select
                      style={{
                        ...inputStyle,
                        paddingRight: '30px'
                      }}
                      value={selectedAddressId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedAddressId(val);
                        if (val === 'new') {
                          setRecipientName('');
                          setRecipientPhone('');
                          setRecipientAddress('');
                        } else {
                          const addr = user.addresses.find(a => a.id === val);
                          if (addr) {
                            setRecipientName(addr.name);
                            setRecipientPhone(addr.phone);
                            setRecipientAddress(addr.address);
                          }
                        }
                      }}
                    >
                      {user.addresses.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} - {a.address} {a.isDefault ? '(ค่าเริ่มต้น)' : ''}
                        </option>
                      ))}
                      <option value="new">+ ระบุที่อยู่ใหม่</option>
                    </select>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>ชื่อผู้รับ *</label>
                    <input 
                      type="text" 
                      value={recipientName} 
                      onChange={e => setRecipientName(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>เบอร์โทรผู้รับ *</label>
                    <input 
                      type="tel" 
                      value={recipientPhone} 
                      onChange={e => setRecipientPhone(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>ที่อยู่จัดส่ง *</label>
                  <textarea 
                    value={recipientAddress} 
                    onChange={e => setRecipientAddress(e.target.value)} 
                    required 
                    placeholder="ระบุบ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด และรหัสไปรษณีย์..."
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      borderRadius: '8px', 
                      border: '1.5px solid #cbd5e1', 
                      fontFamily: 'inherit', 
                      height: '82px',
                      resize: 'none',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* คอลัมน์ขวา: รายละเอียดรายการสั่งซื้อ & ช่องทางจ่ายเงิน */}
            <div>
              {/* รายการสินค้าที่สั่งซื้อ */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{ 
                  marginBottom: '10px', 
                  color: 'var(--primary-dark)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-solid fa-cart-shopping" style={{ color: 'var(--primary)' }}></i>
                  สรุปรายการสั่งซื้อ ({cart?.length || 0} รายการ)
                </h4>
                <div style={{
                  background: '#f8fafc',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1.5px solid #e2e8f0',
                  height: '110px', 
                  overflowY: 'auto',
                  boxSizing: 'border-box'
                }}>
                  {cart && cart.length > 0 ? (
                    cart.map((item) => (
                      <div key={item.cartItemId || item.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom: '1px solid #f1f5f9'
                      }}>
                        {/* 1. รูปพรีวิวสินค้าด้านซ้าย (ตามแบบ figma) */}
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '6px',
                          background: '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: '12px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          border: '1px solid #cbd5e1'
                        }}>
                          {item.image_url || item.imageUrl || item.image ? (
                            <img 
                              src={item.image_url || item.imageUrl || item.image} 
                              alt={item.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            // Fallback Icon หากไม่มีไฟล์ภาพสินค้า
                            <i className="fa-solid fa-fan" style={{ color: '#94a3b8', fontSize: '1.1rem' }}></i>
                          )}
                        </div>

                        {/* 2. ชื่อและรายละเอียดสินค้า */}
                        <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                          <div style={{ 
                            fontWeight: '600', 
                            fontSize: '0.85rem', 
                            color: '#1e293b',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {item.description || item.category || 'ช่อดอกไม้สดสำเร็จรูป'} • จำนวน: {item.quantity} ชิ้น
                          </div>
                        </div>

                        {/* 3. ราคารวมของแถวนี้ */}
                        <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.85rem', flexShrink: 0 }}>
                          ฿{(item.price * item.quantity).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.8rem', padding: '25px 0' }}>
                      ไม่มีรายการสินค้าในระบบ
                    </div>
                  )}
                </div>
              </div>

              {/* ส่วนชำระเงินและสลิปหลักฐาน */}
              <div>
                <h4 style={{ 
                  marginBottom: '10px', 
                  color: 'var(--primary-dark)', 
                  fontSize: '0.95rem', 
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <i className="fa-solid fa-wallet" style={{ color: 'var(--primary)' }}></i>
                  ช่องทางการโอนเงิน
                </h4>

                {/* รายละเอียดบัญชีธนาคาร */}
                <div style={{
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '8px',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.85rem', color: '#334155', marginBottom: '6px' }}>
                    <i className="fa-solid fa-building-columns" style={{ color: 'var(--primary)' }}></i>
                    <span>โอนผ่านบัญชีธนาคาร (จำลอง)</span>
                  </div>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.2fr',
                    gap: '4px',
                    fontSize: '0.8rem', 
                    color: '#475569',
                    borderTop: '1px solid #f1f5f9',
                    paddingTop: '6px'
                  }}>
                    <div><strong>ธนาคาร:</strong> กสิกรไทย (KBANK)</div>
                    <div><strong>ชื่อบัญชี:</strong> ร้านดอกไม้จำลอง</div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <strong>เลขบัญชี:</strong> <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#0f172a', letterSpacing: '0.5px' }}>012-3-45678-9</span>
                    </div>
                  </div>
                </div>

                {/* กล่องอัปโหลดสลิป และวันเวลาการโอนที่ได้ระนาบเดียวกัน */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  {/* กล่องเลือกรูปภาพสลิปการโอนเงิน */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>หลักฐานการโอนเงิน</label>
                    <div 
                      onClick={() => fileInputRef.current && fileInputRef.current.click()}
                      style={{
                        border: paymentSlip ? '1.5px solid #22c55e' : '1.5px dashed #cbd5e1',
                        borderRadius: '8px',
                        height: '42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: paymentSlip ? 'space-between' : 'center',
                        padding: '0 12px',
                        background: paymentSlip ? '#f0fdf4' : '#ffffff',
                        cursor: 'pointer',
                        boxSizing: 'border-box',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={(e) => { if(!paymentSlip) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                      onMouseLeave={(e) => { if(!paymentSlip) e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        accept="image/*" 
                        onChange={e => setPaymentSlip(e.target.files ? e.target.files[0] : null)} 
                        style={{ display: 'none' }}
                      />
                      {!paymentSlip ? (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#64748b', fontSize: '0.95rem', marginRight: '6px' }}></i>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '500' }}>แนบสลิปโอนเงิน</span>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', maxWidth: '75%', overflow: 'hidden' }}>
                            <i className="fa-solid fa-circle-check" style={{ color: '#22c55e', fontSize: '0.95rem' }}></i>
                            <span style={{ 
                              fontSize: '0.78rem', 
                              color: '#1e293b', 
                              fontWeight: '600',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {paymentSlip.name}
                            </span>
                          </div>
                          <button 
                            type="button" 
                            onClick={handleRemoveFile}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ef4444',
                              fontSize: '0.9rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '2px'
                            }}
                          >
                            <i className="fa-solid fa-xmark"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* เวลาที่โอนจริง */}
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label style={labelStyle}>เวลาโอนในสลิป *</label>
                    <input 
                      type="datetime-local" 
                      value={paymentTime} 
                      onChange={e => setPaymentTime(e.target.value)} 
                      required 
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* ข้อความประกอบบนการ์ดเสริม */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={labelStyle}>ข้อความบนการ์ดอวยพร (เพิ่มเติม)</label>
                  <input 
                    type="text" 
                    value={cardMessage} 
                    onChange={e => setCardMessage(e.target.value)} 
                    placeholder="เขียนข้อความสั้นๆ ติดกับช่อดอกไม้ (ไม่บังคับ)" 
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

          </div>

          {/* ตารางคำนวณเงินสุทธิ */}
          <div style={{
            borderTop: '1.5px dashed #cbd5e1',
            paddingTop: '14px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem', color: '#475569' }}>
              <span>รวมยอดค่าสินค้า:</span>
              <span style={{ fontWeight: '500' }}>฿{totalPrice.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', fontSize: '0.85rem', color: '#475569' }}>
              <span>ค่าจัดส่งพัสดุด่วนพิเศษ (EMS):</span>
              <span style={{ fontWeight: '500' }}>฿{shippingFee}</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: '800',
              fontSize: '1.3rem',
              color: 'var(--primary)',
              borderTop: '1px solid #f1f5f9',
              paddingTop: '10px',
              marginTop: '6px'
            }}>
              <span style={{ color: 'var(--text-dark)', fontSize: '1rem', fontWeight: '700' }}>ยอดชำระสุทธิ:</span>
              <span>฿{(totalPrice + shippingFee).toLocaleString()}</span>
            </div>
          </div>

          {/* แถบปุ่มปิดการขายและยกเลิกออเดอร์ */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{ 
                flex: 1,
                height: '44px',
                background: '#f1f5f9', 
                color: '#475569', 
                borderRadius: '8px', 
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
            >
              ยกเลิกการสั่งซื้อ
            </button>
            <button 
              type="submit" 
              disabled={isCheckingOut}
              style={{ 
                flex: 1,
                height: '44px',
                background: 'var(--primary)', 
                color: '#ffffff', 
                borderRadius: '8px', 
                fontWeight: '600',
                border: 'none',
                cursor: isCheckingOut ? 'not-allowed' : 'pointer',
                fontSize: '0.9rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => { if(!isCheckingOut) e.currentTarget.style.background = 'var(--primary-dark)'; }}
              onMouseLeave={(e) => { if(!isCheckingOut) e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {isCheckingOut ? (
                <span><i className="fa-solid fa-spinner fa-spin" style={{ marginRight: '6px' }}></i>กำลังสั่งซื้อ...</span>
              ) : 'ยืนยันและสั่งซื้อสินค้า'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}