'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  parent_name?: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<number | ''>('');
  const [loading, setLoading] = useState(true);

  const loadCategories = async () => {
    try {
      const res = await axios.get<Category[]>('/api/admin/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async () => {
    if (!name.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    await axios.post('/api/admin/categories', {
      name,
      parent_id: parentId || null
    });

    setName('');
    setParentId('');
    loadCategories();
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) return <p>Memuat kategori...</p>;

  return (
    <div style={{ padding: 20 }}>
      <h1>📂 Manajemen Kategori</h1>

      {/* FORM */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Nama kategori"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ padding: 8, marginRight: 8 }}
        />

        <select
          value={parentId}
          onChange={e =>
            setParentId(e.target.value ? Number(e.target.value) : '')
          }
          style={{ padding: 8, marginRight: 8 }}
        >
          <option value="">Tanpa Parent</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button onClick={createCategory}>Tambah</button>
      </div>

      {/* TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#eee' }}>
            <th style={thStyle}>Nama</th>
            <th style={thStyle}>Parent</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td style={tdStyle}>{c.name}</td>
              <td style={tdStyle}>{c.parent_name ?? '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ======================
   STYLE (TS SAFE)
   ====================== */

const thStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px',
  textAlign: 'left'
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ccc',
  padding: '10px'
};
