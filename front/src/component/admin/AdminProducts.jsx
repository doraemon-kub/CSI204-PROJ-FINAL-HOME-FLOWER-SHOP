import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminProducts.css';
const API_URL = '/api';

export default function AdminProducts({ user }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'ready-made',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      data.append('category', formData.category);
      data.append('description', formData.description);
      if (imageFile) {
        data.append('image', imageFile);
      }

      await axios.post(`${API_URL}/products`, data, {
        headers: { 
          'x-user-id': user.id,
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('เพิ่มสินค้าเรียบร้อยแล้ว');
      setIsAdding(false);
      setFormData({ name: '', price: '', category: 'ready-made', description: '' });
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to add product', err);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) return;
    try {
      await axios.delete(`${API_URL}/products/${id}`, {
        headers: { 'x-user-id': user.id }
      });
      alert('ลบสินค้าสำเร็จ');
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product', err);
      alert('เกิดข้อผิดพลาดในการลบสินค้า');
    }
  };

  if (isLoading) return <div>กำลังโหลดสินค้า...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="admin-page-title" style={{ margin: 0 }}>จัดการสินค้า</h1>
        {!isAdding && (
          <button className="btn-add-product" onClick={() => setIsAdding(true)}>
            <i className="fa-solid fa-plus"></i> เพิ่มสินค้าใหม่
          </button>
        )}
      </div>



      {isAdding && (
        <div className="add-product-form">
          <h2 style={{ marginTop: 0, color: '#1e293b' }}>เพิ่มสินค้าใหม่</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group-admin">
                <label>ชื่อสินค้า</label>
                <input type="text" name="name" required value={formData.name} onChange={handleInputChange} />
              </div>
              <div className="form-group-admin">
                <label>ราคา (บาท)</label>
                <input type="number" name="price" required value={formData.price} onChange={handleInputChange} />
              </div>
              <div className="form-group-admin">
                <label>หมวดหมู่</label>
                <select name="category" value={formData.category} onChange={handleInputChange}>
                  <option value="ready-made">ดอกไม้แห้ง</option>
                  <option value="custom">ดอกไม้ประดิษฐ์</option>
                  <option value="gift">ของขวัญ</option>
                </select>
              </div>
              <div className="form-group-admin">
                <label>รูปภาพสินค้า</label>
                <input type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <div className="form-group-admin">
              <label>รายละเอียด</label>
              <textarea name="description" rows="3" value={formData.description} onChange={handleInputChange}></textarea>
            </div>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" className="btn-cancel" style={{ padding: '12px 24px', borderRadius: '30px', border: '1px solid #e2d9c9', background: '#fff', color: '#8a7a68', cursor: 'pointer', fontWeight: '600' }} onClick={() => setIsAdding(false)}>ยกเลิก</button>
              <button type="submit" className="btn-save" style={{ padding: '12px 24px', borderRadius: '30px', border: 'none', cursor: 'pointer', background: 'var(--primary, #846F5B)', color: '#fff', fontWeight: '600', boxShadow: '0 4px 12px rgba(132,111,91,0.2)' }}>บันทึกสินค้า</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>รูป</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th>ราคา</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>
                    {p.image ? (
                      <img src={`http://localhost:3000/uploads/${p.image}`} alt={p.name} className="product-img-preview" />
                    ) : (
                      <div className="product-img-preview" style={{ background: '#e2e8f0' }}></div>
                    )}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>฿{p.price}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(p.id)}>
                      <i className="fa-solid fa-trash"></i> ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
