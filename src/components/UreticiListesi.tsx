import React, { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';

interface Producer {
  id: string;
  firstName: string;
  lastName: string;
  tcNo: string;
  phone: string;
  address: string;
  gender: string;
  experienceYear: string;
  registerDate: string;
}

const UreticiListesi = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<'firstName' | 'registerDate'>('firstName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showAdd, setShowAdd] = useState(false);
  const [newProducer, setNewProducer] = useState({
    firstName: '',
    lastName: '',
    tcNo: '',
    phone: '',
    address: '',
    gender: '',
    experienceYear: '',
    registerDate: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const q = query(collection(db, 'producers'), orderBy(sortKey, sortDir));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducers(
        snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Producer))
      );
      setLoading(false);
    }, (err) => {
      setError('Veriler alınamadı.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sortKey, sortDir]);

  const handleAdd = async () => {
    if (!newProducer.firstName || !newProducer.lastName || !newProducer.tcNo || !newProducer.phone || !newProducer.address || !newProducer.gender || !newProducer.experienceYear || !newProducer.registerDate) return;
    try {
      await addDoc(collection(db, 'producers'), newProducer);
      setNewProducer({ firstName: '', lastName: '', tcNo: '', phone: '', address: '', gender: '', experienceYear: '', registerDate: '' });
    } catch (e) {
      setError('Ekleme başarısız.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'producers', id));
    } catch (e) {
      setError('Silme başarısız.');
    }
  };

  const filtered = producers.filter(u =>
    u.firstName.toLowerCase().includes(search.toLowerCase()) ||
    u.lastName.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search) ||
    u.tcNo.includes(search)
  );

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ color: '#228B22', marginBottom: 20 }}>Üretici Listesi</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Ara..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', minWidth: 180 }}
        />
        <select value={sortKey} onChange={e => setSortKey(e.target.value as 'firstName' | 'registerDate')} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }}>
          <option value="firstName">İsme Göre</option>
          <option value="registerDate">Kayıt Tarihine Göre</option>
        </select>
        <button
          onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #228B22', background: '#fff', color: '#228B22', cursor: 'pointer' }}
        >
          {sortDir === 'asc' ? '↑' : '↓'}
        </button>
        <button
          onClick={() => setShowAdd(true)}
          style={{ marginLeft: 'auto', background: '#228B22', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer' }}
        >
          + Üretici Ekle
        </button>
      </div>
      {showAdd && (
        <div style={{ background: '#f6faf7', border: '1px solid #228B22', borderRadius: 8, padding: 16, marginBottom: 16, maxWidth: 700 }}>
          <h4 style={{ color: '#228B22', marginBottom: 8 }}>Yeni Üretici Ekle</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <input
              type="text"
              placeholder="Ad"
              value={newProducer.firstName}
              onChange={e => setNewProducer({ ...newProducer, firstName: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
            />
            <input
              type="text"
              placeholder="Soyad"
              value={newProducer.lastName}
              onChange={e => setNewProducer({ ...newProducer, lastName: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
            />
            <input
              type="text"
              placeholder="TC Kimlik No"
              value={newProducer.tcNo}
              onChange={e => setNewProducer({ ...newProducer, tcNo: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
              maxLength={11}
            />
            <input
              type="text"
              placeholder="Telefon"
              value={newProducer.phone}
              onChange={e => setNewProducer({ ...newProducer, phone: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
            />
            <input
              type="text"
              placeholder="Adres"
              value={newProducer.address}
              onChange={e => setNewProducer({ ...newProducer, address: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 2, minWidth: 180 }}
            />
            <select
              value={newProducer.gender}
              onChange={e => setNewProducer({ ...newProducer, gender: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
            >
              <option value="">Cinsiyet Seçiniz</option>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
              <option value="Diğer">Diğer</option>
            </select>
            <input
              type="number"
              placeholder="Meslekte Yıl"
              value={newProducer.experienceYear}
              onChange={e => setNewProducer({ ...newProducer, experienceYear: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
              min={0}
            />
            <input
              type="date"
              placeholder="Kayıt Tarihi"
              value={newProducer.registerDate}
              onChange={e => setNewProducer({ ...newProducer, registerDate: e.target.value })}
              style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', flex: 1, minWidth: 120 }}
            />
            <button
              onClick={handleAdd}
              style={{ background: '#228B22', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer', flex: 1 }}
            >
              Kaydet
            </button>
            <button
              onClick={() => setShowAdd(false)}
              style={{ background: '#fff', color: '#228B22', border: '1px solid #228B22', borderRadius: 6, padding: '8px 18px', fontWeight: 500, cursor: 'pointer', flex: 1 }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      {loading ? (
        <div style={{ color: '#888', padding: 24, textAlign: 'center' }}>Yükleniyor...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <thead>
              <tr style={{ background: '#e6ffe6' }}>
                <th style={{ padding: 12, textAlign: 'left' }}>Ad</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Soyad</th>
                <th style={{ padding: 12, textAlign: 'left' }}>TC</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Telefon</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Adres</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Cinsiyet</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Meslekte Yıl</th>
                <th style={{ padding: 12, textAlign: 'left' }}>Kayıt Tarihi</th>
                <th style={{ padding: 12, textAlign: 'center', width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ padding: 12 }}>{u.firstName}</td>
                  <td style={{ padding: 12 }}>{u.lastName}</td>
                  <td style={{ padding: 12 }}>{u.tcNo}</td>
                  <td style={{ padding: 12 }}>{u.phone}</td>
                  <td style={{ padding: 12 }}>{u.address}</td>
                  <td style={{ padding: 12 }}>{u.gender}</td>
                  <td style={{ padding: 12 }}>{u.experienceYear}</td>
                  <td style={{ padding: 12 }}>{u.registerDate}</td>
                  <td style={{ padding: 12, textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(u.id)}
                      style={{ background: 'none', border: 'none', color: '#d32f2f', fontSize: 18, cursor: 'pointer' }}
                      title="Sil"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} style={{ padding: 16, textAlign: 'center', color: '#888' }}>Kayıt bulunamadı.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UreticiListesi; 