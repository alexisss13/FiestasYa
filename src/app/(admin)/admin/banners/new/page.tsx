import { getAdminDivision } from '@/actions/admin-settings';
import { BannerForm } from '@/components/admin/BannerForm';

export default async function NewBannerPage() {
  const division = await getAdminDivision();

  return (
    <div className="p-4 md:p-8 flex justify-center">
      <BannerForm defaultDivision={division} />
    </div>
  );
}