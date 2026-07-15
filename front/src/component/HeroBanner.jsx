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
    <>
      <style>{`
        .hero-banner {
          position: relative;
          min-height: 520px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          overflow: hidden;
          background: 
            linear-gradient(135deg, rgba(132, 111, 91, 0.55) 0%, rgba(183, 155, 125, 0.4) 40%, rgba(230, 216, 195, 0.35) 100%),
            url('https://images.unsplash.com/photo-1487530811176-3780de880c2d?q=80&w=1600&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
        }

        .hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(245,245,240,0.15) 0%, rgba(102,83,66,0.3) 100%);
          z-index: 1;
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          padding: 60px 24px;
          animation: heroFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 20px;
          border-radius: 30px;
          font-size: 0.85rem;
          color: #fff;
          margin-bottom: 24px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 3.4rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 8px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.15);
          letter-spacing: -0.5px;
          line-height: 1.2;
        }

        .hero-title span {
          display: block;
          font-weight: 300;
          font-size: 1.8rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-top: 4px;
          opacity: 0.9;
        }

        .hero-subtitle {
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
          margin: 20px auto 36px;
          max-width: 480px;
          line-height: 1.7;
          text-shadow: 0 1px 8px rgba(0,0,0,0.1);
        }

        .hero-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .hero-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          background: #fff;
          color: var(--primary, #846F5B);
          border: none;
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          text-decoration: none;
        }

        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.2);
          background: var(--tan, #E6D8C3);
          color: var(--text-dark, #665342);
        }

        .hero-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 14px 36px;
          background: transparent;
          color: #fff;
          border: 1.5px solid rgba(255,255,255,0.6);
          border-radius: 30px;
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .hero-btn-secondary:hover {
          background: rgba(255,255,255,0.15);
          border-color: #fff;
          transform: translateY(-2px);
        }

        .hero-scroll-hint {
          position: absolute;
          bottom: 30px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
          color: rgba(255,255,255,0.7);
          font-size: 0.78rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          animation: scrollBounce 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }

        @media (max-width: 640px) {
          .hero-banner { min-height: 420px; }
          .hero-title { font-size: 2.4rem; }
          .hero-title span { font-size: 1.3rem; }
          .hero-subtitle { font-size: 0.95rem; }
        }
      `}</style>

      <header className="hero-banner" id="heroBanner">
        <div className="hero-inner">
          <div className="hero-badge">
            <i className="fa-solid fa-seedling"></i>
            ดอกไม้แห้ง & ดอกไม้ประดิษฐ์คุณภาพ
          </div>
          <h1 className="hero-title">
            Home Flowers
            <span>Flower Shop</span>
          </h1>
          <p className="hero-subtitle">
            ยินดีต้อนรับสู่ร้านดอกไม้แห้งและดอกไม้ประดิษฐ์<br />
            คัดสรรอย่างพิถีพิถัน เพื่อส่งมอบความสุขให้ทุกโอกาส
          </p>
          <div className="hero-actions">
            <a href="#best-sellers" onClick={handleScrollToProducts} className="hero-btn-primary">
              <i className="fa-solid fa-basket-shopping"></i>
              เลือกชมสินค้า
            </a>
            <a href="#categories" onClick={(e) => { e.preventDefault(); document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' }); }} className="hero-btn-secondary">
              <i className="fa-regular fa-heart"></i>
              หมวดหมู่สินค้า
            </a>
          </div>
        </div>
        <div className="hero-scroll-hint">
          <span>เลื่อนลง</span>
          <i className="fa-solid fa-chevron-down"></i>
        </div>
      </header>
    </>
  );
}
