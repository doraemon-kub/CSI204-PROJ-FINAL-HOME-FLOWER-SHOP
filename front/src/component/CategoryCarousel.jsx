import React, { useRef } from 'react';

const CATEGORIES = [
  {
    id: 'cat-1',
    name: 'ช่อแนะนำ',
    img: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?q=80&w=600&auto=format&fit=crop',
    link: '#home'
  },
  {
    id: 'cat-2',
    name: 'ดอกไม้แห้ง',
    img: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop',
    link: '#dried-flowers'
  },
  {
    id: 'cat-3',
    name: 'ดอกไม้ประดิษฐ์',
    img: 'https://images.unsplash.com/photo-1589244159943-460088ed5c92?q=80&w=600&auto=format&fit=crop',
    link: '#artificial-flowers'
  },
  {
    id: 'cat-4',
    name: 'ของขวัญ',
    img: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?q=80&w=600&auto=format&fit=crop',
    link: '#gifts'
  }
];

export default function CategoryCarousel({ onViewChange }) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleCategoryClick = (link, e) => {
    e.preventDefault();
    if (link === '#home') {
      onViewChange('#home');
      // Scroll to best sellers
      setTimeout(() => {
        const el = document.getElementById('best-sellers');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      onViewChange(link);
    }
  };

  return (
    <section className="section categories-section" id="categories">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">แนะนำร้านค้า</h2>
          <p className="section-subtitle">เลือกชมหมวดหมู่ดอกไม้และของขวัญที่เราเตรียมไว้สำหรับคุณ</p>
        </div>

        <div className="carousel-container">
          <button className="carousel-btn left-btn" onClick={() => handleScroll('left')} aria-label="Scroll left">
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          
          <div className="carousel-wrapper" ref={scrollRef}>
            <div className="carousel-track">
              {CATEGORIES.map((category) => (
                <div key={category.id} className="category-card">
                  <div className="category-image">
                    <img src={category.img} alt={category.name} />
                    <div className="category-overlay">
                      <a href={category.link} className="btn btn-secondary" onClick={(e) => handleCategoryClick(category.link, e)}>
                        ดูเพิ่มเติม
                      </a>
                    </div>
                  </div>
                  <div className="category-info">
                    <h3>{category.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="carousel-btn right-btn" onClick={() => handleScroll('right')} aria-label="Scroll right">
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </section>
  );
}
