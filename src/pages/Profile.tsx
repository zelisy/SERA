import React, { useState, useEffect } from 'react';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  const [username, setUsername] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Kullanıcıyı izleme
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setUsername(firebaseUser?.displayName || '');
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (!user || !user.email) {
      setMessage('Giriş yapılmamış.');
      setLoading(false);
      return;
    }

    // Mevcut şifre kontrolü
    if (!currentPassword.trim()) {
      setMessage('Mevcut şifre gereklidir.');
      setLoading(false);
      return;
    }

    // Yeni şifre kontrolü - eğer yeni şifre girilmişse
    if (newPassword.trim().length > 0) {
      if (currentPassword === newPassword) {
        setMessage('Yeni şifre mevcut şifreyle aynı olamaz.');
        setLoading(false);
        return;
      }
      
      if (newPassword.trim().length < 6) {
        setMessage('Yeni şifre en az 6 karakter olmalıdır.');
        setLoading(false);
        return;
      }
    }

    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);

      let hasChanges = false;

      // Kullanıcı adı değişikliği
      if (username.trim().length > 0 && username !== user.displayName) {
        await updateProfile(user, { displayName: username });
        hasChanges = true;
      }

      // Şifre değişikliği
      if (newPassword.trim().length > 0) {
        await updatePassword(user, newPassword);
        hasChanges = true;
      }

      // Sadece değişiklik varsa başarı mesajı göster
      if (hasChanges) {
        setMessage('Bilgiler başarıyla güncellendi!');
        setCurrentPassword('');
        setNewPassword('');
      } else {
        setMessage('Herhangi bir değişiklik yapılmadı.');
      }
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setMessage('Mevcut şifre yanlış.');
      } else if (error.code === 'auth/weak-password') {
        setMessage('Şifre çok zayıf. Daha güçlü bir şifre seçin.');
      } else {
        setMessage('İşlem başarısız. Lütfen tekrar deneyin.');
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-blue-50 shadow-lg border-b border-emerald-200 sticky top-0 z-30">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-lg hover:bg-emerald-100 transition-colors text-emerald-600"
              title="Geri Dön"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h2 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">Profil Yönetimi</h2>
              <p className="text-sm text-emerald-600 font-medium">Kullanıcı bilgileri ve şifre değiştirme</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-10">
        <div className="max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Profil Bilgileri</h2>
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
              placeholder="Yeni şifreniz (değiştirmek istemiyorsan boş bırak)"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 to-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          {message && (
            <div className="text-center mt-4 text-sm font-medium text-emerald-600">{message}</div>
          )}
        </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
