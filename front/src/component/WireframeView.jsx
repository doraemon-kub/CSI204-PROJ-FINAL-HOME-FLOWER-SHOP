import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function WireframeView({
  headerText = 'หน้าสินค้า',
  filters = [],
  products = [],
  onAddToCart
}) {
  const [selectedFilter, setSelectedFilter] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = products.filter((p) => {
    const productTag = p.tag || '';
    const matchesCategory = selectedFilter === 'ทั้งหมด' || 
                            productTag === selectedFilter || 
                            p.category === selectedFilter;
    const matchesSearch = (p.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <style>{`
        .wf-page {
          background: #fff;
          min-height: 100vh;
          padding-bottom: 60px;
          font-family: 'Prompt', sans-serif;
        }

        .wf-header {
          text-align: center;
          padding: 30px 20px 30px;
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
          padding: 0;
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
          background: #fff;
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
          background: #fff;
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
          border-radius: 24px;
          overflow: hidden;
          border: none;
          box-shadow: 0 2px 12px rgba(102, 83, 66, 0.07);
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          padding: 14px;
        }

        .wf-product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 32px rgba(102, 83, 66, 0.13);
        }

        .wf-product-img {
          width: 100%;
          height: 200px;
          background: #f7f4f0;
          border: 1px solid #f0ebe4;
          border-radius: 16px;
          overflow: hidden;
          position: relative;
          box-sizing: border-box;
        }

        .wf-product-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .wf-product-card:hover .wf-product-img img {
          transform: scale(1.06);
        }

        .wf-product-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #7f8c8d;
          gap: 8px;
          text-align: center;
          padding: 12px;
          box-sizing: border-box;
        }

        .wf-product-img-placeholder i {
          font-size: 2.6rem;
          color: #7f8c8d;
        }

        .wf-placeholder-label {
          font-size: 0.85rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .wf-placeholder-hint {
          font-size: 0.72rem;
          color: #7f8c8d;
        }

        .wf-badge-hot {
          position: absolute;
          top: 10px;
          left: 10px;
          background: #C28C7E;
          color: #fff;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 14px;
          border-radius: 20px;
          z-index: 5;
        }

        .wf-product-body {
          padding: 12px 4px 2px;
          display: flex;
          flex-direction: column;
          flex: 1;
          text-align: left;
        }

        .wf-product-category {
          font-size: 0.8rem;
          color: #888;
          margin: 0 0 4px;
        }

        .wf-product-name {
          margin: 0 0 8px;
          font-size: 1rem;
          font-weight: 700;
          color: #2c3e50;
          line-height: 1.4;
        }

        .wf-product-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 12px;
        }

        .wf-stars {
          display: flex;
          color: #ffc107;
          gap: 1px;
          font-size: 0.85rem;
        }

        .wf-reviews-count {
          font-size: 0.78rem;
          color: #888;
        }

        .wf-product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
        }

        .wf-product-price {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 700;
          color: #C28C7E;
        }

        .wf-add-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #f0ebe4;
          box-shadow: 0 2px 8px rgba(102, 83, 66, 0.1);
          color: var(--primary, #846F5B);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          padding: 0;
          flex-shrink: 0;
        }

        .wf-add-btn:hover {
          background: var(--primary, #846F5B);
          border-color: var(--primary, #846F5B);
          color: #fff;
          transform: scale(1.08);
          box-shadow: 0 4px 14px rgba(132, 111, 91, 0.3);
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

            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <div key={product.id} style={{ flex: '0 1 calc(33.333% - 16px)', minWidth: '220px', display: 'flex', flexDirection: 'column' }}>
                  <ProductCard product={product} onAddToCart={onAddToCart} />
                </div>
              ))
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