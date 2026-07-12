import React, { useState } from 'react';

export default function Navbar({
  currentView,
  onViewChange,
  cartCount,
  onCartToggle,
  onAuthToggle,
  user,
  onLogout
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (view, e) => {
    e.preventDefault();
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { label: 'หน้าหลัก', hash: '#home' },
    { label: 'ดอกไม้แห้ง', hash: '#dried-flowers' },
    { label: 'ดอกไม้ประดิษฐ์', hash: '#artificial-flowers' },
    { label: 'ของขวัญ', hash: '#gifts' },
    { label: 'วิธีการสั่งซื้อ', hash: '#how-to-buy' },
    { label: 'คำสั่งซื้อ', hash: '#orders' }
  ];

  return (
    <>
      {/* TOP UTILITY BAR */}
      <div className="top-bar">
        <div className="container top-bar-content">
          <div className="top-bar-left">
            <span><i className="fa-solid fa-phone"></i> 081-234-5678</span>
            <span className="separator">|</span>
            <span><i className="fa-solid fa-envelope"></i> contact@homeflowershop.com</span>
          </div>
          <div className="top-bar-right">
            {user ? (
              <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} id="loginBtn">
                <i className="fa-solid fa-user-check"></i> สวัสดี, {user.split('@')[0]} (ออกจากระบบ)
              </a>
            ) : (
              <a href="#" onClick={(e) => { e.preventDefault(); onAuthToggle(); }} id="loginBtn">
                <i className="fa-regular fa-user"></i> เข้าสู่ระบบ / สมัครสมาชิก
              </a>
            )}
          </div>
        </div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="navbar" id="navbar">
        <div className="container navbar-container">
          <a href="#home" className="logo" id="navLogo" onClick={(e) => handleNavClick('#home', e)}>
            <i className="fa-solid fa-seedling"></i> Home<span>Flowers</span>
          </a>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            id="mobileMenuToggle" 
            aria-label="Toggle Navigation"
            onClick={toggleMobileMenu}
          >
            <i className={isMobileMenuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"}></i>
          </button>

          <ul className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`} id="navMenu">
            {menuItems.map((item) => (
              <li key={item.hash}>
                <a 
                  href={item.hash} 
                  className={`nav-link ${currentView === item.hash ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(item.hash, e)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="nav-cart">
            <button className="cart-trigger" id="cartTrigger" aria-label="Open Shopping Cart" onClick={onCartToggle}>
              <i className="fa-solid fa-basket-shopping"></i>
              <span className="cart-badge" id="cartBadge">{cartCount}</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
