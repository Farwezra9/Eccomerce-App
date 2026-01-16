'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function CreateProduct() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '',
    description: '',
    category_id: '',
    status: 'active', // default
  });

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ambil kategori dari API saat load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/api/categories'); // endpoint ambil kategori
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!form.category_id) {
      setError('Kategori wajib dipilih');
      setLoading(false);
      return;
    }

    try {
      await axios.post('/api/seller/products', {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: Number(form.category_id),
      });
      router.push('/seller/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal tambah produk');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Tambah Produk</h1>

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

        {error && <p style={{ color: 'red', marginTop: 10 }}>{error}</p>}

        <button type="submit" style={{ marginTop: 15 }} disabled={loading}>
          {loading ? 'Menyimpan...' : 'Simpan'}
        </button>
      </form>
    </>
  );
}
