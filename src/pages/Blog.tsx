import React from 'react';
import arkaplanImage from '../assets/arkaplan.jpg';

const Blog: React.FC = () => (
  <div className="relative min-h-screen">
    {/* Full Screen Background - Image + Overlay */}
    <div className="absolute inset-0">
      <img 
        src={arkaplanImage} 
                  alt="AGROVİA Sistemi Arkaplan"
        className="w-full h-full object-cover"
        style={{ minHeight: '100vh' }}
      />
      {/* Dark Overlay with Green Gradient for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-gray-900/60 to-emerald-900/70"></div>
    </div>

    {/* Content */}
    <div className="relative z-10">
      <div className="pt-20 pb-16">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Blog</h2>
            <p className="text-gray-300 text-center">Güncel haberler, duyurular ve makaleler için blogumuzu takip edin.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default Blog; 