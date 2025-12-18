'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Category, Division } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Plus, Trash2, Save, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { createBulkProducts } from '@/actions/products';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Props {
  categories: Category[];
  division: Division;
}

interface ProductRow {
  id: number;
  title: string;
  price: string;
  stock: string;
  categoryId: string;
}

export function BulkProductForm({ categories, division }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [rows, setRows] = useState<ProductRow[]>(
    Array.from({ length: 5 }).map((_, i) => ({
      id: i, title: '', price: '', stock: '', categoryId: ''
    }))
  );

  const isFestamas = division === 'JUGUETERIA';
  const brandClass = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";
  const btnClass = isFestamas ? "bg-festamas-primary hover:bg-festamas-primary/90" : "bg-fiestasya-accent hover:bg-fiestasya-accent/90";

  const addRow = () => {
    setRows(prev => [
      ...prev, 
      { id: Date.now(), title: '', price: '', stock: '', categoryId: '' }
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length === 1) return;
    setRows(prev => prev.filter(r => r.id !== id));
  };

  const updateRow = (id: number, field: keyof ProductRow, value: string) => {
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, [field]: value } : row
    ));
  };

  const handleSubmit = async () => {
    const validRows = rows.filter(r => r.title.trim() !== '');

    if (validRows.length === 0) {
      toast.error('Agrega al menos un producto con nombre.');
      return;
    }

    const hasErrors = validRows.some(r => !r.price || !r.categoryId);
    if (hasErrors) {
      toast.error('Todos los productos deben tener Precio y Categoría.');
      return;
    }

    setLoading(true);
    const result = await createBulkProducts(validRows, division);

    if (result.success) {
      toast.success(`¡Éxito! Se crearon ${result.count} productos.`);
      router.push('/admin/products');
      router.refresh();
    } else {
      toast.error(result.error || 'Error al guardar masivamente.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Carga Rápida <span className={cn("text-xs px-2 py-1 rounded-md bg-slate-100 uppercase font-extrabold tracking-wide", brandClass)}>
                {isFestamas ? 'Festamas' : 'FiestasYa'}
            </span>
          </h1>
          <p className="text-slate-500 text-sm">
            Agrega múltiples productos a la vez. Los campos vacíos serán ignorados.
          </p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" asChild>
                <Link href="/admin/products"><ArrowLeft className="mr-2 h-4 w-4" /> Volver</Link>
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className={cn("text-white min-w-[140px]", btnClass)}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Todo
            </Button>
        </div>
      </div>

      {/* TABLA DE EDICIÓN */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="w-[40%] min-w-[200px] pl-4">Nombre del Producto</TableHead>
              <TableHead className="w-[20%]">Categoría</TableHead>
              <TableHead className="w-[15%] text-right">Precio (S/)</TableHead>
              <TableHead className="w-[15%] text-right pr-4">Stock Inicial</TableHead>
              <TableHead className="w-[10%] text-center">Acción</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={row.id} className="group hover:bg-slate-50/50">
                <TableCell className="p-2">
                  <Input 
                    placeholder={`Producto #${index + 1}`}
                    value={row.title}
                    onChange={(e) => updateRow(row.id, 'title', e.target.value)}
                    // 👇 FIX: Altura h-9, padding normal px-3, borde suave
                    className="h-9 border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 font-medium"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <select
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400"
                    value={row.categoryId}
                    onChange={(e) => updateRow(row.id, 'categoryId', e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    min="0" 
                    step="0.01"
                    value={row.price}
                    onChange={(e) => updateRow(row.id, 'price', e.target.value)}
                    // 👇 FIX: text-right para alinear números
                    className="h-9 text-right border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 font-mono"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Input 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    value={row.stock}
                    onChange={(e) => updateRow(row.id, 'stock', e.target.value)}
                    // 👇 FIX: text-right para alinear números
                    className="h-9 text-right border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-400 font-mono"
                  />
                </TableCell>
                <TableCell className="text-center p-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeRow(row.id)}
                    className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                    tabIndex={-1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {/* FOOTER TABLA */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
            <Button 
                variant="outline" 
                onClick={addRow} 
                className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-700 hover:bg-white hover:border-slate-400 h-10"
            >
                <Plus className="mr-2 h-4 w-4" /> Agregar otra fila
            </Button>
        </div>
      </div>
    </div>
  );
}