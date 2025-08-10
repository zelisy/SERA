import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../components/OptimizedImage';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { uploadToCloudinary } from '../utils/cloudinaryUtils';
import { 
  createBlog, 
  updateBlog, 
  deleteBlog, 
  getAllBlogs 
} from '../utils/blogUtils';
import type { Blog, BlogFormData } from '../types/blog';

const BlogManagement: React.FC = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Blog kategorileri
  const categories = [
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

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .max(100, 'Başlık en fazla 100 karakter olabilir'),
    content: Yup.string(),
    excerpt: Yup.string()
      .max(200, 'Özet en fazla 200 karakter olabilir'),
    author: Yup.string(),
    category: Yup.string(),
    tags: Yup.string(),
    published: Yup.boolean(),
    featured: Yup.boolean()
  });

  // Initial form values
  const initialValues = {
    title: '',
    content: '',
    excerpt: '',
    author: '',
    imageUrl: '',
    tags: '',
    published: true, // Varsayılan olarak yayınlanmış
    category: '',
    featured: false
  };

  // Blogları yükle
  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const blogsData = await getAllBlogs();
      setBlogs(blogsData);
    } catch (err) {
      setError('Bloglar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Resim yükleme
  const handleImageUpload = async (file: File) => {
    try {
      setUploadingImage(true);
      const imageUrl = await uploadToCloudinary(file);
      return imageUrl;
    } catch (err) {
      setError('Resim yüklenemedi');
      return '';
    } finally {
      setUploadingImage(false);
    }
  };

  // Form gönderimi
  const handleSubmit = async (values: any, { resetForm }: any) => {
    try {
      setLoading(true);
      setError(null);

      // Resim yükleme
      let imageUrl = values.imageUrl;
      if (selectedImage) {
        imageUrl = await handleImageUpload(selectedImage);
      }

      // Etiketleri diziye çevir
      const tags = values.tags
        .split(',')
        .map((tag: string) => tag.trim())
        .filter((tag: string) => tag.length > 0);

      const blogData: BlogFormData = {
        title: values.title,
        content: values.content,
        excerpt: values.excerpt,
        author: values.author,
        imageUrl,
        tags,
        published: values.published,
        category: values.category,
        featured: values.featured
      };

      if (editingBlog) {
        await updateBlog(editingBlog.id, blogData);
        setSuccess('Blog başarıyla güncellendi!');
      } else {
        const blogId = await createBlog(blogData);
        setSuccess('Blog başarıyla oluşturuldu!');
      }

      // Formu temizle ve varsayılan değerlere döndür
      resetForm({ values: initialValues });
      setEditingBlog(null);
      setShowForm(false);
      setSelectedImage(null);
      setImagePreview('');
      
      // Blog listesini yenile
      await loadBlogs();

      // Başarı mesajını 3 saniye sonra kaldır
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Blog kaydedilemedi');
    } finally {
      setLoading(false);
    }
  };

  // Blog düzenleme
  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setShowForm(true);
    setImagePreview(blog.imageUrl || '');
  };

  // Blog silme
  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu blogu silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      setLoading(true);
      await deleteBlog(id);
      setSuccess('Blog başarıyla silindi!');
      await loadBlogs();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Blog silinemedi');
    } finally {
      setLoading(false);
    }
  };

  // Resim seçimi
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Yeni blog oluşturma
  const handleNewBlog = () => {
    setEditingBlog(null);
    setShowForm(true);
    setSelectedImage(null);
    setImagePreview('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate(-1)}
                className="mb-4 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow hover:from-gray-400 hover:to-gray-500 hover:scale-105 transition-all duration-200"
              >
                ← Geri
              </button>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                📝 Blog Yönetimi
              </h1>
              <p className="text-slate-600">
                Blog yazılarınızı oluşturun, düzenleyin ve yönetin
              </p>
            </div>
            <button
              onClick={handleNewBlog}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              ✨ Yeni Blog Ekle
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">✅</span>
              <span className="text-emerald-700">{success}</span>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">❌</span>
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Blog Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              {editingBlog ? '✏️ Blog Düzenle' : '✨ Yeni Blog Ekle'}
            </h2>

            <Formik
              initialValues={editingBlog ? {
                title: editingBlog.title,
                content: editingBlog.content,
                excerpt: editingBlog.excerpt,
                author: editingBlog.author,
                imageUrl: editingBlog.imageUrl || '',
                tags: editingBlog.tags.join(', '),
                published: editingBlog.published,
                category: editingBlog.category,
                featured: editingBlog.featured
              } : initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ setFieldValue, isSubmitting }) => (
                <Form className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Başlık */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Blog Başlığı
                      </label>
                      <Field
                        name="title"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Blog başlığını girin..."
                      />
                      <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Özet */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Özet
                      </label>
                      <Field
                        name="excerpt"
                        as="textarea"
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Blog özetini girin..."
                        onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            const textarea = e.target as HTMLTextAreaElement;
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const value = textarea.value;
                            textarea.value = value.substring(0, start) + '\n' + value.substring(end);
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                          }
                        }}
                      />
                      <ErrorMessage name="excerpt" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Yazar */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Yazar
                      </label>
                      <Field
                        name="author"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Yazar adını girin..."
                      />
                      <ErrorMessage name="author" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kategori
                      </label>
                      <Field
                        name="category"
                        as="select"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Kategori seçin...</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="category" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Etiketler */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Etiketler
                      </label>
                      <Field
                        name="tags"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Etiketleri virgülle ayırarak girin..."
                      />
                      <ErrorMessage name="tags" component="div" className="text-red-500 text-sm mt-1" />
                    </div>

                    {/* Resim Yükleme */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kapak Resmi
                      </label>
                      <div className="space-y-3">
                        <label className="block w-full max-w-xs cursor-pointer bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold py-3 px-5 rounded-xl text-center text-base shadow-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 border-4 border-emerald-400">
                          📷 Kapak Fotoğrafı Seç / Yükle
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={uploadingImage}
                          />
                        </label>
                        {uploadingImage && (
                          <div className="flex items-center space-x-2 text-emerald-600">
                            <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Resim yükleniyor...</span>
                          </div>
                        )}
                        {imagePreview && (
                          <div className="relative">
                            <button type="button" onClick={() => setModalImg(imagePreview)} className="focus:outline-none">
                              <OptimizedImage
                                src={imagePreview}
                                alt="Önizleme"
                                className="w-full max-w-xs h-32 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform duration-200 cursor-pointer"
                                optimize={{ width: 512, height: 256, crop: 'fill' }}
                              />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
                                setImagePreview('');
                                setFieldValue('imageUrl', '');
                              }}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Yayın Durumu */}
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Field
                          name="published"
                          type="checkbox"
                          className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Yayınla</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <Field
                          name="featured"
                          type="checkbox"
                          className="h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Öne Çıkar</span>
                      </label>
                    </div>
                  </div>

                  {/* İçerik */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Blog İçeriği
                    </label>
                    <Field
                      name="content"
                      as="textarea"
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="Blog içeriğini girin..."
                      onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          const textarea = e.target as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const value = textarea.value;
                          textarea.value = value.substring(0, start) + '\n' + value.substring(end);
                          textarea.selectionStart = textarea.selectionEnd = start + 1;
                        }
                      }}
                    />
                    <ErrorMessage name="content" component="div" className="text-red-500 text-sm mt-1" />
                  </div>

                  {/* Form Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingBlog(null);
                        setSelectedImage(null);
                        setImagePreview('');
                      }}
                      className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || loading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Kaydediliyor...</span>
                        </div>
                      ) : (
                        <span>{editingBlog ? 'Güncelle' : 'Oluştur'}</span>
                      )}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        )}

        {/* Blog Listesi */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-slate-800">
              📋 Blog Listesi ({blogs.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin h-12 w-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-slate-600">Bloglar yükleniyor...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Henüz blog yok</h3>
              <p className="text-slate-500 mb-6">İlk blogunuzu oluşturmak için "Yeni Blog Ekle" butonuna tıklayın.</p>
              <button
                onClick={handleNewBlog}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105"
              >
                ✨ İlk Blogu Oluştur
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Blog
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Yazar
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Durum
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tarih
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          {blog.imageUrl && (
                            <button type="button" onClick={() => setModalImg(blog.imageUrl || '')} className="focus:outline-none">
                              <OptimizedImage
                                src={blog.imageUrl}
                                alt={blog.title}
                                className="w-12 h-12 object-cover rounded-lg hover:scale-105 transition-transform duration-200 cursor-pointer"
                                optimize={{ width: 96, height: 96, crop: 'fill' }}
                              />
                            </button>
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {blog.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {blog.excerpt}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {blog.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {blog.author}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            blog.published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {blog.published ? 'Yayında' : 'Taslak'}
                          </span>
                          {blog.featured && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                              Öne Çıkan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {blog.publishedAt 
                          ? new Date(blog.publishedAt).toLocaleDateString('tr-TR')
                          : new Date(blog.createdAt).toLocaleDateString('tr-TR')
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(blog)}
                            className="text-emerald-600 hover:text-emerald-900 transition-colors"
                            title="Düzenle"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(blog.id)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Sil"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {/* Modal for large image preview */}
      {modalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setModalImg(null)}>
          <div className="relative" onClick={e => e.stopPropagation()}>
            <img src={modalImg} alt="Büyük Önizleme" className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl border-4 border-white" />
            <button
              type="button"
              onClick={() => setModalImg(null)}
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 shadow-lg hover:bg-red-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement; 