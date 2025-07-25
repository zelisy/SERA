import React, { useState, useEffect } from 'react';
import { saveProduct, getAllProducts, deleteProduct, updateProduct } from '../utils/firestoreUtils';
import type { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';

const AdminProducts: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', imageUrl: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      const data = await getAllProducts();
      setProducts(data);
    } catch {
      setMessage('Ürünler yüklenemedi.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      if (editId) {
        await updateProduct(editId, {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          imageUrl: form.imageUrl,
        });
        setMessage('Ürün güncellendi!');
      } else {
        await saveProduct({
          name: form.name,
          description: form.description,
          price: Number(form.price),
          imageUrl: form.imageUrl,
        });
        setMessage('Ürün başarıyla eklendi!');
      }
      setForm({ name: '', description: '', price: '', imageUrl: '' });
      setShowForm(false);
      setEditId(null);
      fetchProducts();
    } catch (err: any) {
      setMessage('İşlem başarısız.');
    }
    setLoading(false);
  };

  const handleEdit = (product: Product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
    });
    setShowForm(true);
    setEditId(product.id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    setLoading(true);
    setMessage('');
    try {
      await deleteProduct(id);
      setMessage('Ürün silindi!');
      fetchProducts();
    } catch {
      setMessage('Ürün silinemedi.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-50 py-10">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <button onClick={() => navigate(-1)} className="mb-6 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow hover:from-gray-400 hover:to-gray-500 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Ürün Yönetimi</h2>
        <p className="text-slate-700 text-center mb-8">Buradan ürün ekleyebilir, güncelleyebilir ve silebilirsiniz.</p>
        <div className="flex justify-center mb-6">
          <button
            className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
            onClick={() => {
              setShowForm(!showForm);
              setForm({ name: '', description: '', price: '', imageUrl: '' });
              setEditId(null);
            }}
          >
            {showForm ? 'Formu Kapat' : 'Yeni Ürün Ekle'}
          </button>
        </div>
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-4 mb-8 max-w-xl mx-auto bg-white p-6 rounded-xl shadow border border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ürün Adı</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Açıklama</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Fiyat (₺)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Görsel URL</label>
              <input
                type="text"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-2 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            >
              {loading ? (editId ? 'Güncelleniyor...' : 'Ekleniyor...') : (editId ? 'Güncelle' : 'Ekle')}
            </button>
            {message && <div className="text-center text-emerald-600 mt-2">{message}</div>}
          </form>
        )}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow border border-gray-100">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Görsel</th>
                <th className="px-4 py-2 text-left">Adı</th>
                <th className="px-4 py-2 text-left">Açıklama</th>
                <th className="px-4 py-2 text-left">Fiyat</th>
                <th className="px-4 py-2 text-left">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t">
                  <td className="px-4 py-2">
                    {product.imageUrl && (
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded" />
                    )}
                  </td>
                  <td className="px-4 py-2 font-semibold">{product.name}</td>
                  <td className="px-4 py-2">{product.description}</td>
                  <td className="px-4 py-2 text-emerald-700 font-bold">₺{product.price}</td>
                  <td className="px-4 py-2 space-x-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                      onClick={() => handleEdit(product)}
                    >Düzenle</button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      onClick={() => handleDelete(product.id)}
                    >Sil</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminProducts; 