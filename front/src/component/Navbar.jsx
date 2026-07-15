import React, { useState, useRef, useEffect } from 'react';

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
  const [isOrderDropdownOpen, setIsOrderDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNavClick = (view, e) => {
    e.preventDefault();
    onViewChange(view);
    setIsMobileMenuOpen(false);
    setIsOrderDropdownOpen(false);
  };

  // เมื่อกด "วิธีการสั่งซื้อสินค้า" -> ไปหน้าแรกแล้วเลื่อนไปยัง section #how-to-buy
  const handleHowToBuyClick = (e) => {
    e.preventDefault();
    onViewChange('#home');
    setTimeout(() => {
      const el = document.getElementById('how-to-buy');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 50);
    setIsMobileMenuOpen(false);
    setIsOrderDropdownOpen(false);
  };

  // เมื่อกด "เงื่อนไขการสั่งซื้อสินค้า" -> ไปหน้าเงื่อนไขการสั่งซื้อ
  const handleOrderTermsClick = (e) => {
    e.preventDefault();
    onViewChange('#order-terms');
    setIsMobileMenuOpen(false);
    setIsOrderDropdownOpen(false);
  };

  const toggleOrderDropdown = (e) => {
    e.preventDefault();
    setIsOrderDropdownOpen((prev) => !prev);
  };

  // ปิด dropdown เมื่อคลิกนอกพื้นที่
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOrderDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'หน้าหลัก', hash: '#home' },
    { label: 'ดอกไม้แห้ง', hash: '#dried-flowers' },
    { label: 'ดอกไม้ประดิษฐ์', hash: '#artificial-flowers' },
    { label: 'ของขวัญ', hash: '#gifts' },
    { label: 'คำสั่งซื้อ', hash: '#orders' }
  ];

  const isOrderSectionActive = currentView === '#how-to-buy' || currentView === '#order-terms';

  return (
    <>
      <style>{`
        :root {
          --primary: #846F5B;
          --primary-dark: #6b5a49;
          --tan: #E6D8C3;
          --text-dark: #665342;
          --light-bg: #F5F5F0;
          --border-color: #e2d9c9;
          --shadow-sm: 0 2px 8px rgba(102, 83, 66, 0.08);
          --shadow-md: 0 6px 20px rgba(102, 83, 66, 0.12);
        }
        body { font-family: 'Prompt','Sarabun',sans-serif; background: var(--light-bg); color: var(--text-dark); margin: 0; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        a { text-decoration: none; color: var(--text-dark); }

        /* Top bar */
        .top-bar { background: var(--text-dark); color: #fff; font-size: 0.82rem; }
        .top-bar-content { display: flex; justify-content: space-between; align-items: center; padding: 8px 24px; }
        .top-bar-left span { margin-right: 14px; }
        .top-bar .separator { margin: 0 8px; opacity: 0.5; }
        .top-bar a { color: #fff; opacity: 0.9; transition: opacity 0.2s ease; }
        .top-bar a:hover { opacity: 1; }

        /* Navbar */
        .navbar { background: var(--tan); box-shadow: var(--shadow-sm); position: sticky; top: 0; z-index: 500; }
        .navbar-container { display: flex; align-items: center; justify-content: space-between; padding: 16px 24px; }
        .logo { font-size: 1.4rem; font-weight: 700; color: var(--text-dark); display: flex; align-items: center; gap: 8px; }
        .logo i { color: var(--primary); }
        .logo span { color: var(--primary); font-weight: 400; }
        .nav-menu { list-style: none; margin: 0; padding: 0; }
        .nav-link { font-weight: 500; color: var(--text-dark); padding: 8px 4px; position: relative; transition: color 0.2s ease; }
        .nav-link::after { content: ''; position: absolute; left: 0; bottom: -2px; width: 0; height: 2px; background: var(--primary); transition: width 0.25s ease; }
        .nav-link:hover, .nav-link.active { color: var(--primary); }
        .nav-link:hover::after, .nav-link.active::after { width: 100%; }
        .mobile-menu-toggle { display: none; background: none; border: none; font-size: 1.4rem; color: var(--text-dark); cursor: pointer; }
        .nav-cart .cart-trigger { background: var(--primary); color: #fff; border: none; width: 42px; height: 42px; border-radius: 50%; position: relative; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; }
        .nav-cart .cart-trigger:hover { background: var(--primary-dark); transform: translateY(-2px); }
        .cart-badge { position: absolute; top: -4px; right: -4px; background: var(--text-dark); color: #fff; font-size: 0.7rem; font-weight: 700; min-width: 18px; height: 18px; border-radius: 9px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; }
        @media (max-width: 900px) {
          .mobile-menu-toggle { display: block; }
          .nav-menu { position: absolute; top: 100%; left: 0; right: 0; flex-direction: column !important; background: var(--tan); padding: 12px 0; display: none !important; box-shadow: var(--shadow-md); }
          .nav-menu.open { display: flex !important; }
        }

        /* Hero banner */
        .brand-banner { position: relative; background: linear-gradient(135deg, var(--tan) 0%, #d9c7a8 100%); color: var(--text-dark); text-align: center; padding: 110px 20px; overflow: hidden; }
        .banner-content { position: relative; z-index: 2; }
        .brand-title { font-size: 3rem; font-weight: 700; margin: 0 0 14px; color: var(--text-dark); }
        .brand-subtitle { font-size: 1.1rem; margin: 0 0 30px; color: var(--primary-dark); opacity: 0.9; }

        /* Buttons */
        .btn { display: inline-block; padding: 13px 32px; border-radius: 30px; font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none; transition: all 0.25s ease; }
        .btn-primary { background: var(--primary); color: #fff; box-shadow: var(--shadow-sm); }
        .btn-primary:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .btn-secondary { background: #fff; color: var(--primary); border: 1px solid var(--primary); }
        .btn-secondary:hover { background: var(--primary); color: #fff; }
        .btn-block { width: 100%; text-align: center; }
        .add-to-cart-btn { background: var(--primary); color: #fff; border: none; padding: 11px 20px; border-radius: 24px; font-weight: 600; cursor: pointer; width: 100%; transition: all 0.2s ease; }
        .add-to-cart-btn:hover { background: var(--primary-dark); transform: translateY(-2px); box-shadow: var(--shadow-sm); }

        /* Sections */
        .section { padding: 70px 0; }
        .section.categories-section, .section.info-section { background: #fff; }
        .info-section { background: var(--tan) !important; }
        .section-header { text-align: center; margin-bottom: 40px; }
        .section-title { font-size: 1.9rem; font-weight: 700; color: var(--text-dark); margin: 0 0 10px; position: relative; display: inline-block; padding-bottom: 14px; }
        .section-title::after { content: ''; position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); width: 60px; height: 3px; background: var(--primary); border-radius: 3px; }
        .section-subtitle { color: var(--primary-dark); opacity: 0.85; font-size: 0.98rem; margin: 0; }

        /* Category carousel */
        .carousel-container { position: relative; display: flex; align-items: center; }
        .carousel-wrapper { overflow-x: auto; scroll-behavior: smooth; scrollbar-width: none; }
        .carousel-wrapper::-webkit-scrollbar { display: none; }
        .carousel-track { display: flex; gap: 24px; padding: 4px; }
        .category-card { flex: 0 0 240px; border-radius: 14px; overflow: hidden; background: var(--light-bg); box-shadow: var(--shadow-sm); transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .category-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); }
        .category-image { position: relative; height: 200px; overflow: hidden; }
        .category-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .category-card:hover .category-image img { transform: scale(1.08); }
        .category-overlay { position: absolute; inset: 0; background: rgba(102, 83, 66, 0.45); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
        .category-card:hover .category-overlay { opacity: 1; }
        .category-info { padding: 14px; text-align: center; }
        .category-info h3 { margin: 0; font-size: 1.05rem; color: var(--text-dark); }
        .carousel-btn { background: #fff; border: 1px solid var(--border-color); color: var(--primary); width: 40px; height: 40px; border-radius: 50%; cursor: pointer; flex-shrink: 0; box-shadow: var(--shadow-sm); transition: all 0.2s ease; z-index: 2; }
        .carousel-btn:hover { background: var(--primary); color: #fff; }
        .left-btn { margin-right: 12px; }
        .right-btn { margin-left: 12px; }

        /* Product grid */
        .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 26px; }

        /* Steps */
        .steps-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 28px; }
        .step-card { background: #fff; border-radius: 14px; padding: 32px 24px; text-align: center; box-shadow: var(--shadow-sm); transition: transform 0.25s ease, box-shadow 0.25s ease; }
        .step-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-md); }
        .step-icon { width: 64px; height: 64px; border-radius: 50%; background: var(--light-bg); color: var(--primary); font-size: 1.5rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; }
        .step-card h3 { color: var(--text-dark); font-size: 1.05rem; margin: 0 0 10px; }
        .step-card p { color: #8a7a68; font-size: 0.9rem; line-height: 1.6; margin: 0; }

        /* Modals */
        .modal { position: fixed; inset: 0; display: none; z-index: 1000; }
        .modal.open { display: flex; align-items: center; justify-content: center; }
        .modal-overlay { position: absolute; inset: 0; background: rgba(102, 83, 66, 0.5); backdrop-filter: blur(2px); }
        .modal-content { position: relative; background: #fff; border-radius: 14px; padding: 36px; width: 90%; max-width: 420px; max-height: 88vh; overflow-y: auto; box-shadow: var(--shadow-md); z-index: 2; }
        .orders-modal-content { max-width: 720px; }
        .orders-modal-title { color: var(--text-dark); margin: 0 0 24px; text-align: center; }
        .modal-close { position: absolute; top: 16px; right: 16px; background: var(--light-bg); border: none; width: 34px; height: 34px; border-radius: 50%; color: var(--text-dark); cursor: pointer; transition: all 0.2s ease; }
        .modal-close:hover { background: var(--primary); color: #fff; }
        .modal-tabs { display: flex; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
        .modal-tab-btn { flex: 1; background: none; border: none; padding: 12px; font-weight: 600; color: #a89a89; cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s ease; }
        .modal-tab-btn.active { color: var(--primary); border-bottom-color: var(--primary); }
        .modal-form { display: none; flex-direction: column; gap: 16px; }
        .modal-form.active { display: flex; }
        .form-group label { display: block; font-size: 0.88rem; color: var(--text-dark); margin-bottom: 6px; font-weight: 500; }
        .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 11px 14px; border-radius: 8px; border: 1px solid var(--border-color); outline: none; font-family: inherit; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(132, 111, 91, 0.15); }
        .form-actions { text-align: right; }
        .forgot-password { font-size: 0.85rem; color: var(--primary); }

        /* Orders table */
        .orders-table-wrapper { overflow-x: auto; }
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th { text-align: left; padding: 12px; background: var(--light-bg); color: var(--text-dark); font-size: 0.85rem; border-bottom: 2px solid var(--border-color); }
        .orders-table td { padding: 12px; border-top: 1px solid var(--border-color); font-size: 0.9rem; color: var(--text-dark); }
        .order-detail-heading { color: var(--primary); font-size: 0.95rem; margin: 0 0 10px; }
        .order-detail-section { margin-bottom: 18px; }
        .order-detail-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .order-detail-table td { padding: 6px 0; }
        .order-total-row td { border-top: 1px solid var(--border-color); padding-top: 10px; color: var(--primary); }
        .text-right { text-align: right; }
        .order-tracking-row { display: flex; align-items: center; justify-content: space-between; padding: 8px 0; }

        /* Cart drawer */
        .cart-drawer { position: fixed; inset: 0; z-index: 1000; pointer-events: none; }
        .cart-drawer.open { pointer-events: auto; }
        .cart-drawer-overlay { position: absolute; inset: 0; background: rgba(102, 83, 66, 0.5); opacity: 0; transition: opacity 0.3s ease; }
        .cart-drawer.open .cart-drawer-overlay { opacity: 1; }
        .cart-drawer-content { position: absolute; top: 0; right: 0; height: 100%; width: 100%; max-width: 400px; background: #fff; display: flex; flex-direction: column; transform: translateX(100%); transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: -8px 0 24px rgba(102, 83, 66, 0.15); }
        .cart-drawer.open .cart-drawer-content { transform: translateX(0); }
        .cart-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
        .cart-header h3 { margin: 0; color: var(--text-dark); }
        .cart-close { background: var(--light-bg); border: none; width: 32px; height: 32px; border-radius: 50%; color: var(--text-dark); cursor: pointer; }
        .cart-close:hover { background: var(--primary); color: #fff; }
        .cart-items { flex: 1; overflow-y: auto; padding: 16px 24px; }
        .empty-cart-message { text-align: center; padding: 60px 0; color: #a89a89; }
        .empty-cart-message i { font-size: 2.4rem; margin-bottom: 12px; display: block; color: var(--tan); }
        .cart-item { display: flex; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--border-color); align-items: center; }
        .cart-item-img { width: 64px; height: 64px; object-fit: cover; border-radius: 10px; }
        .cart-item-details { flex: 1; }
        .cart-item-title { margin: 0 0 4px; font-size: 0.92rem; color: var(--text-dark); }
        .cart-item-price { margin: 0 0 8px; color: var(--primary); font-weight: 600; font-size: 0.88rem; }
        .cart-item-quantity { display: flex; align-items: center; gap: 10px; }
        .qty-btn { background: var(--light-bg); border: none; width: 26px; height: 26px; border-radius: 50%; color: var(--text-dark); cursor: pointer; font-size: 0.75rem; }
        .qty-btn:hover { background: var(--tan); }
        .cart-item-remove { background: none; border: none; color: #c98b8b; cursor: pointer; font-size: 1rem; }
        .cart-summary { padding: 20px 24px; border-top: 1px solid var(--border-color); background: var(--light-bg); }
        .cart-total { display: flex; justify-content: space-between; font-weight: 700; color: var(--text-dark); margin-bottom: 14px; font-size: 1.05rem; }
        .cart-total span:last-child { color: var(--primary); }

        /* Wireframe / terms header */
        .wireframe-title-container { text-align: center; padding: 60px 20px 30px; }
        .wireframe-header-text { font-size: 2.2rem; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-dark); }

        /* Footer */
        .footer { background: var(--text-dark); color: #ded4c6; }
        .footer-content { display: grid; grid-template-columns: 1.4fr 1fr 1fr 1.2fr; gap: 36px; padding: 60px 24px 40px; }
        .footer-brand .logo { color: #fff; margin-bottom: 14px; }
        .footer-brand .logo span { color: var(--tan); }
        .footer-brand p { font-size: 0.88rem; line-height: 1.7; color: #cbbfae; }
        .social-links { display: flex; gap: 12px; margin-top: 16px; }
        .social-links a { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.1); color: #fff; display: flex; align-items: center; justify-content: center; transition: background 0.2s ease; }
        .social-links a:hover { background: var(--primary); }
        .footer-links h3, .footer-contact h3 { color: #fff; font-size: 1rem; margin: 0 0 18px; }
        .footer-links ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a { color: #cbbfae; font-size: 0.88rem; transition: color 0.2s ease; }
        .footer-links a:hover { color: var(--tan); }
        .footer-contact p { font-size: 0.88rem; color: #cbbfae; margin: 0 0 12px; display: flex; align-items: flex-start; gap: 8px; }
        .footer-bottom { border-top: 1px solid rgba(255,255,255,0.1); padding: 18px 0; }
        .footer-bottom-content { text-align: center; font-size: 0.8rem; color: #a89a89; }
        @media (max-width: 900px) { .footer-content { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 560px) { .footer-content { grid-template-columns: 1fr; } .brand-title { font-size: 2.1rem; } .section-title { font-size: 1.5rem; } }

        .floating-cart-btn {
          position: fixed;
          bottom: 28px;
          right: 28px;
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: #b76e79;
          color: #fff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(183, 110, 121, 0.4);
          z-index: 900;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .floating-cart-btn:hover {
          background-color: #a15c67;
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 10px 24px rgba(183, 110, 121, 0.5);
        }
        .floating-cart-btn:active {
          transform: translateY(0) scale(0.97);
        }
        .floating-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background-color: #1e293b;
          color: #fff;
          font-size: 0.72rem;
          font-weight: 700;
          min-width: 20px;
          height: 20px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid #fff;
        }
        @keyframes floatingCartPulse {
          0% { box-shadow: 0 6px 18px rgba(183, 110, 121, 0.4); }
          50% { box-shadow: 0 6px 24px rgba(183, 110, 121, 0.65); }
          100% { box-shadow: 0 6px 18px rgba(183, 110, 121, 0.4); }
        }
        .floating-cart-btn.has-items {
          animation: floatingCartPulse 2.4s ease-in-out infinite;
        }
        @media (max-width: 640px) {
          .floating-cart-btn {
            bottom: 18px;
            right: 18px;
            width: 52px;
            height: 52px;
            font-size: 1.2rem;
          }
        }
      `}</style>

      {/* FLOATING CART BUTTON (bottom-right) */}
      <button
        className={`floating-cart-btn ${cartCount > 0 ? 'has-items' : ''}`}
        onClick={onCartToggle}
        aria-label="เปิดตะกร้าสินค้า"
      >
        <i className="fa-solid fa-basket-shopping"></i>
        {cartCount > 0 && <span className="floating-cart-badge">{cartCount}</span>}
      </button>

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

          <ul
            className={`nav-menu ${isMobileMenuOpen ? 'open' : ''}`}
            id="navMenu"
            style={{ display: 'flex', alignItems: 'center', gap: '32px' }}
          >
            {menuItems.map((item) => (
              <li key={item.hash} style={{ margin: 0 }}>
                <a
                  href={item.hash}
                  className={`nav-link ${currentView === item.hash ? 'active' : ''}`}
                  onClick={(e) => handleNavClick(item.hash, e)}
                >
                  {item.label}
                </a>
              </li>
            ))}

            {/* วิธีการสั่งซื้อ - Dropdown */}
            <li
              ref={dropdownRef}
              style={{ position: 'relative', margin: 0 }}
              onMouseEnter={() => setIsOrderDropdownOpen(true)}
              onMouseLeave={() => setIsOrderDropdownOpen(false)}
            >
              <a
                href="#how-to-buy"
                className={`nav-link ${isOrderSectionActive ? 'active' : ''}`}
                onClick={toggleOrderDropdown}
                aria-expanded={isOrderDropdownOpen}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
              >
                <span>วิธีการสั่งซื้อ</span>
                <i
                  className="fa-solid fa-chevron-down"
                  style={{
                    fontSize: '0.7rem',
                    transition: 'transform 0.2s ease',
                    transform: isOrderDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                ></i>
              </a>

              <ul
                className="nav-dropdown-menu"
                style={{
                  listStyle: 'none',
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  minWidth: '220px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                  padding: '8px 0',
                  margin: 0,
                  zIndex: 200,
                  opacity: isOrderDropdownOpen ? 1 : 0,
                  visibility: isOrderDropdownOpen ? 'visible' : 'hidden',
                  transform: isOrderDropdownOpen ? 'translateY(0)' : 'translateY(-6px)',
                  transition: 'all 0.2s ease'
                }}
              >
                <li>
                  <a
                    href="#how-to-buy"
                    onClick={handleHowToBuyClick}
                    style={{
                      display: 'block',
                      padding: '10px 18px',
                      color: 'var(--text-dark)',
                      fontSize: '0.92rem',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--light-bg)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                  >
                    วิธีการสั่งซื้อสินค้า
                  </a>
                </li>
                <li>
                  <a
                    href="#order-terms"
                    onClick={handleOrderTermsClick}
                    style={{
                      display: 'block',
                      padding: '10px 18px',
                      color: 'var(--text-dark)',
                      fontSize: '0.92rem',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--light-bg)'; e.currentTarget.style.color = 'var(--primary)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dark)'; }}
                  >
                    เงื่อนไขการสั่งซื้อสินค้า
                  </a>
                </li>
              </ul>
            </li>
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
