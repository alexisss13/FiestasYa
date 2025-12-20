import { notFound } from 'next/navigation';
import { getHomeSectionById } from '@/actions/home-sections';
import { SectionForm } from '@/components/admin/SectionForm';

interface Props { params: Promise<{ id: string }> }

export default async function EditSectionPage({ params }: Props) {
  const { id } = await params;
  
  const section = await getHomeSectionById(id);
  
  if (!section) notFound();

  // Mapeamos a SectionData para compatibilidad de tipos si es necesario
  // Prisma retorna el objeto directo que suele coincidir, pero aseguramos.
  return (
    <div className="p-4 md:p-8 flex justify-center">
        <SectionForm section={section} />
    </div>
  );
}