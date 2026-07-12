import React from 'react';

export default function ProductCard({ product, onAddToCart, isWireframe = false }) {
  const { id, name, price, img, category, badge, rating, reviewsCount } = product;

  if (isWireframe) {
    return (
      <div className="wf-product-card" data-id={id} data-name={name} data-price={price}>
        <div className="wf-image-placeholder">
          {img ? <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>Image Placeholder (4:3)</span>}
        </div>
        <div className="wf-product-info">
          <h3 className="wf-product-title">{name}</h3>
          <span className="wf-product-price">{price.toLocaleString()} ฿</span>
        </div>
        <button 
          className="wf-add-to-cart-btn add-to-cart-btn"
          onClick={() => onAddToCart(product)}
        >
          <i className="fa-solid fa-basket-shopping"></i> หยิบใส่ตะกร้า
        </button>
      </div>
    );
  }

  // Standard Product Card
  return (
    <div className="product-card" data-id={id} data-name={name} data-price={price}>
      {badge && <div className={`product-badge ${badge === 'ใหม่' ? 'badge-new' : ''}`}>{badge}</div>}
      <div className="product-image">
        <img src={img || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop'} alt={name} />
      </div>
      <div className="product-details">
        {category && <span className="product-category">{category}</span>}
        <h3 className="product-title">{name}</h3>
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <i 
              key={i} 
              className={i < Math.floor(rating || 5) ? "fa-solid fa-star" : "fa-regular fa-star"}
            ></i>
          ))}
          {reviewsCount !== undefined && <span>({reviewsCount} รีวิว)</span>}
        </div>
        <div className="product-footer">
          <span className="product-price">฿{price.toLocaleString()}</span>
          <button 
            className="btn-add-to-cart add-to-cart-btn"
            onClick={() => onAddToCart(product)}
            aria-label="Add to cart"
          >
            <i className="fa-solid fa-cart-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
