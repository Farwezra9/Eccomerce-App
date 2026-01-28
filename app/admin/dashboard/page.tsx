'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    axios.get('/api/admin/dashboard').then(res => setData(res.data));
  }, []);

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>📊 Admin Dashboard</h1>
      <p>User: {data.total_users}</p>
      <p>Seller: {data.total_sellers}</p>
      <p>Order: {data.total_orders}</p>
      <p>Revenue: Rp{data.total_revenue}</p>
    </div>
  );
}
