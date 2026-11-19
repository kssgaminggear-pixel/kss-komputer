import type { Metadata } from 'next';
import { isAdminConfigured } from '@/lib/admin-auth';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = {
  title: 'Masuk Admin — KSS Komputer',
  robots: { index: false, follow: false },
};

interface AdminLoginPageProps {
  searchParams: Promise<{ next?: string | string[] }>;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const requested = Array.isArray(params.next) ? params.next[0] : params.next;
  const nextPath = requested && requested.startsWith('/admin') ? requested : '/admin/pricing';

  return <LoginForm nextPath={nextPath} configured={isAdminConfigured()} />;
}
