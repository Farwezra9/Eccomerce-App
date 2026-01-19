'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  description?: string;
  category_name?: string;
  status: string;
}

export default function SellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [shopName, setShopName] = useState('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category_id: '',
    status: 'active',
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  /* ======================
     LOAD DATA PRODUK + PROFILE + KATEGORI
  ====================== */
  useEffect(() => {
    Promise.all([
      axios.get('/api/seller/products'),
      axios.get('/api/seller/profile'),
      axios.get('/api/categories'),
    ])
      .then(([productsRes, profileRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setShopName(profileRes.data.shop_name);
        setCategories(categoriesRes.data);
      })
      .catch(err => {
        console.error('Gagal ambil data', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  /* ======================
     SUBMIT PRODUK (ADD / EDIT)
  ====================== */
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.category_id) {
      setError('Kategori wajib dipilih');
      return;
    }

    const method = editingId ? 'put' : 'post';
    const url = editingId ? `/api/seller/products/${editingId}` : '/api/seller/products';

    axios({ method, url, data: { ...form, price: Number(form.price), stock: Number(form.stock), category_id: Number(form.category_id) } })
      .then(() => {
        // refresh daftar produk
        return axios.get('/api/seller/products');
      })
      .then(res => {
        setProducts(res.data);
        // reset form
        setForm({ name: '', price: '', stock: '', description: '', category_id: '', status: 'active' });
        setEditingId(null);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Gagal menyimpan produk');
      });
  };

  /* ======================
     HAPUS PRODUK
  ====================== */
  const handleDelete = (id: number) => {
    if (!confirm('Hapus produk ini?')) return;

    axios.delete(`/api/seller/products/${id}`)
      .then(() => axios.get('/api/seller/products'))
      .then(res => setProducts(res.data))
      .catch(err => console.error('Gagal hapus produk', err));
  };

  /* ======================
     EDIT PRODUK (isi form)
  ====================== */
  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      stock: String(p.stock),
      description: p.description || '',
      category_id: categories.find(c => c.name === p.category_name)?.id.toString() || '',
      status: p.status,
    });
  };

  const formatPrice = (price: number) =>
    price.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Produk Saya</h1>
      {shopName && <h3>🏪 {shopName}</h3>}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
        <thead style={{ backgroundColor: '#f2f2f2' }}>
          <tr>
            <th style={th}>Nama</th>
            <th style={th}>Harga</th>
            <th style={th}>Stok</th>
            <th style={th}>Kategori</th>
            <th style={th}>Status</th>
            <th style={th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td style={td}>{p.name}</td>
              <td style={td}>{formatPrice(p.price)}</td>
              <td style={td}>{p.stock}</td>
              <td style={td}>{p.category_name || '-'}</td>
              <td style={td}>{p.status}</td>
              <td style={td}>
                <button onClick={() => handleEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ marginLeft: 8, color: 'red' }}>Hapus</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <hr style={{ margin: '20px 0' }} />

      <h2>{editingId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={submit} style={{ maxWidth: 400 }}>
        <div>
          <label>Nama Produk</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Harga</label>
          <input
            type="number"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            required
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Stok</label>
          <input
            type="number"
            value={form.stock}
            onChange={e => setForm({ ...form, stock: e.target.value })}
            required
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Kategori</label>
          <select
            value={form.category_id}
            onChange={e => setForm({ ...form, category_id: e.target.value })}
            required
          >
            <option value="">-- Pilih Kategori --</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Deskripsi</label>
          <textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <label>Status</label>
          <select
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <button type="submit" style={{ marginTop: 15 }}>
          {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
        </button>
      </form>
    </div>
  );
}

const th = { padding: 8, border: '1px solid #ddd' };
const td = { padding: 8, border: '1px solid #ddd' };
