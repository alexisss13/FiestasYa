'use client';

import { useActionState, useEffect } from 'react';
import { authenticate } from '@/actions/auth-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, PartyPopper } from 'lucide-react';

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined);

  useEffect(() => {
    if (errorMessage === 'success') {
      window.location.href = '/admin/dashboard';
    }
  }, [errorMessage]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-slate-950 overflow-hidden">
      
      {/* --- FONDO ANIMADO COMPLETO --- */}
      <div className="absolute inset-0 z-0">
         {/* Luces de fondo */}
         <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-900/40 rounded-full blur-[120px]" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-900/30 rounded-full blur-[120px]" />
         
         {/* Patrón de puntos */}
         <div className="absolute inset-0 opacity-[0.05]" 
              style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }} 
         />
      </div>

      {/* --- TARJETA CENTRAL (GLASSMORPHISM) --- */}
      <div className="relative z-10 w-full max-w-[420px] px-4">
        
        {/* Header fuera de la tarjeta */}
        <div className="mb-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 shadow-2xl mb-6">
                <PartyPopper className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
              Panel Administrativo
            </h1>
            <p className="text-slate-400">
              FiestasYa E-commerce
            </p>
        </div>

        {/* La Tarjeta Blanca */}
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-8 sm:p-10">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Bienvenido de nuevo</h2>
              <p className="text-sm text-slate-500 mt-1">Ingresa tus credenciales para continuar</p>
            </div>

            <form action={formAction} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700 font-medium">Correo electrónico</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  placeholder="admin@fiestasya.com" 
                  required 
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700 font-medium">Contraseña</Label>
                </div>
                <Input 
                  id="password" 
                  name="password" 
                  type="password" 
                  placeholder="••••••" 
                  required 
                  className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                />
              </div>

              {errorMessage && errorMessage !== 'success' && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100 flex items-center gap-2 animate-in fade-in zoom-in-95">
                  <span className="font-bold">Error:</span> {errorMessage}
                </div>
              )}

              <Button type="submit" className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-base font-medium transition-all hover:scale-[1.01]" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accediendo...
                  </>
                ) : (
                  'Ingresar'
                )}
              </Button>
            </form>
          </div>
          
          {/* Footer de la tarjeta */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-500">
               Protegido por seguridad SSL de grado bancario.
             </p>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-slate-500/60">
           &copy; {new Date().getFullYear()} FiestasYa. Todos los derechos reservados.
        </p>

      </div>
    </div>
  );
}