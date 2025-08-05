export interface WeatherData {
  date: string;
  day: string;
  icon: string;
  minTemp: number;
  maxTemp: number;
  description: string;
}

export const getWeatherIcon = (weatherMain: string): string => {
  const icons: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '⛅',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌫️',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return icons[weatherMain] || '🌤️';
};

export const getDayName = (date: Date): string => {
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[date.getDay()];
};

export const generateMockWeatherData = (): WeatherData[] => {
  const mockData: WeatherData[] = [];
  const today = new Date();
  
  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    mockData.push({
      date: date.toLocaleDateString('tr-TR'),
      day: getDayName(date),
      icon: '☀️',
      minTemp: 20 + Math.floor(Math.random() * 10),
      maxTemp: 30 + Math.floor(Math.random() * 10),
      description: 'Güneşli'
    });
  }
  
  return mockData;
};

// Kullanıcının konumunu al
export const getUserLocation = (): Promise<{lat: number, lon: number}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      console.log('Geolocation desteklenmiyor. Varsayılan konum kullanılıyor.');
      resolve({ lat: 41.0082, lon: 28.9784 }); // İstanbul varsayılan
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log(`Kullanıcı konumu: ${lat}, ${lon}`);
        resolve({ lat, lon });
      },
      (error) => {
        console.log('Konum alınamadı, varsayılan konum kullanılıyor:', error.message);
        resolve({ lat: 41.0082, lon: 28.9784 }); // İstanbul varsayılan
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 dakika cache
      }
    );
  });
};

export const fetchWeatherData = async (): Promise<WeatherData[]> => {
  try {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    
    if (!apiKey) {
      if (import.meta.env.DEV) {
        console.log('OpenWeather API anahtarı bulunamadı. Mock veri kullanılıyor.');
      }
      return generateMockWeatherData();
    }

    // Kullanıcının konumunu al
    const { lat, lon } = await getUserLocation();
    
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`
    );
    
    if (!response.ok) {
      throw new Error('Hava durumu verileri alınamadı');
    }
    
    const data = await response.json();
    
    // 10 günlük tahmin için verileri işle
    const processedData: WeatherData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // API'den gelen verileri günlük olarak grupla
      const dayData = data.list.filter((item: any) => {
        const itemDate = new Date(item.dt * 1000);
        return itemDate.toDateString() === date.toDateString();
      });
      
      if (dayData.length > 0) {
        const minTemp = Math.min(...dayData.map((item: any) => item.main.temp_min));
        const maxTemp = Math.max(...dayData.map((item: any) => item.main.temp_max));
        const description = dayData[0].weather[0].description;
        const icon = getWeatherIcon(dayData[0].weather[0].main);
        
        processedData.push({
          date: date.toLocaleDateString('tr-TR'),
          day: getDayName(date),
          icon,
          minTemp: Math.round(minTemp),
          maxTemp: Math.round(maxTemp),
          description
        });
      }
    }
    
    return processedData;
  } catch (error) {
    console.error('Hava durumu verisi alınamadı:', error);
    // Hata durumunda mock data kullan
    return generateMockWeatherData();
  }
}; 