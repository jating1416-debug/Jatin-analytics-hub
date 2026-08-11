import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();
  if (!admin) redirect('/login');

  return <AdminShell>{children}</AdminShell>;
}
