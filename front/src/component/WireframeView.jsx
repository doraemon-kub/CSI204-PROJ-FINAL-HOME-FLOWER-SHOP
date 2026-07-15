import React, { useState } from 'react';

export default function WireframeView({
  headerText = 'หน้าสินค้า',
  filters = [],
  products = [],
  onAddToCart
}) {
  const [selectedFilter, setSelectedFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedFilter === 'ทั้งหมด' || p.category === selectedFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <style>{`
        .wf-page {
          background: var(--light-bg, #F5F5F0);
          min-height: 100vh;
          padding-bottom: 60px;
          font-family: 'Prompt', sans-serif;
        }

        .wf-header {
          text-align: center;
          padding: 70px 20px 40px;
          position: relative;
        }

        .wf-header::after {
          content: '';
          display: block;
          width: 60px;
          height: 2px;
          background: var(--primary, #846F5B);
          margin: 20px auto 0;
          border-radius: 2px;
        }

        .wf-header h1 {
          font-size: 2.2rem;
          color: var(--text-dark, #665342);
          font-weight: 600;
          letter-spacing: 0.05em;
          margin: 0 0 8px;
        }

        .wf-header-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: var(--tan, #E6D8C3);
          color: var(--primary, #846F5B);
          font-size: 1.2rem;
          margin-bottom: 16px;
        }

        .wf-layout {
          max-width: 1140px;
          margin: 0 auto;
          display: flex;
          gap: 32px;
          align-items: flex-start;
          padding: 0 24px;
        }

        /* Sidebar */
        .wf-sidebar {
          width: 240px;
          flex-shrink: 0;
          position: sticky;
          top: 100px;
        }

        .wf-sidebar-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px 20px;
          box-shadow: 0 2px 12px rgba(102, 83, 66, 0.06);
          border: 1px solid #f0ebe4;
        }

        .wf-sidebar-title {
          font-size: 0.82rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--primary, #846F5B);
          margin: 0 0 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wf-search-input {
          width: 100%;
          padding: 11px 14px 11px 38px;
          border-radius: 10px;
          border: 1.5px solid #e8e0d5;
          box-sizing: border-box;
          outline: none;
          font-family: inherit;
          font-size: 0.88rem;
          background: var(--light-bg, #F5F5F0);
          transition: all 0.2s ease;
          color: var(--text-dark, #665342);
        }

        .wf-search-input:focus {
          border-color: var(--primary, #846F5B);
          background: #fff;
          box-shadow: 0 0 0 3px rgba(132, 111, 91, 0.1);
        }

        .wf-search-input::placeholder {
          color: #b5a898;
        }

        .wf-search-wrap {
          position: relative;
          margin-bottom: 24px;
        }

        .wf-search-icon {
          position: absolute;
          left: 13px;
          top: 50%;
          transform: translateY(-50%);
          color: #b5a898;
          font-size: 0.85rem;
          pointer-events: none;
        }

        .wf-divider {
          height: 1px;
          background: #f0ebe4;
          margin: 0 0 20px;
        }

        .wf-filter-list {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .wf-filter-btn {
          text-align: left;
          padding: 10px 14px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.88rem;
          font-weight: 500;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .wf-filter-btn.active {
          background: var(--primary, #846F5B);
          color: #fff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(132, 111, 91, 0.25);
        }

        .wf-filter-btn:not(.active) {
          background: transparent;
          color: var(--text-dark, #665342);
        }

        .wf-filter-btn:not(.active):hover {
          background: var(--tan, #E6D8C3);
          color: var(--primary-dark, #6b5a49);
        }

        .wf-filter-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.5;
        }

        /* Product Grid */
        .wf-products {
          flex: 1;
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-content: flex-start;
        }

        .wf-product-card {
          flex: 0 1 calc(33.333% - 16px);
          min-width: 220px;
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f0ebe4;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
        }

        .wf-product-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(102, 83, 66, 0.14);
          border-color: var(--tan, #E6D8C3);
        }

        .wf-product-img {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #f5f0ea 0%, #ede6dc 100%);
          overflow: hidden;
          position: relative;
        }

        .wf-product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .wf-product-card:hover .wf-product-img img {
          transform: scale(1.08);
        }

        .wf-product-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #c4b5a4;
          gap: 6px;
        }

        .wf-product-img-placeholder i {
          font-size: 2rem;
          opacity: 0.5;
        }

        .wf-product-body {
          padding: 16px 18px 18px;
          display: flex;
          flex-direction: column;
          flex: 1;
          text-align: center;
        }

        .wf-product-name {
          margin: 0 0 6px;
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark, #665342);
        }

        .wf-product-price {
          margin: 0 0 14px;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary, #846F5B);
        }

        .wf-add-btn {
          margin-top: auto;
          width: 100%;
          padding: 11px 18px;
          background: var(--primary, #846F5B);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .wf-add-btn:hover {
          background: var(--primary-dark, #6b5a49);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(132, 111, 91, 0.3);
        }

        .wf-empty {
          width: 100%;
          text-align: center;
          padding: 60px 20px;
          color: #b5a898;
        }

        .wf-empty i {
          font-size: 2.5rem;
          margin-bottom: 14px;
          display: block;
          opacity: 0.4;
        }

        .wf-result-count {
          width: 100%;
          margin-bottom: 8px;
          padding: 0 4px;
          font-size: 0.82rem;
          color: #b5a898;
        }

        @media (max-width: 900px) {
          .wf-layout { flex-direction: column; }
          .wf-sidebar { width: 100%; position: static; }
          .wf-product-card { flex: 0 1 calc(50% - 12px); }
        }

        @media (max-width: 560px) {
          .wf-product-card { flex: 0 1 100%; }
          .wf-header h1 { font-size: 1.7rem; }
        }
      `}</style>

      <div className="wf-page">
        <div className="wf-header">
          <div className="wf-header-icon">
            <i className="fa-solid fa-spa"></i>
          </div>
          <h1>{headerText}</h1>
        </div>

        <div className="wf-layout">
          {/* Sidebar */}
          <aside className="wf-sidebar">
            <div className="wf-sidebar-card">
              <h3 className="wf-sidebar-title">
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: '0.75rem' }}></i>
                ค้นหาสินค้า
              </h3>
              <div className="wf-search-wrap">
                <i className="fa-solid fa-magnifying-glass wf-search-icon"></i>
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อสินค้า..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="wf-search-input"
                />
              </div>

              <div className="wf-divider"></div>

              <h3 className="wf-sidebar-title">
                <i className="fa-solid fa-tag" style={{ fontSize: '0.75rem' }}></i>
                หมวดหมู่
              </h3>
              <div className="wf-filter-list">
                {['ทั้งหมด', ...filters].map((f) => (
                  <button
                    key={f}
                    className={`wf-filter-btn ${selectedFilter === f ? 'active' : ''}`}
                    onClick={() => setSelectedFilter(f)}
                  >
                    <span className="wf-filter-dot"></span>
                    {f}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Products */}
          <section className="wf-products">
            <div className="wf-result-count">
              แสดง {filteredProducts.length} รายการ
            </div>

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const hasImage = product.img || product.image;
                const imgSrc = product.img || (product.image ? `http://localhost:3000/uploads/${product.image}` : '');

                return (
                  <div key={product.id} className="wf-product-card">
                    <div className="wf-product-img">
                      {hasImage ? (
                        <img src={imgSrc} alt={product.name} loading="lazy" />
                      ) : (
                        <div className="wf-product-img-placeholder">
                          <i className="fa-solid fa-spa"></i>
                        </div>
                      )}
                    </div>
                    <div className="wf-product-body">
                      <h4 className="wf-product-name">{product.name}</h4>
                      <p className="wf-product-price">{product.price.toLocaleString()} ฿</p>
                      <button className="wf-add-btn" onClick={() => onAddToCart(product)}>
                        <i className="fa-solid fa-basket-shopping"></i>
                        หยิบใส่ตะกร้า
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="wf-empty">
                <i className="fa-regular fa-face-sad-tear"></i>
                <p>ไม่พบสินค้าที่ค้นหา</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}