import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import arkaplanImage from '../assets/arkaplan1.jpg';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contactInfo = [
    {
      icon: '📧',
      title: 'E-posta',
      value: 'info@seratakip.com',
      link: 'mailto:info@seratakip.com'
    },
    {
      icon: '📱',
      title: 'Telefon',
      value: '+90 537 738 37 43',
      link: 'tel:+905377383743'

    },
    {
      icon: '📍',
      title: 'Adres',
      value: 'Demre Mah. 100. Sok. No: 100, Antalya',
      link: 'https://maps.google.com'
    },
    {
      icon: '🕒',
      title: 'Çalışma Saatleri',
      value: 'Hafta içi 09:00 - 18:00',
      link: null
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError('Mesaj gönderilemedi. Lütfen tekrar deneyin.');
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (submitted) {
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
        <div className="relative z-10 flex items-center justify-center p-4">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-700 p-8 md:p-12 text-center max-w-md">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <span className="text-white text-2xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Mesajınız Gönderildi!</h2>
            <p className="text-gray-300 mb-6">
              En kısa sürede size dönüş yapacağız. Teşekkür ederiz.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-emerald-600 hover:to-blue-600 transition-all duration-200"
            >
              Yeni Mesaj Gönder
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-display text-white mb-6">
                İletişim
              </h1>
              <p className="text-xl text-gray-200 max-w-3xl mx-auto leading-relaxed font-body">
                Her türlü soru, öneri ve iş birliği talepleriniz için sizlere destek olmaktan 
                memnuniyet duyarız. Bize ulaşın!
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Information */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-8">İletişim Bilgileri</h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-700 hover:shadow-xl transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xl">{info.icon}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-1">{info.title}</h3>
                          {info.link ? (
                            <a 
                              href={info.link}
                              className="text-gray-300 hover:text-emerald-400 transition-colors"
                            >
                              {info.value}
                            </a>
                          ) : (
                            <p className="text-gray-300">{info.value}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Support */}
                <div className="mt-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">💬 Hızlı Destek</h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Acil durumlar için WhatsApp üzerinden 7/24 destek alabilirsiniz.
                  </p>
                  <a 
                    href="https://wa.me/905377383743"
                    className="inline-flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    <span>📱</span>
                    <span className="text-sm font-medium">WhatsApp Destek</span>
                  </a>
                </div>
              </div>

              {/* Contact Form */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-700 p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Bize Mesaj Gönderin</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                        placeholder="Adınız ve soyadınız"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        E-posta *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Telefon
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white placeholder-gray-400"
                        placeholder="+90 555 123 45 67"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Konu *
                      </label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-white"
                        required
                      >
                        <option value="">Konu seçiniz</option>
                        <option value="genel">Genel Bilgi</option>
                        <option value="teknik">Teknik Destek</option>
                        <option value="satis">Satış ve Fiyatlandırma</option>
                        <option value="isbirligi">İş Birliği</option>
                        <option value="sikayet">Şikayet</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      Mesajınız *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-vertical text-white placeholder-gray-400"
                      placeholder="Mesajınızı buraya yazınız..."
                      required
                      onKeyDown={(e) => {
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
                  </div>

                  {error && (
                    <p className="text-red-400 text-sm">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gönderiliyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <span>📩</span>
                        <span>Mesaj Gönder</span>
                      </div>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact; 