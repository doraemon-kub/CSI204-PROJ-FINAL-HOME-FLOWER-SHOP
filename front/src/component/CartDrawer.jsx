import React from 'react';

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onIncreaseQty,
  onDecreaseQty,
  onRemoveItem
}) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('กรุณาเลือกสินค้าใส่ตะกร้าก่อนดำเนินการสั่งซื้อ');
      return;
    }
    alert(`ดำเนินการสั่งซื้อเสร็จสิ้น! ยอดรวมทั้งสิ้น: ฿${totalPrice.toLocaleString()}`);
  };

  return (
    <div className={`cart-drawer ${isOpen ? 'open' : ''}`} id="cartDrawer">
      <div className="cart-drawer-overlay" id="cartDrawerOverlay" onClick={onClose}></div>
      <div className="cart-drawer-content">
        <div className="cart-header">
          <h3>ตะกร้าสินค้าของคุณ</h3>
          <button className="cart-close" id="cartCloseBtn" onClick={onClose} aria-label="Close Cart">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div className="cart-items" id="cartItemsContainer">
          {cart.length === 0 ? (
            <div className="empty-cart-message">
              <i className="fa-solid fa-basket-shopping"></i>
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <img 
                  src={item.img || 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop'} 
                  alt={item.name} 
                  className="cart-item-img" 
                />
                <div className="cart-item-details">
                  <h4 className="cart-item-title">{item.name}</h4>
                  <p className="cart-item-price">฿{item.price.toLocaleString()}</p>
                  <div className="cart-item-quantity">
                    <button 
                      className="qty-btn dec-qty" 
                      onClick={() => onDecreaseQty(item.id)}
                    >
                      <i className="fa-solid fa-minus"></i>
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      className="qty-btn inc-qty" 
                      onClick={() => onIncreaseQty(item.id)}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </div>
                </div>
                <button 
                  className="cart-item-remove remove-btn" 
                  onClick={() => onRemoveItem(item.id)}
                  aria-label="Remove item"
                >
                  <i className="fa-regular fa-trash-can"></i>
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <div className="cart-total">
            <span>ราคารวมทั้งหมด:</span>
            <span id="cartTotalAmount">฿{totalPrice.toLocaleString()}</span>
          </div>
          <button onClick={handleCheckout} className="btn btn-primary btn-block checkout-btn">
            ดำเนินการสั่งซื้อ
          </button>
        </div>
      </div>
    </div>
  );
}
