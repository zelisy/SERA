import React, { useState } from 'react';
import ImageLightbox from './ImageLightbox';

interface PlantData {
  id: string;
  plantNumber: number;
  kokProblemi: 'Var' | 'Yok' | '';
  kokFoto: string[];
  drenajProblemi: 'Var' | 'Yok' | '';
  drenajFoto: string[];
  vejetatifKontrolProblemi: 'Var' | 'Yok' | '';
  vejetatifFoto: string[];
  brixKontrolProblemi: 'Var' | 'Yok' | '';
  brixDegeri: number | '';
  brixFoto: string[];
  klorofilKontrolProblemi: 'Var' | 'Yok' | '';
  klorofilDegeri: number | '';
  klorofilFoto: string[];
  generatifKontrolProblemi: 'Var' | 'Yok' | '';
  generatifFoto: string[];
}

interface PlantControlStepProps {
  onComplete: (data: { dekar: number; plants: PlantData[] }) => void;
  onBack: () => void;
  initialData?: { dekar: number; plants: PlantData[] };
}

// Dekar Giriş Bileşeni
const DekarInput: React.FC<{
  dekar: number | '';
  setDekar: (value: number | '') => void;
  onSubmit: () => void;
  onBack: () => void;
}> = ({ dekar, setDekar, onSubmit, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Kontrol Bitkileri Kontrolü</h1>
          <p className="text-gray-600">Adım 1: Dekar bilgisini girin</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Dekar Değeri
            </label>
            <input
              type="number"
              value={dekar}
              onChange={(e) => setDekar(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Dekar değerini girin"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
            >
              Devam Et →
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

// Bitki Sayısı Giriş Bileşeni
const PlantCountInput: React.FC<{
  dekar: number;
  plantCount: number | '';
  setPlantCount: (value: number | '') => void;
  onSubmit: () => void;
  onBack: () => void;
}> = ({ dekar, plantCount, setPlantCount, onSubmit, onBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Kontrol Bitkileri Kontrolü</h1>
          <p className="text-gray-600">Adım 2: Kontrol edilecek bitki sayısını girin</p>
          <p className="text-sm text-gray-500 mt-2">Dekar: {dekar} da</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bitki Sayısı
            </label>
            <input
              type="number"
              value={plantCount}
              onChange={(e) => setPlantCount(e.target.value ? Number(e.target.value) : '')}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="Kontrol edilecek bitki sayısını girin"
              min="1"
              required
            />
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
            >
              ← Geri
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
            >
              Devam Et →
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
);

// Tekil Bitki Kontrol Bileşeni
const PlantDetailControl: React.FC<{
  plant: PlantData;
  plantIndex: number;
  totalPlants: number;
  dekar: number;
  onUpdate: (plantIndex: number, field: keyof PlantData, value: any) => void;
  onNext: () => void;
  onPrevious: () => void;
}> = ({ plant, plantIndex, totalPlants, dekar, onUpdate, onNext, onPrevious }) => {
  const [modalImg, setModalImg] = useState<string | null>(null);

  // Fotoğraf önizleme ve modal gösterimi
  const renderImagePreviews = (images: string[]) => (
    <div className="flex flex-wrap gap-2 mt-2">
      {images.map((url, idx) => (
        <img
          key={idx}
          src={url}
          alt="preview"
          className="w-16 h-16 object-cover rounded-lg cursor-pointer border border-gray-300 hover:ring-2 hover:ring-emerald-500"
          onClick={() => setModalImg(url)}
        />
      ))}
    </div>
  );

  const renderFileInput = (field: keyof PlantData, label: string, images: string[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-lg cursor-pointer font-medium shadow hover:from-emerald-600 hover:to-blue-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0 0V8m0 4h4m-4 0H8m8 8a4 4 0 01-8 0V8a4 4 0 018 0v8z" />
        </svg>
        Fotoğraf Seç
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            const urls = files.map(file => URL.createObjectURL(file));
            onUpdate(plantIndex, field, [...images, ...urls]);
          }}
        />
      </label>
      {images.length > 0 && renderImagePreviews(images)}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌱</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bitki {plantIndex + 1} Kontrolü</h1>
            <p className="text-gray-600">Dekar: {dekar} da | Toplam Bitki: {totalPlants}</p>
            <div className="mt-4">
              <div className="flex justify-center space-x-2">
                {Array.from({ length: totalPlants }, (_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${
                      index === plantIndex
                        ? 'bg-emerald-500'
                        : index < plantIndex
                        ? 'bg-green-300'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
          {/* Kök Problemi */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Kök Problemi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kök problemi var mı?</label>
                <select
                  value={plant.kokProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'kokProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {renderFileInput('kokFoto', 'Kök Fotoğrafları', plant.kokFoto)}
            </div>
          </div>

          {/* Drenaj Problemi */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Drenaj Problemi</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drenaj problemi var mı?</label>
                <select
                  value={plant.drenajProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'drenajProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {renderFileInput('drenajFoto', 'Drenaj Fotoğrafları', plant.drenajFoto)}
            </div>
          </div>

          {/* Vejetatif Kontrol */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Vejetatif Kontrol</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vejetatif kontrol problemi var mı?</label>
                <select
                  value={plant.vejetatifKontrolProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'vejetatifKontrolProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {renderFileInput('vejetatifFoto', 'Vejetatif Kontrol Fotoğrafları', plant.vejetatifFoto)}
            </div>
          </div>

          {/* Brix Kontrol */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Brix Kontrol</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brix kontrol problemi var mı?</label>
                <select
                  value={plant.brixKontrolProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'brixKontrolProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {plant.brixKontrolProblemi === 'Var' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brix Değeri</label>
                  <input
                    type="number"
                    value={plant.brixDegeri}
                    onChange={(e) => onUpdate(plantIndex, 'brixDegeri', e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Brix değerini girin"
                    step="0.1"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brix Kontrol Notu</label>
                <input
                  type="text"
                  value={plant.brixFoto[0] || ''}
                  onChange={e => onUpdate(plantIndex, 'brixFoto', [e.target.value])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Brix kontrolü ile ilgili not girin"
                />
              </div>
            </div>
          </div>

          {/* Klorofil Kontrol */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Klorofil Kontrol</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Klorofil kontrol problemi var mı?</label>
                <select
                  value={plant.klorofilKontrolProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'klorofilKontrolProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {plant.klorofilKontrolProblemi === 'Var' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Klorofil Değeri</label>
                  <input
                    type="number"
                    value={plant.klorofilDegeri}
                    onChange={(e) => onUpdate(plantIndex, 'klorofilDegeri', e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    placeholder="Klorofil değerini girin"
                    step="0.1"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Klorofil Kontrol Notu</label>
                <input
                  type="text"
                  value={plant.klorofilFoto[0] || ''}
                  onChange={e => onUpdate(plantIndex, 'klorofilFoto', [e.target.value])}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Klorofil kontrolü ile ilgili not girin"
                />
              </div>
            </div>
          </div>

          {/* Generatif Kontrol */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generatif Kontrol</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Generatif kontrol problemi var mı?</label>
                <select
                  value={plant.generatifKontrolProblemi}
                  onChange={(e) => onUpdate(plantIndex, 'generatifKontrolProblemi', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Seçiniz</option>
                  <option value="Var">Var</option>
                  <option value="Yok">Yok</option>
                </select>
              </div>
              {renderFileInput('generatifFoto', 'Generatif Kontrol Fotoğrafları', plant.generatifFoto)}
            </div>
          </div>
        </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={onPrevious}
              disabled={plantIndex === 0}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50"
            >
              ← Önceki Bitki
            </button>
            <button
              onClick={onNext}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-blue-500 text-white rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-colors font-medium"
            >
              {plantIndex === totalPlants - 1 ? 'Tamamla' : 'Sonraki Bitki →'}
            </button>
          </div>
          {/* Modal for image preview */}
      <ImageLightbox imageUrl={modalImg} onClose={() => setModalImg(null)} />
        </div>
      </div>
    </div>
  );
};

// Ana PlantControlStep Bileşeni
const PlantControlStep: React.FC<PlantControlStepProps> = ({ onComplete, onBack, initialData }) => {
  const [step, setStep] = useState<'dekar' | 'plant-count' | 'plant-details'>(
    initialData ? 'plant-details' : 'dekar'
  );
  const [dekar, setDekar] = useState<number | ''>(initialData?.dekar || '');
  const [plantCount, setPlantCount] = useState<number | ''>(initialData?.plants.length || '');
  const [plants, setPlants] = useState<PlantData[]>(initialData?.plants || []);
  const [currentPlantIndex, setCurrentPlantIndex] = useState(0);

  const handleDekarSubmit = () => {
    if (dekar && dekar > 0) {
      setStep('plant-count');
    }
  };

  const handlePlantCountSubmit = () => {
    if (plantCount && plantCount > 0) {
      // Initialize plants array
      const initialPlants: PlantData[] = Array.from({ length: plantCount }, (_, index) => ({
        id: `plant-${index + 1}`,
        plantNumber: index + 1,
        kokProblemi: '',
        kokFoto: [],
        drenajProblemi: '',
        drenajFoto: [],
        vejetatifKontrolProblemi: '',
        vejetatifFoto: [],
        brixKontrolProblemi: '',
        brixDegeri: '',
        brixFoto: [],
        klorofilKontrolProblemi: '',
        klorofilDegeri: '',
        klorofilFoto: [],
        generatifKontrolProblemi: '',
        generatifFoto: []
      }));
      setPlants(initialPlants);
      setStep('plant-details');
    }
  };

  const handlePlantDataUpdate = (plantIndex: number, field: keyof PlantData, value: any) => {
    setPlants(prev => prev.map((plant, index) => 
      index === plantIndex ? { ...plant, [field]: value } : plant
    ));
  };

  const handleNextPlant = () => {
    if (currentPlantIndex < plants.length - 1) {
      setCurrentPlantIndex(currentPlantIndex + 1);
    } else {
      // All plants completed
      onComplete({ dekar: dekar as number, plants });
    }
  };

  const handlePreviousPlant = () => {
    if (currentPlantIndex > 0) {
      setCurrentPlantIndex(currentPlantIndex - 1);
    }
  };

  // Render appropriate step
  if (step === 'dekar') {
    return (
      <DekarInput
        dekar={dekar}
        setDekar={setDekar}
        onSubmit={handleDekarSubmit}
        onBack={onBack}
      />
    );
  }

  if (step === 'plant-count') {
    return (
      <PlantCountInput
        dekar={dekar as number}
        plantCount={plantCount}
        setPlantCount={setPlantCount}
        onSubmit={handlePlantCountSubmit}
        onBack={() => setStep('dekar')}
      />
    );
  }

  return (
    <PlantDetailControl
      plant={plants[currentPlantIndex]}
      plantIndex={currentPlantIndex}
      totalPlants={plants.length}
      dekar={dekar as number}
      onUpdate={handlePlantDataUpdate}
      onNext={handleNextPlant}
      onPrevious={handlePreviousPlant}
    />
  );
};

export default PlantControlStep; 