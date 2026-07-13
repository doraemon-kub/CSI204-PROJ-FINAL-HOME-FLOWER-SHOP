import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register'
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email: loginEmail,
        password: loginPassword,
      });
      const { user } = response.data;
      onLoginSuccess(user);
      onClose();
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
      });
      const { user } = response.data;
      onLoginSuccess(user);
      onClose();
      setRegName('');
      setRegEmail('');
      setRegPhone('');
      setRegPassword('');
    } catch (err) {
      const msg = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setErrorMessage('');
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
            onClick={() => handleTabSwitch('login')}
          >
            เข้าสู่ระบบ
          </button>
          <button 
            className={`modal-tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
            onClick={() => handleTabSwitch('register')}
          >
            สมัครสมาชิก
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div style={{
            background: '#fef2f2',
            color: '#dc2626',
            padding: '10px 14px',
            borderRadius: '6px',
            marginBottom: '16px',
            fontSize: '0.9rem',
            border: '1px solid #fecaca'
          }}>
            <i className="fa-solid fa-circle-exclamation" style={{ marginRight: '6px' }}></i>
            {errorMessage}
          </div>
        )}
        
        {/* Login Form */}
        <form 
          id="loginForm" 
          className={`modal-form ${activeTab === 'login' ? 'active' : ''}`}
          onSubmit={handleLoginSubmit}
        >
          <div className="form-group">
            <label htmlFor="loginEmail">อีเมล</label>
            <input 
              type="email" 
              id="loginEmail" 
              placeholder="ระบุอีเมลของคุณ" 
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
          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
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
          <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
            {isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>
      </div>
    </div>
  );
}
