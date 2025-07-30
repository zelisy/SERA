import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Producer } from '../types/producer';

const Recipe: React.FC = () => {
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Mock data - in real app this would come from Firebase
    const mockProducers: Producer[] = [
      {
        id: '1',
        firstName: 'Veli',
        lastName: 'Koruz',
        tcNo: '28609066164',
        phone: '05377383743',
        address: 'Kapaklı Mah.',
        gender: 'Erkek',
        experienceYear: '5',
        registerDate: '2023-01-15'
      },
      {
        id: '2',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        tcNo: '12345678901',
        phone: '05321234567',
        address: 'Merkez Mah.',
        gender: 'Erkek',
        experienceYear: '3',
        registerDate: '2023-03-20'
      },
      {
        id: '3',
        firstName: 'Fatma',
        lastName: 'Demir',
        tcNo: '98765432109',
        phone: '05339876543',
        address: 'Yeni Mah.',
        gender: 'Kadın',
        experienceYear: '7',
        registerDate: '2022-11-10'
      }
    ];

    setProducers(mockProducers);
    setLoading(false);
  }, []);

  const handleCreateRecipe = (producerId: string) => {
    navigate(`/recipe/create/${producerId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Reçete Yönetimi</h1>
          <p className="text-lg text-gray-600">Üreticiler için reçete oluşturun ve yönetin</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {producers.map((producer) => (
            <div
              key={producer.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-lg">
                      {producer.firstName.charAt(0)}{producer.lastName.charAt(0)}
                    </span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {producer.firstName} {producer.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">TC: {producer.tcNo}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Telefon:</span>
                  <span className="text-sm font-medium">{producer.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Adres:</span>
                  <span className="text-sm font-medium">{producer.address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Deneyim:</span>
                  <span className="text-sm font-medium">{producer.experienceYear} yıl</span>
                </div>
              </div>

              <button
                onClick={() => handleCreateRecipe(producer.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Reçete Oluştur
              </button>
            </div>
          ))}
        </div>

        {producers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz üretici bulunmuyor</h3>
            <p className="text-gray-500">Yeni üreticiler eklendiğinde burada görünecekler.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recipe; 