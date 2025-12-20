'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  TouchSensor, // 👈 IMPORTANTE: Sensor táctil
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { deleteHomeSection, reorderHomeSections } from '@/actions/home-sections';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    Pencil, Trash2, Sparkles, Gift, PartyPopper, 
    Star, Tag, EyeOff, GripVertical, LayoutList 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Division } from '@prisma/client';

// Mapa de iconos
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ICON_COMPONENTS: Record<string, any> = {
    star: Star,
    gift: Gift,
    party: PartyPopper,
    sparkles: Sparkles,
    tag: Tag,
};

// --- ITEM INDIVIDUAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function SortableSectionItem({ section, onDelete, brandColorText }: { section: any, onDelete: (id: string) => void, brandColorBg: string, brandColorText: string }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 50 : 'auto',
        position: 'relative' as const,
        touchAction: 'none', // 👈 VITAL para evitar conflictos de scroll en móvil
    };

    const Icon = ICON_COMPONENTS[section.icon] || Star;

    return (
        <div ref={setNodeRef} style={style} className={cn(
            "group flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-white border rounded-xl shadow-sm transition-all",
            isDragging ? "ring-2 ring-slate-400 bg-slate-50 scale-[1.02]" : "hover:border-slate-300 hover:shadow-md",
            !section.isActive && "opacity-60 bg-slate-50 border-dashed"
        )}>
            {/* 1. AGARRADERA DRAG (Touch Friendly) */}
            <div 
                {...attributes} 
                {...listeners} 
                className="p-2 -ml-2 md:ml-0 cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors touch-none"
                title="Arrastrar para ordenar"
            >
                <GripVertical className="w-5 h-5 md:w-5 md:h-5" />
            </div>

            {/* 2. ICONO GRANDE (Un poco más chico en móvil) */}
            <div className={cn(
                "h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                section.isActive 
                    ? `bg-white ${brandColorText} border-slate-100` 
                    : "bg-slate-100 text-slate-400 border-transparent"
            )}>
                <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            {/* 3. INFO PRINCIPAL */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5 md:gap-1">
                <div className="flex items-center gap-2 md:gap-3">
                    <h3 className={cn("font-bold text-slate-900 text-sm md:text-base truncate", !section.isActive && "line-through text-slate-500")}>
                        {section.title}
                    </h3>
                    {!section.isActive && (
                        <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-slate-200 text-slate-500 gap-1 border-none hidden sm:flex">
                            <EyeOff className="w-3 h-3" /> Oculto
                        </Badge>
                    )}
                </div>
                
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-slate-500">
                    {section.subtitle && (
                        <>
                            {/* Ocultamos subtítulo en pantallas MUY pequeñas para priorizar el Tag */}
                            <span className="truncate max-w-[150px] md:max-w-[300px] italic hidden sm:inline">
                                {section.subtitle}
                            </span>
                            <span className="text-slate-300 hidden sm:inline">|</span>
                        </>
                    )}
                    
                    <div className="flex items-center gap-1.5 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                        <Tag className="w-3 h-3" />
                        <span className="font-mono text-[10px] md:text-xs font-medium text-slate-700">{section.tag}</span>
                    </div>
                </div>
            </div>

            {/* 4. ACCIONES */}
            <div className="flex items-center gap-1 md:gap-2 pl-2 md:pl-4 border-l border-slate-100">
                <Button variant="ghost" size="icon" asChild className="h-8 w-8 md:h-9 md:w-9 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                    <Link href={`/admin/sections/${section.id}`}>
                        <Pencil className="w-4 h-4" />
                    </Link>
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 md:h-9 md:w-9 text-slate-300 hover:text-red-600 hover:bg-red-50"
                    onClick={() => onDelete(section.id)}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// --- COMPONENTE PRINCIPAL ---
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SectionList({ sections: initialSections, division }: { sections: any[], division: Division }) {
    const router = useRouter();
    const [sections, setSections] = useState(initialSections);
    
    useEffect(() => { 
        const sorted = [...initialSections].sort((a, b) => (a.order || 0) - (b.order || 0));
        setSections(sorted); 
    }, [initialSections]);

    const isFestamas = division === 'JUGUETERIA';
    const brandColorBg = isFestamas ? "bg-festamas-primary/10" : "bg-fiestasya-accent/10";
    const brandColorText = isFestamas ? "text-festamas-primary" : "text-fiestasya-accent";

    // Configuración de Sensores para Móvil y Desktop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), // Mouse: requiere mover 8px
        useSensor(TouchSensor, { // Móvil: requiere mantener pulsado 250ms y mover 5px (Evita scroll accidental)
            activationConstraint: {
                delay: 250, 
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = sections.findIndex((item) => item.id === active.id);
            const newIndex = sections.findIndex((item) => item.id === over.id);
            
            const newItems = arrayMove(sections, oldIndex, newIndex);
            setSections(newItems);

            const updates = newItems.map((item, index) => ({ id: item.id, order: index }));
            await reorderHomeSections(updates);
            router.refresh();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Eliminar esta sección de la home?")) return;
        const res = await deleteHomeSection(id);
        if (res.ok) {
            toast.success("Sección eliminada");
            router.refresh();
        } else {
            toast.error("Error al eliminar");
        }
    };

    if (sections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-slate-200 text-center animate-in fade-in w-full">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <LayoutList className="h-8 w-8 text-slate-300" />
                </div>
                <h4 className="text-slate-900 font-semibold text-lg">No hay secciones activas</h4>
                <p className="text-slate-500 max-w-sm mt-1 mb-6">
                    Aún no has configurado secciones para la Home de {isFestamas ? 'Festamas' : 'FiestasYa'}.
                </p>
                <Button asChild variant="outline">
                    <Link href="/admin/sections/new">Crear Sección</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 animate-in fade-in duration-500">
            {/* Header de la tabla visual (OCULTO EN MÓVIL) */}
            <div className="hidden md:flex items-center justify-between px-4 mb-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <span>Orden / Contenido</span>
                <span>Acciones</span>
            </div>

            <DndContext 
                id="dnd-home-sections" 
                sensors={sensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleDragEnd}
            >
                <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {sections.map((section) => (
                            <SortableSectionItem 
                                key={section.id} 
                                section={section} 
                                onDelete={handleDelete}
                                brandColorBg={brandColorBg}
                                brandColorText={brandColorText}
                            />
                        ))}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}