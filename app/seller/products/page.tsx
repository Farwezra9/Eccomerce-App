'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Package, 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle,
  X,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

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
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  
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

  // Fungsi fetch data tanpa AbortController
  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Hanya panggil produk dan kategori (karena profile sudah ada di navbar)
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/seller/products'),
        axios.get('/api/categories'),
      ]);
      
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Gagal ambil data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError('');
    setForm({ name: '', price: '', stock: '', description: '', category_id: '', status: 'active' });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.category_id) { setError('Kategori wajib dipilih'); return; }

    try {
      const method = editingId ? 'put' : 'post';
      const url = editingId ? `/api/seller/products/${editingId}` : '/api/seller/products';
      await axios({ 
        method, url, 
        data: { ...form, price: Number(form.price), stock: Number(form.stock), category_id: Number(form.category_id) } 
      });
      fetchInitialData();
      closeForm();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal menyimpan produk');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      await axios.delete(`/api/seller/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error('Gagal hapus produk', err);
    }
  };

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
    setShowForm(true);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage]);

  if (loading) return (
    <div className="flex h-96 items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-blue-600 h-8 w-8" />
            Produk Saya
          </h1>
          <p className="text-slate-500 mt-1">
            Kelola inventaris dan stok produk toko Anda.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all shadow-sm font-medium"
            />
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center gap-2 shrink-0 active:scale-95"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">Tambah Produk</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-lg shadow-slate-200/40 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex flex-row justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tampilkan</span>
            <div className="relative">
              <select 
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="appearance-none pl-3 pr-8 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-sm"
              >
                {[5, 10, 15, 20].map(val => (
                  <option key={val} value={val}>{val} Baris</option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 italic">
            <span className="text-blue-600">{indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)}</span> dari <span className="text-slate-800">{filteredProducts.length}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Info Produk</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Kategori</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider">Harga</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Stok</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-center">Status</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.length > 0 ? currentItems.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                  <td className="px-5 py-3">
                    <p className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{p.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1 max-w-[180px]">{p.description || 'Tanpa deskripsi'}</p>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {p.category_name || 'General'}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-bold text-slate-700 text-sm">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3 text-center">
                    <div className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black ${p.stock < 10 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-600'}`}>
                      {p.stock}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex justify-center">
                      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter shadow-sm border ${
                        p.status === 'active' 
                        ? 'text-emerald-600 bg-emerald-50 border-emerald-100' 
                        : 'text-slate-400 bg-slate-50 border-slate-100'
                      }`}>
                        {p.status === 'active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {p.status}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleEdit(p)} className="p-1.5 bg-slate-50 text-slate-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-1.5 bg-slate-50 text-slate-400 hover:bg-red-500 hover:text-white rounded-lg transition-all shadow-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-xs text-slate-400 font-medium italic">
                    Belum ada produk ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 hover:text-blue-600 transition-all disabled:opacity-30 shadow-sm"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-7 h-7 rounded-lg font-black text-[10px] transition-all ${
                    currentPage === i + 1 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                    : 'bg-white border border-slate-200 text-slate-400 hover:border-blue-600 hover:text-blue-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="flex items-center gap-1 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-500 hover:text-blue-600 transition-all disabled:opacity-30 shadow-sm"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={closeForm}></div>
          <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-10 py-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-xl">
                    {editingId ? <Pencil className="text-blue-600" /> : <Plus className="text-blue-600" />}
                  </div>
                  {editingId ? 'Edit Produk' : 'Produk Baru'}
                </h2>
                <button onClick={closeForm} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                  <X size={24} />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-3">
                  <AlertCircle size={20} className="shrink-0" /> {error}
                </div>
              )}

              <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Nama Produk</label>
                  <input
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Masukkan nama produk..."
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Harga</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                    <input
                      type="number"
                      className="w-full pl-12 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Stok</label>
                  <input
                    type="number"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.stock}
                    onChange={e => setForm({ ...form, stock: e.target.value })}
                    placeholder="0"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Kategori</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    value={form.category_id}
                    onChange={e => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Status</label>
                  <select
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                    value={form.status}
                    onChange={e => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 block">Deskripsi</label>
                  <textarea
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px] resize-none"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Tuliskan deskripsi produk..."
                  />
                </div>

                <div className="md:col-span-2 flex gap-4 mt-4">
                  <button 
                    type="submit" 
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-blue-200 transition-all flex items-center justify-center gap-2"
                  >
                    {editingId ? 'Update Produk' : 'Simpan Produk'}
                  </button>
                  <button 
                    type="button" 
                    onClick={closeForm}
                    className="px-8 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}