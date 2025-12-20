import { getAdminDivision } from '@/actions/admin-settings';
import { SectionForm } from '@/components/admin/SectionForm';

export default async function NewSectionPage() {
  const division = await getAdminDivision();

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <SectionForm defaultDivision={division} />
    </div>
  );
}