import React from 'react';
import CategoryCarousel from './CategoryCarousel';
import ProductCard from './ProductCard';

export default function HomeView({ onViewChange, bestSellers, onAddToCart }) {
  return (
    <div id="homeView">
      {/* CATEGORY CAROUSEL SECTION */}
      <CategoryCarousel onViewChange={onViewChange} />

      {/* BEST SELLERS SECTION */}
      <section className="section best-sellers-section" id="best-sellers">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">รูปแบบช่อขายดี</h2>
            <p className="section-subtitle">สินค้าขายดีที่ลูกค้าชื่นชอบและสั่งซื้อมากที่สุด</p>
          </div>

          <div className="products-grid">
            {bestSellers.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={onAddToCart} 
                isWireframe={false}
              />
            ))}
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS SECTION (จุดเด่นของเรา) */}
      <section className="section highlights-section" id="highlights">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title" style={{ color: '#fff' }}>จุดเด่นของเรา</h2>
          </div>
          <div className="highlights-grid">
            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="fa-solid fa-seedling"></i>
              </div>
              <h4>ดอกไม้คุณภาพ</h4>
              <p>คัดสรรอย่างดีเยี่ยม<br/>เราเลือกใช้ดอกไม้คุณภาพดี</p>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="fa-solid fa-palette"></i>
              </div>
              <h4>ดีไซน์สวย เหมาะกับทุกโอกาส</h4>
              <p>มีดอกไม้หลากหลายสไตล์</p>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="fa-solid fa-truck-fast"></i>
              </div>
              <h4>ส่งซื้อง่าย พร้อมจัดส่งทั่วประเทศ</h4>
              <p>ค่าจัดส่งเหมาจ่ายเพียง 100฿</p>
            </div>
            <div className="highlight-item">
              <div className="highlight-icon">
                <i className="fa-solid fa-heart"></i>
              </div>
              <h4>ใส่ใจทุกออเดอร์และบริการด้วย<br/>ความจริงใจ</h4>
              <p>ตรวจสอบคุณภาพสินค้า<br/>และแพ็กสินค้าอย่างดี</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
