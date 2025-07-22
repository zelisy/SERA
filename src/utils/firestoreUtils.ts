import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ChecklistSection, UretimAlani } from '../types/checklist';

// Existing Checklist Functions
export const saveChecklistData = async (sectionId: string, data: ChecklistSection): Promise<void> => {
  try {
    const docRef = doc(db, 'checklists', sectionId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error('Firestore save error:', error);
    throw new Error('Veriler kaydedilemedi');
  }
};

export const loadChecklistData = async (sectionId: string): Promise<ChecklistSection | null> => {
  try {
    const docRef = doc(db, 'checklists', sectionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ChecklistSection;
    }
    return null;
  } catch (error) {
    console.error('Firestore load error:', error);
    throw new Error('Veriler yüklenemedi');
  }
};

export const updateChecklistItem = async (
  sectionId: string,
  itemId: string,
  completed: boolean,
  data?: Record<string, string | number | boolean | string[]>
): Promise<void> => {
  try {
    const docRef = doc(db, 'checklists', sectionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const checklistData = docSnap.data() as ChecklistSection;
      const itemIndex = checklistData.items.findIndex(item => item.id === itemId);

      if (itemIndex !== -1) {
        checklistData.items[itemIndex].completed = completed;
        if (data) {
          checklistData.items[itemIndex].data = data;
        }

        await updateDoc(docRef, {
          items: checklistData.items,
          updatedAt: serverTimestamp()
        });
      }
    }
  } catch (error) {
    console.error('Firestore update error:', error);
    throw new Error('Güncelleme başarısız');
  }
};

// Üretim Alanı CRUD Functions
export const saveUretimAlani = async (uretimAlani: Omit<UretimAlani, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = doc(collection(db, 'uretimAlanlari'));
    
    // Remove undefined values to prevent Firestore errors
    const cleanData = Object.fromEntries(
      Object.entries({
        ...uretimAlani,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }).filter(([, value]) => value !== undefined)
    );
    
    await setDoc(docRef, cleanData);
    return docRef.id;
  } catch (error) {
    console.error('Üretim alanı kayıt hatası:', error);
    throw new Error('Üretim alanı kaydedilemedi');
  }
};

export const updateUretimAlani = async (id: string, uretimAlani: Partial<UretimAlani>): Promise<void> => {
  try {
    const docRef = doc(db, 'uretimAlanlari', id);
    
    // Remove undefined values to prevent Firestore errors
    const cleanData = Object.fromEntries(
      Object.entries({
        ...uretimAlani,
        updatedAt: new Date().toISOString()
      }).filter(([, value]) => value !== undefined)
    );
    
    await updateDoc(docRef, cleanData);
  } catch (error) {
    console.error('Üretim alanı güncelleme hatası:', error);
    throw new Error('Üretim alanı güncellenemedi');
  }
};

export const getUretimAlani = async (id: string): Promise<UretimAlani | null> => {
  try {
    const docRef = doc(db, 'uretimAlanlari', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UretimAlani;
    }
    return null;
  } catch (error) {
    console.error('Üretim alanı yükleme hatası:', error);
    throw new Error('Üretim alanı yüklenemedi');
  }
};

export const getUretimAlanlariByProducer = async (producerId: string): Promise<UretimAlani[]> => {
  try {
    const q = query(
      collection(db, 'uretimAlanlari'),
      where('producerId', '==', producerId)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as UretimAlani);
  } catch (error) {
    console.error('Üretim alanları yükleme hatası:', error);
    throw new Error('Üretim alanları yüklenemedi');
  }
};

export const deleteUretimAlani = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'uretimAlanlari', id));
  } catch (error) {
    console.error('Üretim alanı silme hatası:', error);
    throw new Error('Üretim alanı silinemedi');
  }
};

export const getAllUretimAlanlari = async (): Promise<UretimAlani[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'uretimAlanlari'));
    return querySnapshot.docs.map(doc => doc.data() as UretimAlani);
  } catch (error) {
    console.error('Tüm üretim alanları yükleme hatası:', error);
    throw new Error('Üretim alanları yüklenemedi');
  }
}; 