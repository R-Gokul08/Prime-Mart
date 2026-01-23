import { useCallback } from 'react';
import { UserProfile } from '@/types/grocery';
import { useLocalStorage } from './useLocalStorage';

const defaultProfile: UserProfile = {
  id: crypto.randomUUID(),
  name: '',
  email: '',
  favoriteStores: [],
  favoriteBrands: [],
  createdAt: new Date(),
};

export function useUserProfile() {
  const [profile, setProfile] = useLocalStorage<UserProfile>('smartcart-profile', defaultProfile);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  }, [setProfile]);

  const addFavoriteStore = useCallback((store: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteStores: prev.favoriteStores.includes(store)
        ? prev.favoriteStores
        : [...prev.favoriteStores, store],
    }));
  }, [setProfile]);

  const removeFavoriteStore = useCallback((store: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteStores: prev.favoriteStores.filter(s => s !== store),
    }));
  }, [setProfile]);

  const addFavoriteBrand = useCallback((brand: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteBrands: prev.favoriteBrands.includes(brand)
        ? prev.favoriteBrands
        : [...prev.favoriteBrands, brand],
    }));
  }, [setProfile]);

  const removeFavoriteBrand = useCallback((brand: string) => {
    setProfile(prev => ({
      ...prev,
      favoriteBrands: prev.favoriteBrands.filter(b => b !== brand),
    }));
  }, [setProfile]);

  const toggleFavoriteStore = useCallback((store: string) => {
    if (profile.favoriteStores.includes(store)) {
      removeFavoriteStore(store);
    } else {
      addFavoriteStore(store);
    }
  }, [profile.favoriteStores, addFavoriteStore, removeFavoriteStore]);

  const toggleFavoriteBrand = useCallback((brand: string) => {
    if (profile.favoriteBrands.includes(brand)) {
      removeFavoriteBrand(brand);
    } else {
      addFavoriteBrand(brand);
    }
  }, [profile.favoriteBrands, addFavoriteBrand, removeFavoriteBrand]);

  return {
    profile,
    updateProfile,
    addFavoriteStore,
    removeFavoriteStore,
    addFavoriteBrand,
    removeFavoriteBrand,
    toggleFavoriteStore,
    toggleFavoriteBrand,
  };
}
