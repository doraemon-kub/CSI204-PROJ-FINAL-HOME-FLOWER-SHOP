import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './adminLogs.css';

const API_URL = '/api';

export default function AdminLogs({ user }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get(`${API_URL}/admin/logs`, {
          headers: { 'x-user-id': user.id }
        });
        setLogs(response.data);
      } catch (err) {
        console.error('Failed to fetch logs', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user && user.role === 'ADMIN') {
      fetchLogs();
    }
  }, [user]);

  if (isLoading) return <div>กำลังโหลดประวัติการทำงาน...</div>;
  if (user.role !== 'ADMIN') return <div className="admin-error">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</div>;

  const filteredLogs = logs.filter(log => {
    const roleMatch = roleFilter === 'ALL' || (log.userRole || 'MEMBER').toUpperCase() === roleFilter;
    const actionMatch = actionFilter === 'ALL' || log.action === actionFilter;
    const searchMatch = !searchQuery || (log.userName && log.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    return roleMatch && actionMatch && searchMatch;
  });

  const uniqueActions = ['ALL', ...new Set(logs.map(log => log.action))];

  const getActionBadgeStyle = (action) => {
    switch (action) {
      case 'CREATE_ORDER': return { backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' };
      case 'UPDATE_ORDER_STATUS': return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
      case 'ADD_TO_CART': return { backgroundColor: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' };
      case 'REGISTER': return { backgroundColor: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' };
      case 'LOGIN': return { backgroundColor: '#ccfbf1', color: '#115e59', border: '1px solid #99f6e4' };
      case 'LOGOUT': return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
      case 'ADD_ADDRESS': return { backgroundColor: '#fae8ff', color: '#86198f', border: '1px solid #f5d0fe' };
      case 'UPDATE_ADDRESS': return { backgroundColor: '#fce7f3', color: '#9d174d', border: '1px solid #fbcfe8' };
      case 'DELETE_ADDRESS': return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' };
      case 'UPDATE_ROLE': return { backgroundColor: '#fff7ed', color: '#9a3412', border: '1px solid #ffedd5' };
      default: return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' };
    }
  };

  return (
    <div>
      <div className="admin-header-flex">
        <h1 className="admin-page-title">ประวัติการทำงาน (Audit Logs)</h1>
      </div>

      <div className="admin-card">
        <div className="log-filters" style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="filter-group">
            <label style={{ marginRight: '8px', fontWeight: '500' }}>ดูตาม Role:</label>
            <select 
              value={roleFilter} 
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              <option value="ALL">ทั้งหมด</option>
              <option value="ADMIN">ADMIN</option>
              <option value="STAFF">STAFF</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </div>

          <div className="filter-group">
            <label style={{ marginRight: '8px', fontWeight: '500' }}>การกระทำ (Action):</label>
            <select 
              value={actionFilter} 
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action === 'ALL' ? 'ทั้งหมด' : action}
                </option>
              ))}
            </select>
          </div>
          
          <div className="filter-group" style={{ flex: '1', minWidth: '200px' }}>
            <label style={{ marginRight: '8px', fontWeight: '500' }}>ค้นหาชื่อผู้ใช้:</label>
            <input 
              type="text" 
              placeholder="พิมพ์ชื่อเพื่อค้นหา..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', maxWidth: '300px', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>วัน/เวลา</th>
                <th>ผู้ดำเนินการ</th>
                <th>บทบาท</th>
                <th>การกระทำ (Action)</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '24px' }}>ไม่พบข้อมูลที่ค้นหา</td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      {new Date(log.timestamp).toLocaleString('th-TH', { 
                        year: 'numeric', month: 'short', day: 'numeric', 
                        hour: '2-digit', minute:'2-digit', second:'2-digit' 
                      })}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{log.userName}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888' }}>{log.userId}</div>
                    </td>
                    <td>
                      <span className={`role-badge ${log.userRole?.toLowerCase() || 'member'}`}>
                        {log.userRole || 'MEMBER'}
                      </span>
                    </td>
                    <td>
                      <span 
                        className="log-action-badge" 
                        style={getActionBadgeStyle(log.action)}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.details}</td>
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
