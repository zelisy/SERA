import React, { useState, useEffect } from 'react';
import arkaplanImage from '../assets/arkaplan1.jpg';
import { getPublishedBlogs, getFeaturedBlogs, getBlogById, incrementBlogViewCount } from '../utils/blogUtils';
import type { Blog } from '../types/blog';

const BlogPage: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showBlogDetail, setShowBlogDetail] = useState(false);

  const categories = [
    'Tümü',
    'Sera Teknolojileri',
    'Tarım İpuçları',
    'Ürün Yetiştirme',
    'Hastalık Kontrolü',
    'Gübreleme',
    'Sulama Sistemleri',
    'İklim Kontrolü',
    'Hasat Teknikleri',
    'Pazarlama',
    'Genel'
  ];

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const [publishedBlogs, featured] = await Promise.all([
        getPublishedBlogs(),
        getFeaturedBlogs()
      ]);
      console.log('Yayınlanmış bloglar:', publishedBlogs);
      console.log('Öne çıkan bloglar:', featured);
      setBlogs(publishedBlogs);
      setFeaturedBlogs(featured);
    } catch (err) {
      console.error('Blog yükleme hatası:', err);
      setError('Bloglar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredBlogs = selectedCategory === 'all' 
    ? blogs 
    : blogs.filter(blog => blog.category === selectedCategory);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleBlogClick = async (blog: Blog) => {
    try {
      // Görüntülenme sayısını artır
      await incrementBlogViewCount(blog.id);
      
      // Blog detayını yükle
      const fullBlog = await getBlogById(blog.id);
      if (fullBlog) {
        setSelectedBlog(fullBlog);
        setShowBlogDetail(true);
      }
    } catch (err) {
      console.error('Blog detayı yüklenemedi:', err);
    }
  };

  const closeBlogDetail = () => {
    setShowBlogDetail(false);
    setSelectedBlog(null);
  };

  return (
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              📝 Blog & Makaleler
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Sera teknolojileri, tarım ipuçları ve güncel haberler için blogumuzu takip edin
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-300">Bloglar yükleniyor...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900/50 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-red-700">
              <div className="flex items-center space-x-2">
                <span className="text-red-400">❌</span>
                <span className="text-red-300">{error}</span>
              </div>
            </div>
          )}

          {/* Featured Blogs */}
          {featuredBlogs.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <span className="mr-2">⭐</span>
                Öne Çıkan Yazılar
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featuredBlogs.slice(0, 2).map((blog) => (
                  <div 
                    key={blog.id} 
                    className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                    onClick={() => handleBlogClick(blog)}
                  >
                    {blog.imageUrl && (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    )}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {blog.category}
                      </span>
                      <span className="text-emerald-400">⭐</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-gray-300 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>👤 {blog.author}</span>
                      <span>📅 {formatDate(blog.publishedAt || blog.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div className="mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-gray-700">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category === 'Tümü' ? 'all' : category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      (category === 'Tümü' && selectedCategory === 'all') || 
                      (category !== 'Tümü' && selectedCategory === category)
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog List */}
          {filteredBlogs.length === 0 && !loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-white mb-2">Henüz blog yok</h3>
              <p className="text-gray-300">
                {selectedCategory === 'all' 
                  ? 'Henüz hiç blog yazısı yayınlanmamış.'
                  : `${selectedCategory} kategorisinde henüz blog yazısı yok.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBlogs.map((blog) => (
                <div 
                  key={blog.id} 
                  className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                  onClick={() => handleBlogClick(blog)}
                >
                  {blog.imageUrl && (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-48 object-cover rounded-xl mb-4"
                    />
                  )}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      {blog.category}
                    </span>
                    {blog.featured && (
                      <span className="text-yellow-400">⭐</span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-gray-300 mb-4 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>👤 {blog.author}</span>
                    <span>📅 {formatDate(blog.publishedAt || blog.createdAt)}</span>
                  </div>
                  {blog.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {blog.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs rounded-full bg-gray-700/50 text-gray-300"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Blog Detail Modal */}
          {showBlogDetail && selectedBlog && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeBlogDetail}>
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-emerald-100 text-emerald-800">
                        {selectedBlog.category}
                      </span>
                      {selectedBlog.featured && (
                        <span className="text-yellow-500 text-xl">⭐</span>
                      )}
                    </div>
                    <button
                      onClick={closeBlogDetail}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Blog Image */}
                  {selectedBlog.imageUrl && (
                    <div className="mb-6">
                      <img
                        src={selectedBlog.imageUrl}
                        alt={selectedBlog.title}
                        className="w-full h-64 lg:h-80 object-cover rounded-xl shadow-lg"
                      />
                    </div>
                  )}

                  {/* Blog Title */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                    {selectedBlog.title}
                  </h1>

                  {/* Blog Meta */}
                  <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <span>👤</span>
                      <span className="font-medium">{selectedBlog.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{formatDate(selectedBlog.publishedAt || selectedBlog.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span>👁️</span>
                      <span>{selectedBlog.viewCount} görüntülenme</span>
                    </div>
                  </div>

                  {/* Blog Excerpt */}
                  {selectedBlog.excerpt && (
                    <div className="mb-6 p-4 bg-gray-50 rounded-xl border-l-4 border-emerald-500">
                      <p className="text-lg text-gray-700 italic">
                        "{selectedBlog.excerpt}"
                      </p>
                    </div>
                  )}

                  {/* Blog Content */}
                  <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedBlog.content}
                    </div>
                  </div>

                  {/* Blog Tags */}
                  {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Etiketler</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedBlog.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex px-3 py-1 text-sm rounded-full bg-emerald-100 text-emerald-800 font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
};

export default BlogPage; 