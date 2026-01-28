'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Seller {
  id: number;
  shop_name: string;
  owner_name: string;
  email: string;
  rating: number;
  status: 'active' | 'inactive' | 'suspended';
}

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [openMenu, setOpenMenu] = useState<number | null>(null);

  const loadSellers = async () => {
    try {
      const res = await axios.get<Seller[]>('/api/admin/sellers');
      setSellers(res.data);
    } catch (err) {
      console.error(err);
      setSellers([]);
    }
  };

  const updateStatus = async (sellerId: number, status: Seller['status']) => {
    if (!confirm(`Ubah status seller menjadi "${status}"?`)) return;
    await axios.post('/api/admin/sellers', { seller_id: sellerId, status });
    setOpenMenu(null);
    loadSellers();
  };

  useEffect(() => {
    loadSellers();
  }, []);

  const getStatusColor = (status: Seller['status']) => {
    switch (status) {
      case 'active': return '#2ecc71';      // hijau
      case 'inactive': return '#7f8c8d';    // abu
      case 'suspended': return '#e74c3c';   // merah
      default: return '#bdc3c7';
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🏪 Manajemen Seller</h1>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            {['Toko', 'Pemilik', 'Email', 'Rating', 'Status'].map(col => (
              <th key={col} style={thStyle}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sellers.map(s => (
            <tr key={s.id}>
              <td style={tdStyle}>{s.shop_name}</td>
              <td style={tdStyle}>{s.owner_name}</td>
              <td style={tdStyle}>{s.email}</td>
              <td style={tdStyle}>{s.rating ?? 0}</td>

              {/* Kolom status + aksi */}
              <td style={tdStyle}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Label status */}
                  <span style={{
                    backgroundColor: getStatusColor(s.status),
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    fontWeight: 500,
                  }}>
                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                  </span>

                  {/* Tombol titik 3 */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setOpenMenu(openMenu === s.id ? null : s.id)}
                      style={{
                        cursor: 'pointer',
                        fontSize: 18,
                        border: 'none',
                        background: 'transparent'
                      }}
                    >
                      ⋮
                    </button>

                    {/* Dropdown */}
                    {openMenu === s.id && (
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
                            style={{
                              padding: '6px 12px',
                              cursor: 'pointer',
                              backgroundColor: s.status === status ? '#f0f0f0' : '#fff',
                              color: getStatusColor(status as Seller['status']),
                              fontWeight: s.status === status ? 'bold' : 'normal'
                            }}
                            onClick={() => updateStatus(s.id, status as Seller['status'])}
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
