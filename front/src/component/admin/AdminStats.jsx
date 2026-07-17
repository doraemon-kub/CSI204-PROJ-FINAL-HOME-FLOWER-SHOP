import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminStats.css';
const API_URL = '/api';

export default function AdminStats({ user }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/stats`, {
          headers: { 'x-user-id': user.id }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.id) fetchStats();
  }, [user]);

  if (isLoading) return <div>กำลังโหลดสถิติ...</div>;
  if (!stats) return <div className="admin-error">เกิดข้อผิดพลาดในการโหลดสถิติ</div>;

  return (
    <div>
      <h1 className="admin-page-title">ภาพรวมสถิติร้านค้า</h1>
      
      <div className="stats-grid">


        {user.role === 'ADMIN' && (
          <div className="stat-card" style={{ borderBottomColor: '#a89a89' }}>
            <div className="stat-icon" style={{ background: '#f5f0e6', color: '#a89a89' }}><i className="fa-solid fa-money-bill-wave"></i></div>
            <div className="stat-info">
              <h3>ยอดขายรวม</h3>
              <p>฿{stats.totalSales.toLocaleString()}</p>
            </div>
          </div>
        )}
        <div className="stat-card" style={{ borderBottomColor: '#846F5B' }}>
          <div className="stat-icon" style={{ background: '#e6d8c3', color: '#846F5B' }}><i className="fa-solid fa-box"></i></div>
          <div className="stat-info">
            <h3>คำสั่งซื้อทั้งหมด</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottomColor: '#d9ad7c' }}>
          <div className="stat-icon" style={{ background: '#fdf6ed', color: '#d9ad7c' }}><i className="fa-solid fa-clock"></i></div>
          <div className="stat-info">
            <h3>รอตรวจสอบ</h3>
            <p>{stats.pendingOrders}</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottomColor: '#b76e79' }}>
          <div className="stat-icon" style={{ background: '#faeff1', color: '#b76e79' }}><i className="fa-solid fa-users"></i></div>
          <div className="stat-info">
            <h3>สมาชิกลูกค้า</h3>
            <p>{stats.totalMembers}</p>
          </div>
        </div>

        <div className="stat-card" style={{ borderBottomColor: '#7a8b7a' }}>
          <div className="stat-icon" style={{ background: '#eff2ef', color: '#7a8b7a' }}><i className="fa-solid fa-user-shield"></i></div>
          <div className="stat-info">
            <h3>พนักงานดูแล</h3>
            <p>{stats.totalStaff || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
