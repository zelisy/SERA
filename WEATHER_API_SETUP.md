# OpenWeather API Kurulumu

Bu proje hava durumu verilerini göstermek için OpenWeather API kullanmaktadır.

## Kurulum Adımları

### 1. OpenWeather API Anahtarı Alın

1. [OpenWeatherMap](https://openweathermap.org/) sitesine gidin
2. Ücretsiz hesap oluşturun
3. API Keys bölümünden yeni bir anahtar oluşturun
4. Anahtarınızı kopyalayın

### 2. Environment Variables Ayarlayın

Proje kök dizininde `.env` dosyası oluşturun:

```env
VITE_OPENWEATHER_API_KEY=your_api_key_here
```

**Önemli:** `.env` dosyasını `.gitignore` dosyasına eklediğinizden emin olun.

### 3. API Anahtarının Aktif Olmasını Bekleyin

Yeni oluşturulan API anahtarları genellikle 2 saat içinde aktif hale gelir.

## Kullanım

API anahtarı ayarlandıktan sonra, hava durumu bölümü otomatik olarak:
- 10 günlük hava durumu tahmini gösterir
- Sıcaklık değerlerini (min/max) gösterir
- Hava durumu ikonları gösterir
- Türkçe açıklamalar gösterir

## Hata Durumları

API anahtarı bulunamazsa veya API çağrısı başarısız olursa, sistem otomatik olarak mock veriler gösterir.

## Koordinat Ayarları

Varsayılan olarak İstanbul koordinatları kullanılmaktadır. Farklı bir konum için `src/utils/weatherUtils.ts` dosyasındaki `fetchWeatherData` fonksiyonunu düzenleyebilirsiniz.

```typescript
// Örnek: Ankara koordinatları
const data = await fetchWeatherData(39.9334, 32.8597);
```

## API Limitleri

Ücretsiz OpenWeather API planı:
- Dakikada 60 çağrı
- Günlük 1,000 çağrı
- 5 günlük tahmin verisi

Bu limitler çoğu kullanım senaryosu için yeterlidir. 