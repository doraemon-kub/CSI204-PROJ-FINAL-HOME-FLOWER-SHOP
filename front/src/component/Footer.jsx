import React from 'react';

export default function Footer({ onViewChange }) {
  const handleNavClick = (view, e) => {
    e.preventDefault();
    onViewChange(view);
  };

  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <a href="#home" className="logo" id="footLogo" onClick={(e) => handleNavClick('#home', e)}>
            <i className="fa-solid fa-seedling"></i> Home<span>Flowers</span>
          </a>
          <p>เราคัดสรรดอกไม้แห้งและดอกไม้ประดิษฐ์คุณภาพดีเยี่ยม เพื่อสร้างบรรยากาศอบอุ่นและมีชีวิตชีวาให้บ้านและงานสำคัญของคุณ</p>
          <div className="social-links">
            <a href="#" aria-label="Facebook"><i className="fa-brands fa-facebook"></i></a>
            <a href="#" aria-label="Instagram"><i className="fa-brands fa-instagram"></i></a>
            <a href="#" aria-label="Line"><i className="fa-brands fa-line"></i></a>
          </div>
        </div>
        
        <div className="footer-links">
          <h3>หมวดหมู่สินค้า</h3>
          <ul>
            <li><a href="#best-sellers" className="footer-nav-link" id="footHome" onClick={(e) => handleNavClick('#best-sellers', e)}>ช่อแนะนำ</a></li>
            <li><a href="#dried-flowers" className="footer-nav-link" id="footDried" onClick={(e) => handleNavClick('#dried-flowers', e)}>ดอกไม้แห้ง</a></li>
            <li><a href="#artificial-flowers" className="footer-nav-link" id="footArtificial" onClick={(e) => handleNavClick('#artificial-flowers', e)}>ดอกไม้ประดิษฐ์</a></li>
            <li><a href="#gifts" className="footer-nav-link" id="footGifts" onClick={(e) => handleNavClick('#gifts', e)}>ของขวัญ / ของชำร่วย</a></li>
          </ul>
        </div>

        <div className="footer-links">
          <h3>ช่วยเหลือ & ข้อมูล</h3>
          <ul>
            <li><a href="#how-to-order" onClick={(e) => handleNavClick('#how-to-order', e)}>วิธีการสั่งซื้อ</a></li>
            <li><a href="#refund" onClick={(e) => handleNavClick('#refund', e)}>นโยบายการคืนสินค้า</a></li>
            <li><a href="#faq" onClick={(e) => handleNavClick('#faq', e)}>คำถามที่พบบ่อย (FAQs)</a></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h3>ติดต่อเรา</h3>
          <p><i className="fa-solid fa-location-dot"></i> 123/45 ถนนดอกไม้ทอง กรุงเทพมหานคร 10110</p>
          <p><i className="fa-solid fa-phone"></i> 081-234-5678</p>
          <p><i className="fa-solid fa-envelope"></i> info@homeflowershop.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p>&copy; 2026 Home Flowers Shop. All Rights Reserved. ออกแบบและพัฒนาเพื่อการเรียนรู้</p>
        </div>
      </div>
    </footer>
  );
}
