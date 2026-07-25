import React, { useState, useEffect } from 'react';

export default function CartDrawer({
    isOpen,
    onClose,
    cart,
    user,
    onIncreaseQty,
    onDecreaseQty,
    onRemoveItem,
    onOpenCheckout
}) {
    const [checkedItems, setCheckedItems] = useState({});
    const [customSelections, setCustomSelections] = useState({});

    useEffect(() => {
        const initialChecked = {};
        cart.forEach((item) => {
            const id = item.cartItemId || item.id;
            initialChecked[id] = true;
        });
        setCheckedItems(initialChecked);
    }, [cart]);

    const handleCheckItem = (id) => {
        setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSelectAll = () => {
        const allChecked = cart.length > 0 && cart.every((item) => checkedItems[item.cartItemId || item.id]);
        const updated = {};
        cart.forEach((item) => {
            const id = item.cartItemId || item.id;
            updated[id] = !allChecked;
        });
        setCheckedItems(updated);
    };

    const isAllChecked = cart.length > 0 && cart.every((item) => checkedItems[item.cartItemId || item.id]);

    const totalPrice = cart.reduce((sum, item) => {
        const id = item.cartItemId || item.id;
        if (checkedItems[id]) {
            return sum + item.price * item.quantity;
        }
        return sum;
    }, 0);

    const handleProceedToCheckout = () => {
        const hasSelected = cart.some((item) => checkedItems[item.cartItemId || item.id]);
        if (!hasSelected) {
            Swal.fire({ title: 'แจ้งเตือน', text: 'กรุณาเลือกสินค้าอย่างน้อย 1 รายการก่อนดำเนินการสั่งซื้อ', icon: 'info', confirmButtonColor: '#846F5B' });
            return;
        }
        if (!user) {
            Swal.fire({ title: 'แจ้งเตือน', text: 'กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ', icon: 'info', confirmButtonColor: '#846F5B' });
            return;
        }
        onClose();
        if (onOpenCheckout) {
            onOpenCheckout(customSelections);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal open" id="cartDrawer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1000 }}>
            {/* แทรก Style สำหรับทำ Custom Dropdown สวยๆ และปุ่มที่มี Animation นุ่มนวล */}
            <style>{`
        .beauty-select-wrap {
          position: relative;
          width: 220px;
        }
        .beauty-select {
          appearance: none;
          -webkit-appearance: none;
          background-color: #fff;
          border: 1.5px solid #e7d3d6;
          border-radius: 14px;
          padding: 10px 40px 10px 16px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #4a3439;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          width: 100%;
          box-shadow: 0 1px 3px rgba(183, 110, 121, 0.06);
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23b76e79' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 13px;
        }
        .beauty-select:hover {
          border-color: #b76e79;
          box-shadow: 0 2px 8px rgba(183, 110, 121, 0.12);
        }
        .beauty-select:focus {
          outline: none;
          border-color: #b76e79;
          box-shadow: 0 0 0 3px rgba(183, 110, 121, 0.15);
        }
        .beauty-select:active {
          transform: translateY(1px);
        }
        .beauty-select option {
          color: #4a3439;
          font-weight: 500;
        }
        .modern-checkout-btn {
          background-color: #1e293b;
          color: #ffffff;
          border: none;
          padding: 10px 32px;
          border-radius: 24px;
          fontSize: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 2px 5px rgba(0,0,0,0.06);
        }
        .modern-checkout-btn:hover {
          background-color: #0f172a;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(15, 23, 42, 0.2);
        }
        .modern-checkout-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .qty-action-btn {
          border: none;
          background: none;
          padding: 2px 8px;
          font-size: 1rem;
          font-weight: bold;
          transition: color 0.2s;
        }
      `}</style>

            <div className="modal-overlay" onClick={onClose} style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.4)' }}></div>

            <div className="modal-content" style={{ backgroundColor: '#fff', borderRadius: '16px', width: '90%', maxWidth: '850px', padding: '30px', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 1001 }}>

                <button className="modal-close" onClick={onClose} aria-label="Close Cart" style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
                    <i className="fa-solid fa-xmark"></i>
                </button>

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '500' }}>ตะกร้าสินค้า</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ccc', paddingBottom: '8px', marginBottom: '10px', fontSize: '0.9rem', color: '#333' }}>
                    <div style={{ fontWeight: '500' }}>เลือกสินค้า</div>
                    <div style={{ display: 'flex', gap: '100px', width: '220px', justifyContent: 'flex-end', paddingRight: '20px', fontWeight: '500' }}>
                        <div>ราคา</div>
                        <div>จำนวน</div>
                    </div>
                </div>

                <div style={{ maxHeight: '45vh', overflowY: 'auto', paddingRight: '5px' }}>
                    {cart.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
                            <i className="fa-solid fa-basket-shopping" style={{ fontSize: '2.5rem', marginBottom: '10px' }}></i>
                            <p>ยังไม่มีสินค้าในตะกร้า</p>
                        </div>
                    ) : (
                        cart.map((item) => {
                            const itemId = item.cartItemId || item.id;
                            const isChecked = !!checkedItems[itemId];

                            return (
                                <div key={itemId} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid #eee', padding: '20px 0' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>

                                        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start', flex: 1 }}>
                                            <input
                                                type="checkbox"
                                                checked={isChecked}
                                                onChange={() => handleCheckItem(itemId)}
                                                style={{ width: '18px', height: '18px', marginTop: '30px', cursor: 'pointer' }}
                                            />
                                            <div style={{ width: '100px', height: '100px', backgroundColor: '#e0e0e0', borderRadius: '4px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                {item.img ? <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: '#aaa', fontSize: '0.8rem' }}>Image</span>}
                                            </div>

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <h4 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 'normal' }}>{item.name}</h4>

                                                {item.isCustom && item.customOptions && item.customOptions.length > 0 ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                                                        {item.customOptions.map((opt, optIndex) => {
                                                            if (optIndex > 0) {
                                                                const prevSelectKey = `${itemId}-opt-${optIndex - 1}`;
                                                                if (!customSelections[prevSelectKey]) {
                                                                    return null;
                                                                }
                                                            }
                                                            const selectKey = `${itemId}-opt-${optIndex}`;
                                                            const selectedChoiceName = customSelections[selectKey] || '';

                                                            const selectedChoiceObj = opt.choices.find(c => {
                                                                if (typeof c === 'string') return c === selectedChoiceName;
                                                                return c.name === selectedChoiceName;
                                                            });
                                                            const selectedImage = selectedChoiceObj && typeof selectedChoiceObj === 'object' ? selectedChoiceObj.image : null;

                                                            return (
                                                                <div key={optIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                                    <div className="beauty-select-wrap">
                                                                        <select
                                                                            value={selectedChoiceName}
                                                                            className="beauty-select"
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                setCustomSelections(prev => {
                                                                                    const updated = { ...prev, [selectKey]: val };
                                                                                    for (let i = optIndex + 1; i < item.customOptions.length; i++) {
                                                                                        delete updated[`${itemId}-opt-${i}`];
                                                                                    }
                                                                                    return updated;
                                                                                });
                                                                            }}
                                                                        >
                                                                            <option value="">-- เลือก {opt.name} --</option>
                                                                            {opt.choices.map((choice, cIdx) => {
                                                                                const choiceName = typeof choice === 'string' ? choice : choice.name;
                                                                                return (
                                                                                    <option key={cIdx} value={choiceName}>{choiceName}</option>
                                                                                );
                                                                            })}
                                                                        </select>
                                                                    </div>
                                                                    {selectedImage && (
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', marginTop: '2px' }}>
                                                                            <i className="fa-solid fa-arrow-turn-up fa-rotate-90" style={{ color: '#cbd5e1', fontSize: '0.8rem' }}></i>
                                                                            <img src={selectedImage.startsWith('http') ? selectedImage : `/uploads/${selectedImage}`} alt={selectedChoiceName} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2d9c9' }} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span style={{ fontSize: '0.85rem', color: '#888' }}>
                                                        {item.description || ''}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '70px', width: '240px', justifyContent: 'flex-end', paddingTop: '10px' }}>
                                            <div style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', width: '70px', textAlign: 'right' }}>
                                                {item.price.toLocaleString()} B
                                            </div>

                                            {/* ส่วนเพิ่ม/ลดจำนวน (ปรับ Logic ตามที่ระบุแล้ว) */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <span style={{ fontSize: '1.1rem', minWidth: '15px', textAlign: 'center' }}>
                                                    {item.quantity}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#e2e8f0', borderRadius: '20px', padding: '2px 6px' }}>
                                                    <button
                                                        onClick={() => onIncreaseQty(item.id)}
                                                        className="qty-action-btn"
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        +
                                                    </button>
                                                    <span style={{ color: '#cbd5e1', margin: '0 2px' }}>|</span>
                                                    <button
                                                        onClick={() => {
                                                            // ถ้ามีมากกว่า 1 ชิ้น ค่อยเรียกฟังก์ชันลดจำนวนสินค้า
                                                            if (item.quantity > 1) {
                                                                onDecreaseQty(item.id);
                                                            }
                                                        }}
                                                        className="qty-action-btn"
                                                        disabled={item.quantity <= 1}
                                                        style={{
                                                            opacity: item.quantity <= 1 ? 0.35 : 1,
                                                            cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer'
                                                        }}
                                                    >
                                                        —
                                                    </button>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => onRemoveItem(item.id)}
                                                style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '1.1rem', marginLeft: '10px', padding: '2px' }}
                                                aria-label="Remove item"
                                            >
                                                <i className="fa-regular fa-trash-can"></i>
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div style={{ borderTop: '1px dashed #bbb', margin: '15px 0' }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.95rem' }}>
                        <input
                            type="checkbox"
                            checked={isAllChecked}
                            onChange={handleSelectAll}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                        />
                        เลือกทั้งหมด
                    </label>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
                        <span style={{ fontSize: '1.15rem' }}>
                            ยอดรวม: {totalPrice.toLocaleString()} ฿
                        </span>
                        <button
                            onClick={handleProceedToCheckout}
                            className="modern-checkout-btn"
                        >
                            สั่งสินค้า
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}