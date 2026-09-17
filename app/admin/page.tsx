import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById } from '@/lib/users';
import { getHeroSlides } from '@/lib/heroSlides';
import AdminDashboardClient from '@/components/AdminDashboardClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'แผงควบคุมผู้ดูแลระบบ (Admin Dashboard)',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie?.value) {
    redirect('/login');
  }

  const user = await getUserById(sessionCookie.value);
  if (!user) {
    redirect('/login');
  }

  // If not admin, redirect to normal user portal
  const isAdmin = user.email === 'admin@tsu.ac.th';
  if (!isAdmin) {
    redirect('/account');
  }

  const initialSlides = getHeroSlides();

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-800 antialiased font-sans">
      <AdminDashboardClient userEmail={user.email} initialSlides={initialSlides} />
    </div>
  );
}
