import { CategoryForm } from '@/components/features/CategoryForm';
import { getAdminDivision } from '@/actions/admin-settings';

export default async function NewCategoryPage() {
  const division = await getAdminDivision();

  return (
    <div className="p-8">
      <CategoryForm defaultDivision={division} key={division} />
    </div>
  );
}