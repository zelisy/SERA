import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ChecklistSection } from '../types/checklist';

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