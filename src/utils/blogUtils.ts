import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  where, 
  serverTimestamp,
  increment 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Blog, BlogFormData } from '../types/blog';

// Blog koleksiyonu referansı
const blogsCollection = collection(db, 'blogs');

// Yeni blog oluştur
export const createBlog = async (blogData: BlogFormData): Promise<string> => {
  try {
    const docRef = await addDoc(blogsCollection, {
      ...blogData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: blogData.published ? serverTimestamp() : null,
      viewCount: 0,
    });
    return docRef.id;
  } catch (error) {
    console.error('Blog oluşturma hatası:', error);
    throw new Error('Blog oluşturulamadı');
  }
};

// Blog güncelle
export const updateBlog = async (id: string, blogData: Partial<BlogFormData>): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', id);
    const updateData: any = {
      ...blogData,
      updatedAt: serverTimestamp(),
    };
    
    // Eğer yayın durumu değiştiyse publishedAt'i güncelle
    if (blogData.published !== undefined) {
      updateData.publishedAt = blogData.published ? serverTimestamp() : null;
    }
    
    await updateDoc(blogRef, updateData);
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    throw new Error('Blog güncellenemedi');
  }
};

// Blog sil
export const deleteBlog = async (id: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await deleteDoc(blogRef);
  } catch (error) {
    console.error('Blog silme hatası:', error);
    throw new Error('Blog silinemedi');
  }
};

// Tüm blogları getir
export const getAllBlogs = async (): Promise<Blog[]> => {
  try {
    const q = query(blogsCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || null,
    })) as Blog[];
  } catch (error) {
    console.error('Blogları getirme hatası:', error);
    throw new Error('Bloglar getirilemedi');
  }
};

// Yayınlanmış blogları getir
export const getPublishedBlogs = async (): Promise<Blog[]> => {
  try {
    const q = query(
      blogsCollection,
      where('published', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const blogs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || null,
    })) as Blog[];
    
    // Client-side sorting
    return blogs.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Yayınlanmış blogları getirme hatası:', error);
    throw new Error('Yayınlanmış bloglar getirilemedi');
  }
};

// Tek blog getir
export const getBlogById = async (id: string): Promise<Blog | null> => {
  try {
    const blogRef = doc(db, 'blogs', id);
    const blogSnap = await getDoc(blogRef);
    
    if (blogSnap.exists()) {
      const data = blogSnap.data();
      return {
        id: blogSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        publishedAt: data.publishedAt?.toDate() || null,
      } as Blog;
    }
    return null;
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    throw new Error('Blog getirilemedi');
  }
};

// Blog görüntülenme sayısını artır
export const incrementBlogViewCount = async (id: string): Promise<void> => {
  try {
    const blogRef = doc(db, 'blogs', id);
    await updateDoc(blogRef, {
      viewCount: increment(1)
    });
  } catch (error) {
    console.error('Görüntülenme sayısı artırma hatası:', error);
  }
};

// Kategoriye göre blogları getir
export const getBlogsByCategory = async (category: string): Promise<Blog[]> => {
  try {
    const q = query(
      blogsCollection,
      where('category', '==', category),
      where('published', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const blogs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || null,
    })) as Blog[];
    
    // Client-side sorting
    return blogs.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Kategori blogları getirme hatası:', error);
    throw new Error('Kategori blogları getirilemedi');
  }
};

// Öne çıkan blogları getir
export const getFeaturedBlogs = async (): Promise<Blog[]> => {
  try {
    const q = query(
      blogsCollection,
      where('featured', '==', true),
      where('published', '==', true)
    );
    const querySnapshot = await getDocs(q);
    
    const blogs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      publishedAt: doc.data().publishedAt?.toDate() || null,
    })) as Blog[];
    
    // Client-side sorting
    return blogs.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  } catch (error) {
    console.error('Öne çıkan blogları getirme hatası:', error);
    throw new Error('Öne çıkan bloglar getirilemedi');
  }
}; 