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

      <h2 style={{ marginTop: '40px', color: '#665342', fontSize: '1.25rem', marginBottom: '20px' }}>จำนวนคำสั่งซื้อแยกตามสถานะ</h2>
      <div className="stats-grid">
        {stats.statusCounts && Object.keys(stats.statusCounts).length > 0 ? (
          Object.entries(stats.statusCounts).map(([status, count], index) => {
            const statusConfig = {
              'กำลังตรวจสอบการชำระเงิน': { color: '#d9ad7c', bg: '#fdf6ed', icon: 'fa-clock' },
              'ชำระเงินแล้ว': { color: '#665342', bg: '#efebe6', icon: 'fa-check-double' },
              'กำลังเตรียมจัดส่ง': { color: '#6b9080', bg: '#eaf4f0', icon: 'fa-box-open' },
              'จัดส่งแล้ว': { color: '#2a9d8f', bg: '#e6f4f2', icon: 'fa-truck-fast' },
              'จัดส่งสำเร็จ': { color: '#1d3557', bg: '#e6eaf0', icon: 'fa-house-circle-check' },
              'ยกเลิกคำสั่งซื้อ': { color: '#e63946', bg: '#fceced', icon: 'fa-ban' },
              'รอคืนเงิน': { color: '#f4a261', bg: '#fef5ec', icon: 'fa-rotate-left' },
              'คืนเงินสำเร็จ': { color: '#e9c46a', bg: '#fdf9ee', icon: 'fa-money-bill-transfer' },
              default: { color: '#a89a89', bg: '#f5f0e6', icon: 'fa-clipboard-check' }
            };
            
            const config = statusConfig[status] || statusConfig.default;

            return (
              <div className="stat-card" style={{ borderBottomColor: config.color, minHeight: '110px' }} key={index}>
                <div className="stat-icon" style={{ background: config.bg, color: config.color }}>
                  <i className={`fa-solid ${config.icon}`}></i>
                </div>
                <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <h3 style={{ 
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.95rem)', 
                    lineHeight: '1.4', 
                    whiteSpace: 'normal', 
                    wordBreak: 'break-word',
                    marginBottom: '8px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }} title={status}>
                    {status}
                  </h3>
                  <p style={{ margin: 0 }}>{count}</p>
                </div>
              </div>
            );
          })
        ) : (
          <p style={{ color: '#8a7a68' }}>ยังไม่มีข้อมูลคำสั่งซื้อ</p>
        )}
      </div>
    </div>
  );
}
