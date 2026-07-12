import React from 'react';

export default function HeroBanner() {
  const handleScrollToProducts = (e) => {
    e.preventDefault();
    const target = document.getElementById('best-sellers');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="brand-banner" id="heroBanner">
      <div className="banner-overlay"></div>
      <div className="banner-content">
        <h1 className="brand-title">Home Flowers Shop</h1>
        <p className="brand-subtitle">ยินดีต้อนรับเข้าสู่ร้านค้าดอกไม้แห้งและดอกไม้ประดิษฐ์</p>
        <a href="#best-sellers" onClick={handleScrollToProducts} className="btn btn-primary">
          เลือกชมสินค้า
        </a>
      </div>
    </header>
  );
}
