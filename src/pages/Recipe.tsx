import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UreticiListesi from '../components/UreticiListesi';
import type { Producer } from '../types/producer';
import type { Recipe } from '../types/recipe';
import { getRecipesByProducer, deleteRecipe, getAllRecipes } from '../utils/recipeUtils';


const RecipePage: React.FC = () => {
  const [selectedProducer, setSelectedProducer] = useState<Producer | null>(null);
  const [currentStep, setCurrentStep] = useState<'select-producer' | 'recipe-management' | 'all-recipes'>('select-producer');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleProducerSelect = (producer: Producer) => {
    setSelectedProducer(producer);
    setCurrentStep('recipe-management');
  };

  const resetSelection = () => {
    setSelectedProducer(null);
    setCurrentStep('select-producer');
    setRecipes([]);
    setError(null);
  };

  const handleCreateRecipe = (producerId: string) => {
    navigate(`/admin/recipe/create/${producerId}`);
  };

  const loadRecipes = async () => {
    if (!selectedProducer) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const recipeList = await getRecipesByProducer(selectedProducer.id);
      setRecipes(recipeList);
    } catch (err) {
      setError('Reçeteler yüklenirken bir hata oluştu');
      console.error('Reçete yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const recipeList = await getAllRecipes();
      setRecipes(recipeList);
    } catch (err) {
      setError('Reçeteler yüklenirken bir hata oluştu');
      console.error('Reçete yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId: string) => {
    if (!window.confirm('Bu reçeteyi silmek istediğinizden emin misiniz?')) return;
    
    try {
      setLoading(true);
      await deleteRecipe(recipeId);
      await loadRecipes(); // Listeyi yenile
    } catch (err) {
      setError('Reçete silinirken bir hata oluştu');
      console.error('Reçete silme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Reçeteleri yükle
  useEffect(() => {
    if (currentStep === 'recipe-management' && selectedProducer) {
      loadRecipes();
    } else if (currentStep === 'all-recipes') {
      loadAllRecipes();
    }
  }, [currentStep, selectedProducer]);

  // Producer Selection Step
  if (currentStep === 'select-producer') {
    return (
      <div className="bg-gray-50">
        <div className="p-4 lg:p-6">
          {/* Header */}
          <div className="mb-6">
            
            <div className="text-center">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 mb-2">
                Reçete Yönetimi
              </h1>
              <p className="text-slate-600 text-lg">
                Reçete işlemlerini başlatmak için önce bir üretici seçin
              </p>
            </div>
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

          {/* Tüm Reçeteler Butonu */}
          <div className="mb-6 text-center">
            <button
              onClick={() => setCurrentStep('all-recipes')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg font-semibold text-lg"
            >
              📋 Tüm Reçeteleri Görüntüle
            </button>
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

  // All Recipes Step
  if (currentStep === 'all-recipes') {
    return (
      <div className="bg-gray-50">
        <div className="p-4 lg:p-6 space-y-6">
          
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                📋 Tüm Reçeteler ({recipes.length})
              </h2>
              <button
                onClick={loadAllRecipes}
                disabled={loading}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Yükleniyor...' : '↻ Yenile'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Reçeteler yükleniyor...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz Reçete Yok</h3>
                <p className="text-slate-600 mb-4">
                  Henüz hiç reçete oluşturulmamış.
                </p>
                <button
                  onClick={() => setCurrentStep('select-producer')}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  + İlk Reçeteyi Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">💊</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Reçete #{recipe.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Üretici: {recipe.producerName}
                            </p>
                            <p className="text-sm text-slate-600">
                              Oluşturulma: {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Gübreleme Programı</h4>
                            <div className="space-y-2 text-sm">
                              {recipe.fertilization1 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">1. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization1}</p>
                                </div>
                              )}
                              {recipe.fertilization2 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">2. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization2}</p>
                                </div>
                              )}
                              {recipe.fertilization3 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">3. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization3}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Üstten Besleme</h4>
                            {recipe.topFeeding ? (
                              <div className="bg-orange-50 p-2 rounded">
                                <p className="text-orange-700 text-sm">{recipe.topFeeding}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">Üstten besleme bilgisi yok</p>
                            )}
                            
                            {recipe.notes && (
                              <div className="mt-3">
                                <h4 className="font-medium text-slate-700 mb-2">Notlar</h4>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-700 text-sm">{recipe.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {recipe.weatherData && recipe.weatherData.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-slate-700 mb-2">Hava Durumu (Oluşturulduğunda)</h4>
                            <div className="flex space-x-2 overflow-x-auto">
                              {recipe.weatherData.slice(0, 3).map((weather, index) => (
                                <div key={index} className="bg-purple-50 p-2 rounded text-center min-w-[80px]">
                                  <div className="text-sm font-medium text-purple-700">{weather.day}</div>
                                  <div className="text-lg">{weather.icon}</div>
                                  <div className="text-xs text-purple-600">
                                    {weather.minTemp}° / {weather.maxTemp}°
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reçeteyi Sil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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

          {/* Recipe List */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                📋 {selectedProducer?.firstName} {selectedProducer?.lastName} için Reçeteler ({recipes.length})
              </h2>
              <button
                onClick={loadRecipes}
                disabled={loading}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Yükleniyor...' : '↻ Yenile'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Reçeteler yükleniyor...</p>
              </div>
            ) : recipes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-lg font-semibold text-slate-700 mb-2">Henüz Reçete Yok</h3>
                <p className="text-slate-600 mb-4">
                  {selectedProducer?.firstName} {selectedProducer?.lastName} için henüz reçete oluşturulmamış.
                </p>
                <button
                  onClick={() => handleCreateRecipe(selectedProducer!.id)}
                  className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-blue-600 transition-all duration-200 shadow-lg"
                >
                  + İlk Reçeteyi Oluştur
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {recipes.map((recipe) => (
                  <div key={recipe.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-lg flex items-center justify-center">
                            <span className="text-white text-lg">💊</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-800">
                              Reçete #{recipe.id.slice(-6)}
                            </h3>
                            <p className="text-sm text-slate-600">
                              Oluşturulma: {formatDate(recipe.createdAt)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Gübreleme Programı</h4>
                            <div className="space-y-2 text-sm">
                              {recipe.fertilization1 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">1. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization1}</p>
                                </div>
                              )}
                              {recipe.fertilization2 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">2. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization2}</p>
                                </div>
                              )}
                              {recipe.fertilization3 && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <span className="font-medium text-blue-700">3. Gübreleme:</span>
                                  <p className="text-blue-600 mt-1">{recipe.fertilization3}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-slate-700 mb-2">Üstten Besleme</h4>
                            {recipe.topFeeding ? (
                              <div className="bg-orange-50 p-2 rounded">
                                <p className="text-orange-700 text-sm">{recipe.topFeeding}</p>
                              </div>
                            ) : (
                              <p className="text-gray-500 text-sm italic">Üstten besleme bilgisi yok</p>
                            )}
                            
                            {recipe.notes && (
                              <div className="mt-3">
                                <h4 className="font-medium text-slate-700 mb-2">Notlar</h4>
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-gray-700 text-sm">{recipe.notes}</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {recipe.weatherData && recipe.weatherData.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium text-slate-700 mb-2">Hava Durumu (Oluşturulduğunda)</h4>
                            <div className="flex space-x-2 overflow-x-auto">
                              {recipe.weatherData.slice(0, 3).map((weather, index) => (
                                <div key={index} className="bg-purple-50 p-2 rounded text-center min-w-[80px]">
                                  <div className="text-sm font-medium text-purple-700">{weather.day}</div>
                                  <div className="text-lg">{weather.icon}</div>
                                  <div className="text-xs text-purple-600">
                                    {weather.minTemp}° / {weather.maxTemp}°
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handleDeleteRecipe(recipe.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reçeteyi Sil"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default RecipePage; 