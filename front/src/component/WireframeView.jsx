import React, { useState } from 'react';
import ProductCard from './ProductCard';

export default function WireframeView({
  headerText = 'หน้าสินค้า',
  descriptionLinkText,
  filters = [],
  products = [],
  onAddToCart
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleFilterClick = (filter) => {
    if (selectedFilter === filter) {
      setSelectedFilter(''); // toggle off
    } else {
      setSelectedFilter(filter);
    }
  };

  // Filter products by search query and optional selected filter button
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Simple filter matching: if selectedFilter is set, check if it matches product tag/category (just a mock filter)
    const matchesFilter = selectedFilter 
      ? (product.tag === selectedFilter || product.name.toLowerCase().includes(selectedFilter.toLowerCase()))
      : true;
      
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="wireframe-view container">
      <div className="wireframe-title-container">
        <span className="wireframe-header-text">{headerText}</span>
      </div>
      <div className="wf-main-layout">
        <aside className="wf-sidebar">
          <div className="wf-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input 
              type="text" 
              placeholder="ค้นหา..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {filters.map((filter, index) => (
            <button 
              key={index}
              className={`wf-filter-btn ${selectedFilter === filter ? 'active' : ''}`}
              onClick={() => handleFilterClick(filter)}
              style={{
                backgroundColor: selectedFilter === filter ? 'var(--color-primary)' : '',
                color: selectedFilter === filter ? 'white' : ''
              }}
            >
              {filter}
            </button>
          ))}
        </aside>
        <div className="wf-content-area">
          {descriptionLinkText && (
            <div className="wf-page-description-link">
              <a href="#" onClick={(e) => e.preventDefault()}>{descriptionLinkText}</a>
            </div>
          )}
          <div className="wf-product-grid">
            {filteredProducts.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px 0', color: '#888' }}>
                ไม่พบสินค้าที่คุณค้นหา
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  onAddToCart={onAddToCart} 
                  isWireframe={true}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
