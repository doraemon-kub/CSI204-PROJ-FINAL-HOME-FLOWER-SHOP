import React, { useState, useEffect } from 'react';
import AdminStats from './AdminStats';
import AdminOrders from './AdminOrders';
import AdminProducts from './AdminProducts';
import AdminStock from './AdminStock';
import AdminUsers from './AdminUsers';
import AdminLogs from './AdminLogs';
import './adminDashboard.css';
export default function AdminDashboard({ user, onViewChange }) {
  const [activeTab, setActiveTab] = useState('stats');

  // Basic guard (just in case, though App.jsx should handle this)
  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
      onViewChange('#home');
    }
  }, [user, onViewChange]);

  if (!user) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'stats':
        return <AdminStats user={user} />;
      case 'orders':
        return <AdminOrders user={user} />;
      case 'products':
        if (user.role === 'ADMIN') {
          return <AdminProducts user={user} />;
        }
        return <div className="admin-error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)</div>;
      case 'stock':
        return <AdminStock user={user} />;
      case 'users':
        if (user.role === 'ADMIN') {
           return <AdminUsers user={user} />;
        }
        return <div className="admin-error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)</div>;
      case 'logs':
        if (user.role === 'ADMIN') {
           return <AdminLogs user={user} />;
        }
        return <div className="admin-error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ (เฉพาะ Admin)</div>;
      default:
        return <AdminStats user={user} />;
    }
  };

  return (
    <div className="admin-dashboard-container">


      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>{user.role === 'ADMIN' ? 'Admin Panel' : 'Staff Panel'}</h2>
          <p>Role: {user.role}</p>
        </div>
        <ul className="admin-nav-list">
          <li 
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <i className="fa-solid fa-chart-pie"></i> ภาพรวมสถิติ
          </li>
          <li 
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <i className="fa-solid fa-box-open"></i> จัดการคำสั่งซื้อ
          </li>
          <li 
            className={`admin-nav-item ${activeTab === 'stock' ? 'active' : ''}`}
            onClick={() => setActiveTab('stock')}
          >
            <i className="fa-solid fa-boxes-stacked"></i> จัดการสต๊อก
          </li>
          {user.role === 'ADMIN' && (
            <li 
              className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fa-solid fa-tags"></i> จัดการข้อมูลสินค้า
            </li>
          )}
          {(user.role === 'ADMIN' || user.role === 'STAFF') && (
            <li 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              <i className="fa-solid fa-users"></i> จัดการผู้ใช้/พนักงาน
            </li>
          )}
          {user.role === 'ADMIN' && (
            <li 
              className={`admin-nav-item ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              <i className="fa-solid fa-list-check"></i> ประวัติการทำงาน (Logs)
            </li>
          )}
        </ul>
      </aside>

      <main className="admin-content">
        {renderContent()}
      </main>
    </div>
  );
}
