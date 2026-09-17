import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserById, findUserByEmail } from '@/lib/users';
import { auth } from '@/auth';
import UserAccountClient from '@/components/UserAccountClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'บัญชีของฉัน',
};

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  let user = null;

  if (session?.user?.email) {
    user = await findUserByEmail(session.user.email);
  } else if (sessionCookie?.value) {
    user = await getUserById(sessionCookie.value);
  }

  if (!user) {
    redirect('/login?callbackUrl=/account');
  }

  const isAdmin = user.email === 'admin@tsu.ac.th';

  return (
    <main className="min-h-[85vh] bg-[#f8fafc] py-6 sm:py-10">
      <UserAccountClient
        user={{
          id: user.id,
          email: user.email,
        }}
        isAdmin={isAdmin}
      />
    </main>
  );
}
