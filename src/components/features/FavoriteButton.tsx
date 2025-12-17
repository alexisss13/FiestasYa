'use client';

import { useTransition } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/actions/favorites';
import { toast } from 'sonner';
import { useFavoritesStore } from '@/store/favorites'; // 👈 IMPORTAR STORE

interface Props {
  productId: string;
  className?: string;
  // Ya no necesitamos isFavoriteInitial porque leemos el store
}

export const FavoriteButton = ({ productId, className }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  // 🧠 LEEMOS EL ESTADO GLOBAL
  const isFavorite = useFavoritesStore(state => state.isFavorite(productId));
  const addFavorite = useFavoritesStore(state => state.addFavorite);
  const removeFavorite = useFavoritesStore(state => state.removeFavorite);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Optimistic Update (Actualizamos el store INMEDIATAMENTE)
    if (isFavorite) {
        removeFavorite(productId);
    } else {
        addFavorite(productId);
    }

    startTransition(async () => {
      const { ok, message, isFavorite: newState } = await toggleFavorite(productId);
      
      if (!ok) {
        // Si falló, revertimos el cambio en el store
        if (isFavorite) addFavorite(productId); 
        else removeFavorite(productId);

        if (message === 'Debes iniciar sesión') {
            toast.error("Inicia sesión para guardar favoritos");
            router.push('/auth/login');
        } else {
            toast.error(message);
        }
        return;
      }
      
      // Mensaje de éxito
      if (newState) {
        toast.success(message);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "group/heart relative p-2 rounded-full bg-white/90 shadow-sm hover:shadow-md transition-all hover:scale-110 active:scale-95",
        className
      )}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      ) : (
        <Heart
          className={cn(
            "w-4 h-4 transition-colors duration-300",
            isFavorite 
              ? "fill-rose-500 text-rose-500" // ❤️ Activo (Rojo)
              : "text-slate-400 group-hover/heart:text-rose-500" // 🤍 Inactivo (Gris)
          )}
        />
      )}
    </button>
  );
};