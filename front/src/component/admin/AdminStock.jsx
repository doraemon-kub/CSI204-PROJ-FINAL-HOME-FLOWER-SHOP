import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = '/api';

export default function AdminStock({ user }) {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStockId, setEditingStockId] = useState(null);
    const [editStockValue, setEditStockValue] = useState(0);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products`);
            setProducts(response.data);
        } catch (err) {
            console.error('Failed to fetch products', err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleUpdateStock = async (id) => {
        let finalStock = parseInt(editStockValue, 10);
        if (isNaN(finalStock) || finalStock < 0) {
            alert('ห้ามใส่ตัวเลขติดลบไอสัส');
            finalStock = 0;
        }

        else if (finalStock > 99) {
            alert('ไม่สามารถใส่จำนวนเกิน 99 ชิ้นได้');
            finalStock = 99;
        }

        else {
            try {
                const data = new FormData();
                data.append('stock', finalStock);
                await axios.put(`${API_URL}/products/${id}`, data, {
                    headers: {
                        'x-user-id': user.id,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                alert('อัปเดตสต๊อกเรียบร้อยแล้ว');
                setEditingStockId(null);
                fetchProducts();
            } catch (err) {
                console.error('Failed to update stock', err);
                alert('เกิดข้อผิดพลาดในการอัปเดตสต๊อก');
            }
        };
    }

    if (isLoading) return <div>กำลังโหลดข้อมูลสินค้า...</div>;

    return (
        <div>
            <h1 className="admin-page-title" style={{ marginBottom: '24px' }}>จัดการสต๊อกสินค้า</h1>
            <div className="admin-card">
                <div style={{ overflowX: 'auto' }}>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>รูป</th>
                                <th>ชื่อสินค้า</th>
                                <th>สต๊อกคงเหลือ</th>
                                <th>จัดการ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>ไม่มีสินค้าในระบบ</td>
                                </tr>
                            ) : (
                                products.map(p => (
                                    <tr key={p.id}>
                                        <td>
                                            {p.image ? (
                                                <img src={`/uploads/${p.image}`} alt={p.name} className="product-img-preview" />
                                            ) : (
                                                <div className="product-img-preview" style={{ background: '#e2e8f0' }}></div>
                                            )}
                                        </td>
                                        <td>{p.name}</td>
                                        <td>
                                            {editingStockId === p.id ? (
                                                <input
                                                    type="number"
                                                    value={editStockValue}
                                                    onChange={(e) => setEditStockValue(e.target.value)}
                                                    style={{ width: '80px', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                                    min={0}
                                                    max={99}
                                                />
                                            ) : (
                                                <span style={{ fontWeight: '600', color: (p.stock || 0) > 0 ? '#10b981' : '#ef4444' }}>
                                                    {p.stock || 0} ชิ้น
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            {editingStockId === p.id ? (
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => handleUpdateStock(p.id)}
                                                        style={{ padding: '6px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                    >
                                                        บันทึก
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingStockId(null)}
                                                        style={{ padding: '6px 12px', border: '1px solid #cbd5e1', background: '#f8fafc', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => { setEditingStockId(p.id); setEditStockValue(p.stock || 0); }}
                                                    style={{ padding: '6px 12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', color: '#64748b' }}
                                                >
                                                    <i className="fa-solid fa-pen"></i> แก้ไขสต๊อก
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
