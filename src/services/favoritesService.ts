import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Favorite {
  id: string;
  userId: string;
  providerId: string;
  createdAt: any;
}

class FavoritesService {
  private collectionName = 'favorites';

  async addFavorite(userId: string, providerId: string): Promise<void> {
    const favoriteId = `${userId}_${providerId}`;
    const favoriteRef = doc(db, this.collectionName, favoriteId);
    
    await setDoc(favoriteRef, {
      userId,
      providerId,
      createdAt: serverTimestamp()
    });
  }

  async removeFavorite(userId: string, providerId: string): Promise<void> {
    const favoriteId = `${userId}_${providerId}`;
    const favoriteRef = doc(db, this.collectionName, favoriteId);
    
    await deleteDoc(favoriteRef);
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const favoritesQuery = query(
      collection(db, this.collectionName),
      where('userId', '==', userId)
    );
    
    const snapshot = await getDocs(favoritesQuery);
    return snapshot.docs.map(doc => doc.data().providerId);
  }

  async isFavorite(userId: string, providerId: string): Promise<boolean> {
    const favorites = await this.getUserFavorites(userId);
    return favorites.includes(providerId);
  }
}

export const favoritesService = new FavoritesService();
