import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../utils/firestoreUtils';
import type { Product } from '../types/product';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err: any) {
        setError('Ürünler yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-50 py-10">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Ürünlerimiz</h2>
        {loading ? (
          <p className="text-center text-slate-600">Yükleniyor...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-slate-600">Henüz ürün eklenmedi.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col items-center">
                {product.imageUrl && (
                  <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover rounded mb-4" />
                )}
                <h3 className="text-lg font-bold text-slate-800 mb-2">{product.name}</h3>
                <p className="text-slate-600 mb-2 text-center">{product.description}</p>
                <div className="text-emerald-600 font-semibold text-lg mb-1">₺{product.price}</div>
                <div className="text-xs text-slate-400">{new Date(product.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products; 