import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../utils/firestoreUtils';
import type { Product } from '../types/product';
import { useNavigate } from 'react-router-dom';
import arkaplanImage from '../assets/arkaplan1.jpg';
import OptimizedImage from '../components/OptimizedImage';

// Authentication kontrolü
const isAuthenticated = () => {
  return !!localStorage.getItem('isLoggedIn');
};

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
    <div className="relative min-h-screen">
      {/* Full Screen Background - Image + Overlay */}
      <div className="absolute inset-0">
        <OptimizedImage 
          src={arkaplanImage} 
          alt="AGROVİA Sistemi Arkaplan"
          className="w-full h-full object-cover"
          style={{ minHeight: '100vh' } as React.CSSProperties}
          optimize={{ width: 1920, height: 1080, crop: 'limit' }}
        />
        {/* Dark Overlay with Green Gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-emerald-900/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="pt-20 pb-16">
          <div className="max-w-5xl mx-auto px-4">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => navigate(-1)} className="bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold py-2 px-6 rounded-xl shadow hover:from-gray-700 hover:to-gray-800 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
                  ← Geri
                </button>
                {isAuthenticated() && (
                  <button 
                    onClick={() => navigate('/admin/products')} 
                    className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-2 px-6 rounded-xl shadow hover:from-emerald-600 hover:to-blue-600 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  >
                    🛠️ Ürün Yönetimi
                  </button>
                )}
              </div>
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Ürünlerimiz</h2>
              {loading ? (
                <p className="text-center text-gray-300">Yükleniyor...</p>
              ) : error ? (
                <p className="text-center text-red-400">{error}</p>
              ) : products.length === 0 ? (
                <p className="text-center text-gray-300">Henüz ürün eklenmedi.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.map(product => (
                    <div key={product.id} className="bg-gray-700/50 backdrop-blur-sm rounded-xl shadow border border-gray-600 p-6 flex flex-col items-center hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      {product.imageUrl && (
                        <OptimizedImage src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover rounded mb-4" optimize={{ width: 256, height: 256, crop: 'fill' }} />
                      )}
                      <h3 className="text-lg font-bold text-white mb-2">{product.name}</h3>
                      <p className="text-gray-300 mb-2 text-center">{product.description}</p>
                      <div className="text-emerald-400 font-semibold text-lg mb-1">₺{product.price}</div>
                       <div className="text-xs text-gray-400">{new Date(product.createdAt ?? Date.now()).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products; 