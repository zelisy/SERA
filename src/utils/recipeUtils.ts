import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs, deleteDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Recipe, CreateRecipeData } from '../types/recipe';

// Reçete kaydetme
export const saveRecipe = async (recipeData: CreateRecipeData): Promise<string> => {
  try {
    const docRef = doc(collection(db, 'recipes'));
    
    const recipe: Omit<Recipe, 'id'> = {
      ...recipeData,
      id: docRef.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await setDoc(docRef, recipe);
    return docRef.id;
  } catch (error) {
    console.error('Reçete kayıt hatası:', error);
    throw new Error('Reçete kaydedilemedi');
  }
};

// Reçete güncelleme
export const updateRecipe = async (recipeId: string, recipeData: Partial<CreateRecipeData>): Promise<void> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    await updateDoc(docRef, {
      ...recipeData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Reçete güncelleme hatası:', error);
    throw new Error('Reçete güncellenemedi');
  }
};

// Reçete getirme
export const getRecipe = async (recipeId: string): Promise<Recipe | null> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as Recipe;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Reçete getirme hatası:', error);
    throw new Error('Reçete yüklenemedi');
  }
};

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

// Tüm reçeteleri getirme
export const getAllRecipes = async (): Promise<Recipe[]> => {
  try {
    const q = query(
      collection(db, 'recipes'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const recipes: Recipe[] = [];
    
    querySnapshot.forEach((doc) => {
      recipes.push(doc.data() as Recipe);
    });
    
    return recipes;
  } catch (error) {
    console.error('Tüm reçeteler getirme hatası:', error);
    throw new Error('Reçeteler yüklenemedi');
  }
};

// Reçete silme
export const deleteRecipe = async (recipeId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'recipes', recipeId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Reçete silme hatası:', error);
    throw new Error('Reçete silinemedi');
  }
}; 