import React, { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt?: any;
}

const Messages: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const msgs: Message[] = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Message[];
      setMessages(msgs);
    } catch (error) {
      setError('Mesajlar yüklenemedi');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setError(null);
    setSuccess(null);
    try {
      await deleteDoc(doc(db, 'messages', id));
      setSuccess('Mesaj silindi');
      await fetchMessages();
    } catch (err) {
      setError('Mesaj silinemedi');
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-slate-50 py-10">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-8">
        <button onClick={() => navigate(-1)} className="mb-6 bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 font-semibold py-2 px-6 rounded-xl shadow hover:from-gray-400 hover:to-gray-500 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400">
          ← Geri
        </button>
        <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Gelen Mesajlar</h2>
        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700">{success}</div>}
        {loading ? (
          <div>Yükleniyor...</div>
        ) : messages.length === 0 ? (
          <div>Hiç mesaj yok.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-lg border border-gray-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Ad Soyad</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">E-posta</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Mesaj</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Tarih</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Sil</th>
                </tr>
              </thead>
              <tbody>
                {messages.map(msg => (
                  <tr key={msg.id}>
                    <td className="px-6 py-4 border-b border-gray-100">{msg.name}</td>
                    <td className="px-6 py-4 border-b border-gray-100">{msg.email}</td>
                    <td className="px-6 py-4 border-b border-gray-100">{msg.message}</td>
                    <td className="px-6 py-4 border-b border-gray-100">{msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ''}</td>
                    <td className="px-6 py-4 border-b border-gray-100">
                      <button
                        onClick={() => handleDelete(msg.id)}
                        disabled={deletingId === msg.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                      >
                        {deletingId === msg.id ? 'Siliniyor...' : 'Sil'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages; 