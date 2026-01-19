'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Address {
  id: number;
  recipient_name: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
  created_at: string;
  addresses: Address[];
}

const emptyForm = {
  recipient_name: '',
  phone: '',
  address: '',
  city: '',
  postal_code: '',
};

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<any>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  /* ======================
     LOAD PROFILE
  ====================== */
  const loadProfile = async () => {
    try {
      const res = await axios.get('/api/profile');
      setProfile(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.replace('/auth/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ======================
     SUBMIT (ADD / EDIT)
  ====================== */
  const handleSubmit = async () => {
    const url = editingId
      ? `/api/user/addresses/${editingId}`
      : `/api/user/addresses`;

    const method = editingId ? 'put' : 'post';

    await axios({
      method,
      url,
      data: form,
    });

    setForm(emptyForm);
    setEditingId(null);
    loadProfile();
  };

  /* ======================
     DELETE
  ====================== */
  const handleDelete = async (id: number) => {
    if (!confirm('Hapus alamat ini?')) return;
    await axios.delete(`/api/user/addresses/${id}`);
    loadProfile();
  };

  if (loading || !profile) return <p>Loading...</p>;

  const canAdd = profile.addresses.length < 2;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h1>Profile</h1>

      <p><b>Nama:</b> {profile.name}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Role:</b> {profile.role}</p>

      <hr />

      <h2>Alamat Pengiriman</h2>

      {profile.addresses.length === 0 && <p>Belum ada alamat</p>}

      {profile.addresses.map(addr => (
        <div
          key={addr.id}
          style={{ border: '1px solid #ddd', padding: 12, marginBottom: 10 }}
        >
          <p><b>{addr.recipient_name}</b></p>
          <p>{addr.address}, {addr.city}, {addr.postal_code}</p>
          <p>{addr.phone}</p>

          <button
            onClick={() => {
              setEditingId(addr.id);
              setForm({
                recipient_name: addr.recipient_name,
                phone: addr.phone,
                address: addr.address,
                city: addr.city,
                postal_code: addr.postal_code,
              });
            }}
          >
            Edit
          </button>

          <button
            onClick={() => handleDelete(addr.id)}
            style={{ marginLeft: 8, color: 'red' }}
          >
            Hapus
          </button>
        </div>
      ))}

      {(canAdd || editingId !== null) && (
        <>
          <hr />
          <h3>{editingId ? 'Edit Alamat' : 'Tambah Alamat'}</h3>

          {Object.keys(emptyForm).map(key => (
            <input
              key={key}
              placeholder={key.replace('_', ' ')}
              value={(form as any)[key]}
              onChange={e =>
                setForm({ ...form, [key]: e.target.value })
              }
              style={{ display: 'block', width: '100%', marginBottom: 8 }}
            />
          ))}

          <button onClick={handleSubmit}>
            {editingId ? 'Simpan Perubahan' : 'Tambah Alamat'}
          </button>

          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              style={{ marginLeft: 8 }}
            >
              Batal
            </button>
          )}
        </>
      )}

      {!canAdd && editingId === null && (
        <p style={{ color: 'gray' }}>
          Maksimal 2 alamat. Hapus salah satu untuk menambah alamat baru.
        </p>
      )}
    </div>
  );
}
