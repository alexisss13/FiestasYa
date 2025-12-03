import Link from 'next/link';
import { PartyPopper } from 'lucide-react';
import prisma from '@/lib/prisma';

export async function Footer() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
    take: 6
  });

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          
          {/* 1. MARCA */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <PartyPopper className="h-6 w-6 text-primary" /> {/* Logo Rosado */}
              <span className="text-2xl font-bold tracking-tighter text-primary">
                FiestasYa
              </span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Hacemos que tus celebraciones sean inolvidables con los mejores artículos de fiesta en Trujillo.
            </p>
          </div>

          {/* 2. CATEGORÍAS DINÁMICAS */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Categorías</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/category/${cat.slug}`} 
                    className="hover:text-primary transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/search?q=" className="hover:text-primary transition-colors font-medium text-primary">
                  Ver todo...
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. LEGAL / CONTACTO */}
          <div>
            <h3 className="font-bold text-slate-900 mb-4">Ayuda</h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-primary">Inicio</Link></li>
              <li>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                  {/* 👇 LINK REAL AL FORMULARIO DE DEVOLUCIONES */}
                  <a 
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeRwJVEuZlu14QhTtBkNIVToNBP7oUcgUJhf2tEvaAI5DR9rg/viewform" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-primary cursor-pointer"
                  >
                    Solicitar Devolución
                  </a>
              </li>
              <li className="pt-4">
                <Link href="/admin/dashboard" className="text-slate-400 hover:text-primary text-xs transition-colors">
                  Acceso Administrativo
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t pt-8 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} FiestasYa E-commerce. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}