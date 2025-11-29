import { notFound } from 'next/navigation';
import { locales } from '@/i18n/request';

// Disable static generation for dynamic pages
export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return {
    title: 'ClinicIQ — Intelligent Aesthetic Platform',
    description: 'ClinicIQ brings medical-grade AI to aesthetics: skin analysis, booking, treatment recommendations, and clinic operations.',
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params before accessing locale
  const { locale } = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  return children;
}
