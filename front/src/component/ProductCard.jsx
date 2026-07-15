import React, { useState } from 'react';

export default function ProductCard({ product, onAddToCart }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      background: '#fff',
      padding: '20px',
      borderRadius: '16px',
      border: '1px solid #ddd',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ width: '100%', height: '150px', background: '#edf2f7', borderRadius: '12px', marginBottom: '15px' }} />
      <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{product.name}</h4>
      <p style={{ margin: '0 0 15px 0', fontWeight: 'bold' }}>{product.price.toLocaleString()} ฿</p>

      {/* Dropdown ส่วนรายละเอียด */}
      <div style={{ marginBottom: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{ width: '100%', padding: '10px', background: '#f9f9f9', border: 'none', cursor: 'pointer' }}
        >
          {isOpen ? 'ซ่อนรายละเอียด' : 'ดูรายละเอียดสินค้า'}
        </button>
        
        {isOpen && (
          <div style={{ padding: '10px', fontSize: '0.9rem', color: '#666', borderTop: '1px solid #eee' }}>
            {product.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
          </div>
        )}
      </div>

      <button className="add-to-cart-btn" onClick={() => onAddToCart(product)}>
        หยิบใส่ตะกร้า 🛒
      </button>
    </div>
  );
}