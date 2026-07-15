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

  const theme = {
    primary: '#846F5B',
    primaryDark: '#6b5a49',
    tan: '#E6D8C3',
    bgLight: '#F5F5F0',
    textDark: '#665342',
    shadow: '0 4px 12px rgba(102, 83, 66, 0.08)'
  };

  return (
    <div style={{ background: theme.bgLight, minHeight: '100vh', paddingBottom: '60px', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* Header มินิมอล */}
      <div style={{ textAlign: 'center', padding: '80px 20px 40px' }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          color: theme.textDark, 
          fontWeight: '300', 
          letterSpacing: '0.15em', 
          textTransform: 'uppercase', 
          marginBottom: '20px' 
        }}>
          {headerText}
        </h1>
        <div style={{ width: '60px', height: '1px', backgroundColor: theme.primary, margin: '0 auto' }}></div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '40px', alignItems: 'flex-start', padding: '0 20px' }}>
        
        {/* Sidebar */}
        <aside style={{ width: '260px', flexShrink: 0 }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', boxShadow: theme.shadow }}>
            
            <h3 style={{ marginBottom: '15px', fontSize: '1rem', color: theme.textDark }}>ค้นหาสินค้า</h3>
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อสินค้า..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                marginBottom: '25px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxSizing: 'border-box',
                outline: 'none'
              }}
            />

            <h3 style={{ marginBottom: '15px', fontSize: '1rem', color: theme.textDark }}>หมวดหมู่</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {['ทั้งหมด', ...filters].map((f) => (
                <button 
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: selectedFilter === f ? '600' : '500',
                    background: selectedFilter === f ? theme.primary : theme.bgLight,
                    color: selectedFilter === f ? '#fff' : theme.textDark,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedFilter !== f) {
                      e.currentTarget.style.background = theme.tan;
                    } else {
                      e.currentTarget.style.background = theme.primaryDark;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = selectedFilter === f ? theme.primary : theme.bgLight;
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <section style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '30px' }}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.id} style={{ 
                background: '#fff', 
                borderRadius: '16px', 
                padding: '15px', 
                boxShadow: theme.shadow,
                textAlign: 'center' 
              }}>
                <div style={{ width: '100%', height: '200px', background: '#edf2f7', borderRadius: '12px', marginBottom: '15px' }} />
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem', color: theme.textDark }}>{product.name}</h4>
                <p style={{ margin: '0 0 15px 0', fontWeight: 'bold', color: theme.primary }}>{product.price.toLocaleString()} ฿</p>
                
                {/* ปุ่มที่ใช้ CSS Class ใหม่ */}
                <button 
                  className="add-to-cart-btn"
                  onClick={() => onAddToCart(product)}
                >
                  หยิบใส่ตะกร้า 🛒
                </button>
              </div>
            ))
          ) : (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#999' }}>ไม่พบสินค้าที่ค้นหา</div>
          )}
        </section>
      </div>
    </div>
  );
}