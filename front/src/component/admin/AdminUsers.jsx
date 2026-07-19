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

  const handleDeleteUser = async (targetUserId, targetUserName) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${targetUserName}" ออกจากระบบ?`)) return;

    try {
      await axios.delete(`${API_URL}/admin/users/${targetUserId}`, {
        headers: { 'x-user-id': user.id }
      });
      alert('ลบผู้ใช้สำเร็จ!');
      fetchUsers();
    } catch (err) {
      console.error('Failed to delete user', err);
      alert(err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้');
    }
  };

  if (isLoading) return <div className="p-4 text-muted">กำลังโหลดข้อมูลผู้ใช้...</div>;

  return (
    <div className="p-4 admin-users-container">
      <div className="mb-4">
        <h2 className="fw-semibold mb-1">จัดการผู้ใช้ / พนักงาน</h2>
        <p className="text-muted small mb-0">มีผู้ใช้งานในระบบทั้งหมด {users.length} บัญชี</p>
      </div>

      <div className="card shadow-sm rounded-4 border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 table-custom-brand">
            <thead>
              <tr>
                <th className="py-3 px-4 border-0">ชื่อ - นามสกุล</th>
                <th className="py-3 px-4 border-0">อีเมล / เบอร์โทร</th>
                <th className="py-3 px-4 border-0">วันที่สมัคร</th>
                <th className="py-3 px-4 border-0">ยศ (Role)</th>
                <th className="py-3 px-4 border-0 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-4">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-person-circle fs-4 text-secondary"></i>
                      <span className="fw-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4">
                    <div><i className="bi bi-envelope me-2 text-muted"></i>{u.email}</div>
                    <div className="text-muted small mt-1">
                      <i className="bi bi-telephone me-2"></i>{u.phone || '-'}
                    </div>
                  </td>
                  <td className="px-4 text-muted small">
                    <i className="bi bi-calendar3 me-2"></i>
                    {new Date(u.createdAt).toLocaleDateString('th-TH')}
                  </td>
                  <td className="px-4">
                    <span className={`badge rounded-pill px-3 py-2 fw-semibold shadow-sm ${
                      u.role === 'ADMIN' ? 'bg-danger' : 
                      u.role === 'STAFF' ? 'bg-success' : 'bg-warning text-dark'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 text-center">
                    {user.role === 'STAFF' ? (
                      // If the logged in user is STAFF
                      u.role === 'MEMBER' ? (
                        <div className="d-flex justify-content-center">
                          <button className="btn btn-sm btn-outline-danger d-flex align-items-center gap-1" onClick={() => handleDeleteUser(u.id, u.name)}>
                            <i className="bi bi-trash"></i> ลบผู้ใช้
                          </button>
                        </div>
                      ) : (
                        <span className="text-muted small">จัดการไม่ได้</span>
                      )
                    ) : (
                      // If the logged in user is ADMIN
                      <div className="d-flex gap-2 justify-content-center align-items-center">
                        {u.role === 'ADMIN' ? (
                          <span className="text-muted small">จัดการไม่ได้</span>
                        ) : u.role === 'STAFF' ? (
                          <>
                            <button className="btn btn-sm btn-outline-warning d-flex align-items-center gap-1" onClick={() => handleRoleChange(u.id, u.role)}>
                              <i className="bi bi-arrow-down"></i> ปลดเป็น Member
                            </button>
                            <button className="btn btn-sm btn-outline-danger d-flex align-items-center" onClick={() => handleDeleteUser(u.id, u.name)} title="ลบผู้ใช้นี้">
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="btn btn-sm btn-outline-brand d-flex align-items-center gap-1" onClick={() => handleRoleChange(u.id, u.role)}>
                              <i className="bi bi-arrow-up"></i> เลื่อนเป็น Staff
                            </button>
                            <button className="btn btn-sm btn-outline-danger d-flex align-items-center" onClick={() => handleDeleteUser(u.id, u.name)} title="ลบผู้ใช้นี้">
                              <i className="bi bi-trash"></i>
                            </button>
                          </>
                        )}
                      </div>
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
