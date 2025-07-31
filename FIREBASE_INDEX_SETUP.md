# Firebase Firestore Index Kurulumu

## Sorun
Reçete listesi yüklenirken aşağıdaki hata alınıyor:
```
FirebaseError: The query requires an index. You can create it here: https://console.firebase.google.com/v1/r/project/sera-7887c/firestore/index...
```

## Çözüm

### 1. Geçici Çözüm (Uygulandı)
Kodda `orderBy` kaldırıldı ve client-side sorting eklendi. Bu geçici olarak sorunu çözer.

### 2. Kalıcı Çözüm - Firebase Console'da Index Oluşturma

#### Adım 1: Firebase Console'a Giriş
1. [Firebase Console](https://console.firebase.google.com/) adresine gidin
2. `sera-7887c` projesini seçin

#### Adım 2: Firestore Database'e Gidin
1. Sol menüden "Firestore Database" seçin
2. "Indexes" sekmesine tıklayın

#### Adım 3: Composite Index Oluşturun
1. "Create Index" butonuna tıklayın
2. Aşağıdaki ayarları yapın:
   - **Collection ID**: `recipes`
   - **Fields to index**:
     - Field: `producerId`, Order: `Ascending`
     - Field: `createdAt`, Order: `Descending`
   - **Query scope**: `Collection`

#### Adım 4: Index'i Etkinleştirin
1. Oluşturulan index'in durumunu kontrol edin
2. "Enabled" durumuna gelmesini bekleyin (birkaç dakika sürebilir)

#### Adım 5: Kodu Geri Alın
Index oluşturulduktan sonra, `recipeUtils.ts` dosyasındaki geçici değişiklikleri geri alabilirsiniz:

```typescript
// Üreticinin tüm reçetelerini getirme
export const getRecipesByProducer = async (producerId: string): Promise<Recipe[]> => {
  try {
    const q = query(
      collection(db, 'recipes'),
      where('producerId', '==', producerId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push(doc.data() as Recipe);
    });
    
    return recipes;
  } catch (error) {
    console.error('Reçete listesi getirme hatası:', error);
    throw new Error('Reçete listesi yüklenemedi');
  }
};
```

## Neden Bu Index Gerekli?
Firebase Firestore, aynı anda `where` ve `orderBy` kullanıldığında composite index gerektirir. Bu, performans optimizasyonu için gereklidir.

## Alternatif Çözümler
1. **Client-side sorting** (şu an uygulanan)
2. **Server-side sorting** (index oluşturarak)
3. **Query yapısını değiştirme** (sadece where kullanma)

## Not
Index oluşturulduktan sonra bu dosyayı silebilirsiniz. 