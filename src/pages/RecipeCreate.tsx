import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';

interface Fertilization {
  date: string;
  time: string;
  water: string;
  duration: string;
  products: string;
}

interface TopFeeding {
  date: string;
  time: string;
  applications: string;
}

interface FormData {
  fertilizations: Fertilization[];
  topFeedings: TopFeeding[];
  notes: string;
}

const RecipeCreatePage: React.FC = () => {
  const { producerId } = useParams();
  const navigate = useNavigate();
  const { register, control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      fertilizations: [{ date: '', time: '', water: '', duration: '', products: '' }],
      topFeedings: [{ date: '', time: '', applications: '' }],
      notes: '',
    },
  });

  const { fields: fertFields, append: addFert } = useFieldArray({ control, name: 'fertilizations' });
  const { fields: feedFields, append: addFeed } = useFieldArray({ control, name: 'topFeedings' });

  const onSubmit = (data: FormData) => {
    console.log('Reçete Kaydedildi:', data);
    navigate('/admin/recipes'); // Kaydettikten sonra listeye dön
  };

  // Statik sera içi kontroller
  const [greenhouse, setGreenhouse] = useState({
    temperature: 35,
    humidity: 55,
    ec: 1.8,
    ph: 6.5,
    brix: 7,
    chlorophyll: 42,
    light: 30000
  });

  // Statik hava durumu
  const weather = [
    { day: 'Pzt', min: 24, max: 32, icon: '☀️' },
    { day: 'Sal', min: 23, max: 31, icon: '☀️' },
    { day: 'Çar', min: 25, max: 33, icon: '🌤️' },
  ];

  return (
    <div className="p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">Yeni Reçete Oluştur</h1>

      {/* Üretici Bilgisi */}
      <div className="bg-white rounded-xl p-4 shadow mb-6">
        <h2 className="font-semibold text-lg mb-2">Üretici Bilgisi</h2>
        <p>Ad Soyad: <b>Veli Koruz</b></p>
        <p>TC: <b>2869066164</b></p>
        <p>Tel: <b>0537 738 3743</b></p>
        <p>Adres: <b>Kapaklı Mah.</b></p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Gübreleme Programı */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-4">Gübreleme Programı</h2>
          {fertFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-5 gap-2 mb-3">
              <input {...register(`fertilizations.${index}.date`)} type="date" className="border p-2 rounded" />
              <input {...register(`fertilizations.${index}.time`)} type="time" className="border p-2 rounded" />
              <input {...register(`fertilizations.${index}.water`)} placeholder="Su (ml)" className="border p-2 rounded" />
              <input {...register(`fertilizations.${index}.duration`)} placeholder="Süre (dk)" className="border p-2 rounded" />
              <input {...register(`fertilizations.${index}.products`)} placeholder="Ürünler" className="border p-2 rounded" />
            </div>
          ))}
          <button type="button" onClick={() => addFert({ date: '', time: '', water: '', duration: '', products: '' })} className="text-blue-600">
            + Yeni Satır Ekle
          </button>
        </div>

        {/* Üstten Besleme */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-4">Üstten Besleme</h2>
          {feedFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-3 gap-2 mb-3">
              <input {...register(`topFeedings.${index}.date`)} type="date" className="border p-2 rounded" />
              <input {...register(`topFeedings.${index}.time`)} type="time" className="border p-2 rounded" />
              <input {...register(`topFeedings.${index}.applications`)} placeholder="Uygulamalar" className="border p-2 rounded" />
            </div>
          ))}
          <button type="button" onClick={() => addFeed({ date: '', time: '', applications: '' })} className="text-blue-600">
            + Yeni Satır Ekle
          </button>
        </div>

        {/* Sera İçi Kontroller */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-4">Sera İçi Kontroller</h2>
          <p>Sıcaklık: {greenhouse.temperature}°C</p>
          <p>Nem: %{greenhouse.humidity}</p>
          <p>EC: {greenhouse.ec} dS/m</p>
          <p>pH: {greenhouse.ph}</p>
          <p>Brix: {greenhouse.brix}</p>
          <p>Klorofil: {greenhouse.chlorophyll}</p>
          <p>Işık: {greenhouse.light} lux</p>
        </div>

        {/* Hava Durumu */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-4">Hava Durumu</h2>
          <div className="flex gap-4">
            {weather.map((w, i) => (
              <div key={i} className="bg-blue-50 p-3 rounded text-center">
                <p>{w.day}</p>
                <p className="text-xl">{w.icon}</p>
                <p>{w.min}° / {w.max}°</p>
              </div>
            ))}
          </div>
        </div>

        {/* Notlar */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h2 className="font-semibold text-lg mb-2">Danışman Notu</h2>
          <textarea {...register('notes')} placeholder="Not ekleyin..." className="w-full border p-2 rounded" rows={3}></textarea>
        </div>

        {/* Kaydet Butonu */}
        <button type="submit" className="bg-green-500 text-white px-6 py-3 rounded-lg">
          Kaydet
        </button>
      </form>
    </div>
  );
};

export default RecipeCreatePage;
