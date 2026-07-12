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

      {/* INFO SECTION (วิธีการสั่งซื้อ) */}
      <section className="section info-section" id="how-to-buy">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">วิธีการสั่งซื้อง่ายๆ ใน 3 ขั้นตอน</h2>
            <p className="section-subtitle">การซื้อดอกไม้ตกแต่งบ้านหรือของขวัญพิเศษไม่เคยง่ายเท่านี้มาก่อน</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-icon"><i className="fa-solid fa-basket-shopping"></i></div>
              <h3>1. เลือกสินค้าใส่ตะกร้า</h3>
              <p>เลือกสรรช่อดอกไม้แห้งหรือดอกไม้ประดิษฐ์ที่คุณประทับใจ แล้วกดเพิ่มลงในตะกร้าสินค้า</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><i className="fa-regular fa-credit-card"></i></div>
              <h3>2. ชำระเงินสะดวก</h3>
              <p>ทำการตรวจสอบรายการสินค้า กรอกข้อมูลการจัดส่ง และเลือกช่องทางชำระเงินที่ต้องการ</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><i className="fa-solid fa-truck-fast"></i></div>
              <h3>3. รอรับดอกไม้ที่บ้าน</h3>
              <p>จัดส่งห่ออย่างแน่นหนา เพื่อส่งมอบถึงมือคุณในสภาพที่สมบูรณ์ที่สุดอย่างรวดเร็ว</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
