import React, { useState } from 'react';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    alert(`เข้าสู่ระบบสำเร็จ! ยินดีต้อนรับคุณ ${loginEmail}`);
    onLoginSuccess(loginEmail);
    onClose();
    // Clear fields
    setLoginEmail('');
    setLoginPassword('');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    alert(`สมัครสมาชิกสำเร็จ! ยินดีต้อนรับคุณ ${regName}`);
    onLoginSuccess(regEmail);
    onClose();
    // Clear fields
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegPassword('');
  };

  return (
    <div className={`modal ${isOpen ? 'open' : ''}`} id="loginModal">
      <div className="modal-overlay" id="modalOverlay" onClick={onClose}></div>
      <div className="modal-content">
        <button className="modal-close" id="modalCloseBtn" onClick={onClose} aria-label="Close Modal">
          <i className="fa-solid fa-xmark"></i>
        </button>
        <div className="modal-tabs">
          <button 
            className={`modal-tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
            onClick={() => setActiveTab('login')}
          >
            เข้าสู่ระบบ
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => setActiveTab('register')}
          >
            สมัครสมาชิก
          </button>
        </div>
        
        {/* Login Form */}
        <form 
          id="loginForm" 
          className={`modal-form ${activeTab === 'login' ? 'active' : ''}`}
          onSubmit={handleLoginSubmit}
        >
          <div className="form-group">
            <label htmlFor="loginEmail">อีเมล / เบอร์โทรศัพท์</label>
            <input 
              type="text" 
              id="loginEmail" 
              placeholder="ระบุอีเมลหรือเบอร์โทรศัพท์ของคุณ" 
              required 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="loginPassword">รหัสผ่าน</label>
            <input 
              type="password" 
              id="loginPassword" 
              placeholder="ระบุรหัสผ่าน" 
              required 
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="form-actions">
            <a href="#" onClick={(e) => { e.preventDefault(); alert('ฟังก์ชันลืมรหัสผ่านยังไม่เปิดใช้งาน'); }} className="forgot-password">
              ลืมรหัสผ่าน?
            </a>
          </div>
          <button type="submit" className="btn btn-primary btn-block">เข้าสู่ระบบ</button>
        </form>

        {/* Register Form */}
        <form 
          id="registerForm" 
          className={`modal-form ${activeTab === 'register' ? 'active' : ''}`}
          onSubmit={handleRegisterSubmit}
        >
          <div className="form-group">
            <label htmlFor="regName">ชื่อ - นามสกุล</label>
            <input 
              type="text" 
              id="regName" 
              placeholder="ระบุชื่อ-นามสกุลของคุณ" 
              required 
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="regEmail">อีเมล</label>
            <input 
              type="email" 
              id="regEmail" 
              placeholder="ระบุอีเมลของคุณ" 
              required 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="regPhone">เบอร์โทรศัพท์</label>
            <input 
              type="tel" 
              id="regPhone" 
              placeholder="ระบุเบอร์โทรศัพท์" 
              required 
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div className="form-group">
            <label htmlFor="regPassword">รหัสผ่าน</label>
            <input 
              type="password" 
              id="regPassword" 
              placeholder="รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)" 
              required 
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-block">สมัครสมาชิก</button>
        </form>
      </div>
    </div>
  );
}
