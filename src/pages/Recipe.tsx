import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UreticiListesi from '../components/UreticiListesi';
import type { Producer } from '../types/producer';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

const Recipe: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'recipe-management'>('select-producer');
  const navigate = useNavigate();

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('recipe-management');
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
  };

  const handleCreateRecipe = (producerId: string) => {
    navigate(`/admin/recipe/create/${producerId}`);
  };

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
              Reçete Yönetimi
            </h1>
            <p className="text-slate-600 text-lg">
              Reçete işlemlerini başlatmak için önce bir üretici seçin
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center">
              <div className="flex items-center text-emerald-600">
                <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <span className="ml-2 font-medium">Üretici Seç</span>
              </div>
              <div className="flex-1 mx-4 h-1 bg-gray-200 rounded"></div>
              <div className="flex items-center text-gray-400">
                <div className="w-8 h-8 bg-gray-200 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <span className="ml-2">Reçete Yönetimi</span>
              </div>
            </div>
          </div>

          {/* Producer Selection */}
          <UreticiListesi
            selectionMode={true}
            onSelect={handleProducerSelect}
            selectedProducer={selectedProducer}
          />
        </div>
      </div>
    );
  }

  // Recipe Management Step
  if (currentStep === 'recipe-management') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          {/* Header with Producer Info */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">💊</span>
                </div>
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-slate-800">
                    Reçete Yönetimi - {selectedProducer?.firstName} {selectedProducer?.lastName}
                  </h1>
                  <p className="text-slate-600">
                    TC: {selectedProducer?.tcNo} | Tel: {selectedProducer?.phone}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleCreateRecipe(selectedProducer!.id)}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
                >
                  + Yeni Reçete Oluştur
                </button>
                <button
                  onClick={resetSelection}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  👤 Üretici Değiştir
                </button>
              </div>
            </div>
          </div>

          {/* Recipe Management Content */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-6">📋 {selectedProducer?.firstName} {selectedProducer?.lastName} için Reçeteler</h2>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💊</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Reçete Yönetimi</h3>
              <p className="text-slate-600 mb-4">
                {selectedProducer?.firstName} {selectedProducer?.lastName} için reçete oluşturmak ve yönetmek için "Yeni Reçete Oluştur" butonuna tıklayın.
              </p>
              <button
                onClick={() => handleCreateRecipe(selectedProducer!.id)}
                className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
              >
                + İlk Reçeteyi Oluştur
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default Recipe; 