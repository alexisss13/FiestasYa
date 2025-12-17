'use client';

import { useEffect, useRef } from 'react';
import { useFavoritesStore } from '@/store/favorites';

interface Props {
  favoriteIds: string[];
}

export const FavoritesInitializer = ({ favoriteIds }: Props) => {
  // Usamos useRef para asegurar que solo se inicialice una vez si es necesario, 
  // aunque useEffect ya maneja dependencias.
  const setFavorites = useFavoritesStore(state => state.setFavorites);
  const initialized = useRef(false);

  if (!initialized.current) {
    setFavorites(favoriteIds);
    initialized.current = true;
  }

  return null; // Este componente no renderiza nada visual
};