import React, { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = () => {
    setIsAdding(true);
    onAddToCart(product);
    setTimeout(() => setIsAdding(false), 600);
  };

  const hasImage = product.img || product.image;
  const imgSrc = product.img || (product.image ? `http://localhost:3000/uploads/${product.image}` : '');

  return (
    <>
      <style>{`
        @keyframes cartBounce {
          0% { transform: scale(1); }
          40% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        .product-card-wrap {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid #f0ebe4;
          display: flex;
          flex-direction: column;
        }
        .product-card-wrap:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 40px rgba(102, 83, 66, 0.15);
          border-color: var(--tan, #E6D8C3);
        }
        .product-img-container {
          position: relative;
          width: 100%;
          height: 220px;
          overflow: hidden;
          background: linear-gradient(135deg, #f5f0ea 0%, #ede6dc 100%);
        }
        .product-img-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .product-card-wrap:hover .product-img-container img {
          transform: scale(1.08);
        }
        .product-img-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #c4b5a4;
          gap: 8px;
        }
        .product-img-placeholder i {
          font-size: 2.4rem;
          opacity: 0.6;
        }
        .product-img-placeholder span {
          font-size: 0.75rem;
          opacity: 0.5;
        }
        .product-card-body {
          padding: 18px 20px 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .product-card-name {
          margin: 0 0 6px;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-dark, #665342);
          line-height: 1.4;
        }
        .product-card-price {
          margin: 0 0 14px;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--primary, #846F5B);
          display: flex;
          align-items: baseline;
          gap: 4px;
        }
        .product-card-price .currency {
          font-size: 0.85rem;
          font-weight: 500;
        }
        .product-detail-toggle {
          width: 100%;
          padding: 10px 14px;
          background: var(--light-bg, #F5F5F0);
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-dark, #665342);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.2s ease;
          margin-bottom: 14px;
        }
        .product-detail-toggle:hover {
          background: var(--tan, #E6D8C3);
          color: var(--primary-dark, #6b5a49);
        }
        .product-detail-toggle i {
          font-size: 0.7rem;
          transition: transform 0.25s ease;
        }
        .product-detail-content {
          padding: 0 2px 14px;
          font-size: 0.88rem;
          color: #8a7a68;
          line-height: 1.6;
          animation: detailSlide 0.25s ease;
        }
        @keyframes detailSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .product-add-btn {
          margin-top: auto;
          width: 100%;
          padding: 12px 20px;
          background: var(--primary, #846F5B);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-family: inherit;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s ease;
        }
        .product-add-btn:hover {
          background: var(--primary-dark, #6b5a49);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(132, 111, 91, 0.3);
        }
        .product-add-btn:active {
          transform: translateY(0);
        }
        .product-add-btn.adding {
          animation: cartBounce 0.4s ease;
          background: #5a8a5a;
        }
      `}</style>

      <div
        className="product-card-wrap"
      >
        <div className="product-img-container">
          {hasImage ? (
            <img src={imgSrc} alt={product.name} loading="lazy" />
          ) : (
            <div className="product-img-placeholder">
              <i className="fa-solid fa-spa"></i>
              <span>ภาพสินค้า</span>
            </div>
          )}
        </div>

        <div className="product-card-body">
          <h4 className="product-card-name">{product.name}</h4>
          <p className="product-card-price">
            {product.price.toLocaleString()} <span className="currency">฿</span>
          </p>

          {/* ส่วนรายละเอียด */}
          <button
            className="product-detail-toggle"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span>{isOpen ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดสินค้า'}</span>
            <i className={`fa-solid fa-chevron-down`} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}></i>
          </button>

          {isOpen && (
            <div className="product-detail-content">
              {product.description || 'ดอกไม้คุณภาพดี จัดแต่งอย่างพิถีพิถัน เหมาะสำหรับตกแต่งบ้านหรือเป็นของขวัญในโอกาสพิเศษ'}
            </div>
          )}

          <button
            className={`product-add-btn ${isAdding ? 'adding' : ''}`}
            onClick={handleAdd}
          >
            {isAdding ? (
              <>
                <i className="fa-solid fa-check"></i>
                เพิ่มแล้ว!
              </>
            ) : (
              <>
                <i className="fa-solid fa-basket-shopping"></i>
                หยิบใส่ตะกร้า
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}