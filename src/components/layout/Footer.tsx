import Link from 'next/link';
import { PartyPopper } from 'lucide-react';
import prisma from '@/lib/prisma';

export async function Footer() {
  // 1. Fetch de datos en el servidor (igual que el Navbar)
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
    take: 6 // Limitamos a 6 para mantener el diseño limpio
  });

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* 1. MARCA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-slate-900" />
              <span className="text-xl font-bold tracking-tighter text-slate-900">
                FiestasYa
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs">
              Hacemos que tus celebraciones sean inolvidables con los mejores artículos de fiesta en Trujillo.
            </p>
          </div>

          {/* 2. CATEGORÍAS DINÁMICAS */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Categorías</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              {/* Mapeamos las categorías reales de la BD */}
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="hover:text-slate-900 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              
              {/* Link extra fijo */}
              <li>
                <Link href="/search?q=" className="hover:text-slate-900 transition-colors font-medium text-slate-600">
                  Ver todo...
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. LEGAL / CONTACTO (Esto suele ser estático) */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Empresa</h3>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/" className="hover:text-slate-900">Inicio</Link></li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeRwJVEuZlu14QhTtBkNIVToNBP7oUcgUJhf2tEvaAI5DR9rg/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    Solicitar Devolución
                  </a>
              </li>
              <li className="pt-2">
                <Link href="/admin/dashboard" className="text-slate-400 hover:text-slate-900 text-xs">
                  Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t pt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} FiestasYa E-commerce.
        </div>
      </div>
    </footer>
  );
}