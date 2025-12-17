import prisma from '@/lib/prisma';
import { NavbarClient } from './NavbarClient';
import { cookies } from 'next/headers';
import { Division } from '@prisma/client';
import { auth } from '@/auth'; 
import { FavoritesInitializer } from '@/components/features/FavoritesInitializer'; // 👈 Importar
import { getFavoriteIds } from '@/actions/favorites'; // 👈 Importar

export async function Navbar() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { 
      id: true, 
      name: true, 
      slug: true,
      division: true
    }
  });

  const cookieStore = await cookies();
  const rawDivision = cookieStore.get('festamas_division')?.value;
  
  const defaultDivision: Division = (rawDivision === 'FIESTAS' || rawDivision === 'JUGUETERIA') 
    ? rawDivision 
    : 'JUGUETERIA';

  // 🔐 Sesión
  const session = await auth();

  // ❤️ Obtener IDs de favoritos
  // Usamos el action que creamos para reutilizar lógica
  const favoriteIds = await getFavoriteIds();

  return (
    <>
      {/* 🔌 Inicializamos el store con los datos del servidor */}
      <FavoritesInitializer favoriteIds={favoriteIds} />
      
      <NavbarClient 
        categories={categories} 
        defaultDivision={defaultDivision}
        user={session?.user}
        // Ya no necesitamos pasar el count estático, el cliente lo leerá del store
      />
    </>
  );
}

export const revalidate = 60;