'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const loadUsers = async () => {
    const res = await axios.get<User[]>('/api/admin/users');
    setUsers(res.data);
  };

  const updateStatus = async (userId: number, status: User['status']) => {
    if (!confirm(`Ubah status user menjadi "${status}"?`)) return;
    await axios.post('/api/admin/users', { user_id: userId, status });
    setOpenMenu(null);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // helper untuk warna status
  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active': return '#2ecc71'; // hijau
      case 'inactive': return '#7f8c8d'; // abu
      case 'suspended': return '#e74c3c'; // merah
      default: return '#bdc3c7';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>👤 Manajemen Users</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            {['Nama', 'Email', 'Role', 'Status'].map(col => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={tdStyle}>{u.name}</td>
              <td style={tdStyle}>{u.email}</td>
              <td style={tdStyle}>{u.role}</td>
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* label status */}
                  <span style={{
                    backgroundColor: getStatusColor(u.status),
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500
                  }}>
                    {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                  </span>

                  {/* tombol titik 3 */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === u.id ? null : u.id)}
                      style={{
                        cursor: 'pointer',
                        fontSize: 18,
                        border: 'none',
                        background: 'transparent'
                      }}
                    >
                      ⋮
                    </button>

                    {/* dropdown */}
                    {openMenu === u.id && (
                      <div style={{
                        position: 'absolute',
                        top: '24px',
                        left: 0,
                        background: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: 4,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        zIndex: 100,
                        minWidth: 120
                      }}>
                        {['active', 'inactive', 'suspended'].map(status => (
                          <div
                            key={status}
                            style={{ padding: '6px 12px', cursor: 'pointer' }}
                            onClick={() => updateStatus(u.id, status as User['status'])}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ====================== STYLE SAFE ====================== */
const thStyle: React.CSSProperties = { border: '1px solid #ccc', padding: 10, textAlign: 'left' };
const tdStyle: React.CSSProperties = { border: '1px solid #ccc', padding: 10 };
