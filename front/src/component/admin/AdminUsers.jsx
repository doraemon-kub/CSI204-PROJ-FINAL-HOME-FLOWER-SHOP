import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminUsers.css';
const API_URL = '/api';

export default function AdminUsers({ user }) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = React.useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/users`, {
        headers: { 'x-user-id': user.id }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (targetUserId, currentRole) => {
    if (currentRole === 'ADMIN') {
      alert('ไม่สามารถเปลี่ยนยศของ ADMIN หลักได้');
      return;
    }

    const newRole = currentRole === 'MEMBER' ? 'STAFF' : 'MEMBER';
    if (!window.confirm(`คุณต้องการเปลี่ยนยศของผู้ใช้นี้เป็น ${newRole} ใช่หรือไม่?`)) return;

    try {
      await axios.put(`${API_URL}/admin/users/${targetUserId}/role`, {
        role: newRole
      }, {
        headers: { 'x-user-id': user.id }
      });
      alert('อัปเดตยศสำเร็จ!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user role', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการเปลี่ยนยศ');
    }
  };

  if (isLoading) return <div>กำลังโหลดข้อมูลผู้ใช้...</div>;

  return (
    <div>
      <h1 className="admin-page-title">จัดการผู้ใช้ / พนักงาน</h1>

      <div className="admin-card">


        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ชื่อ - นามสกุล</th>
                <th>อีเมล / เบอร์โทร</th>
                <th>วันที่สมัคร</th>
                <th>ยศ (Role)</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>
                    {u.email}<br/>
                    <span style={{ fontSize: '0.8rem', color: '#a89a89' }}>{u.phone || '-'}</span>
                  </td>
                  <td style={{ fontSize: '0.9rem', color: '#a89a89' }}>
                    {new Date(u.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td>
                    <span className={`role-badge ${u.role === 'ADMIN' ? 'role-admin' : u.role === 'STAFF' ? 'role-staff' : 'role-member'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.role === 'ADMIN' ? (
                      <span style={{ color: '#c4b5a3', fontSize: '0.8rem' }}>จัดการไม่ได้</span>
                    ) : u.role === 'STAFF' ? (
                      <button className="btn-demote" onClick={() => handleRoleChange(u.id, u.role)}>
                        <i className="fa-solid fa-arrow-down"></i> ปลดเป็น Member
                      </button>
                    ) : (
                      <button className="btn-promote" onClick={() => handleRoleChange(u.id, u.role)}>
                        <i className="fa-solid fa-arrow-up"></i> เลื่อนเป็น Staff
                      </button>
                    )}
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
