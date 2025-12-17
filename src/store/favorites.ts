import { create } from 'zustand';

interface FavoritesState {
  favorites: string[]; // Lista de IDs
  setFavorites: (ids: string[]) => void;
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  // Cargar la lista inicial desde el servidor
  setFavorites: (ids: string[]) => set({ favorites: ids }),

  // Agregar un ID
  addFavorite: (id: string) => set((state) => ({
    favorites: [...state.favorites, id]
  })),

  // Quitar un ID
  removeFavorite: (id: string) => set((state) => ({
    favorites: state.favorites.filter((favId) => favId !== id)
  })),

  // Comprobar si existe
  isFavorite: (id: string) => get().favorites.includes(id),
}));