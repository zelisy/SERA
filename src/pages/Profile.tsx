import React, { useState } from 'react';

const Profile: React.FC = () => {
  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Burada backend işlemi yapılacak
    setMessage('Bilgiler güncellendi (örnek)');
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg border">
      <h2 className="text-2xl font-bold mb-6 text-center">Profil Bilgileri</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Kullanıcı Adı</label>
          <input
            type="text"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Kullanıcı adınız"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Mevcut Şifre</label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Mevcut şifreniz"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Yeni Şifre</label>
          <input
            type="password"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            placeholder="Yeni şifreniz"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Kaydet
        </button>
        {message && <div className="text-green-600 text-center mt-2">{message}</div>}
      </form>
    </div>
  );
};

export default Profile; 