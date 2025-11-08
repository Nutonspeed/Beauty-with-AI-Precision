/**
 * Patient Progress Comparison Page
 * View treatment progress over multiple sessions
 */

import React from 'react';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import Link from 'next/link';
import { ComparisonPageClient } from './comparison-page-client';

interface PageProps {
  params: {
    locale: string;
    userId: string;
  };
  searchParams: {
    analysisIds?: string;
  };
}

async function getAnalyses(userId: string, analysisIds?: string[]) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // Get user authentication
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Verify user has access to this userId's data
  // In multi-tenant system, this would check clinic ownership
  // For now, we just ensure authenticated

  let query = supabase
    .from('skin_analyses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  // If specific analysis IDs provided, filter to those
  if (analysisIds && analysisIds.length > 0) {
    query = query.in('id', analysisIds);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching analyses:', error);
    return [];
  }

  return data || [];
}

export default async function ComparisonPage({ params, searchParams }: PageProps) {
  const { locale, userId } = params;
  
  // Parse analysis IDs from search params
  const analysisIds = searchParams.analysisIds
    ? searchParams.analysisIds.split(',').filter(Boolean)
    : undefined;

  const analyses = await getAnalyses(userId, analysisIds);

  if (!analyses || analyses.length < 2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href={`/${locale}/analysis/history`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'th' ? 'กลับ' : 'Back'}
            </Button>
          </Link>
        </div>

        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h2 className="text-2xl font-bold mb-2">
            {locale === 'th' ? 'ไม่พบข้อมูลเพียงพอ' : 'Insufficient Data'}
          </h2>
          <p className="text-muted-foreground mb-6">
            {locale === 'th'
              ? 'ต้องมีอย่างน้อย 2 การวิเคราะห์เพื่อเปรียบเทียบความคืบหน้า'
              : 'At least 2 analyses are required to compare progress'}
          </p>
          <Link href={`/${locale}/ai-chat`}>
            <Button>
              {locale === 'th' ? 'เริ่มวิเคราะห์' : 'Start Analysis'}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href={`/${locale}/analysis/history`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {locale === 'th' ? 'กลับ' : 'Back'}
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            {locale === 'th' ? 'ติดตามความคืบหน้า' : 'Progress Tracking'}
          </h1>
          <p className="text-muted-foreground">
            {locale === 'th'
              ? `เปรียบเทียบ ${analyses.length} การวิเคราะห์`
              : `Comparing ${analyses.length} analyses`}
          </p>
        </div>

        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          {locale === 'th' ? 'แชร์' : 'Share'}
        </Button>
      </div>

      {/* Client Component */}
      <ComparisonPageClient
        userId={userId}
        analysisIds={analysisIds || analyses.map(a => a.id)}
        locale={locale as 'en' | 'th'}
        initialAnalyses={analyses}
      />
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = params;
  
  return {
    title: locale === 'th' ? 'ติดตามความคืบหน้า - ai367bar' : 'Progress Tracking - ai367bar',
    description: locale === 'th'
      ? 'เปรียบเทียบผลการวิเคราะห์ผิวหน้าและติดตามความคืบหน้าของการรักษา'
      : 'Compare skin analysis results and track treatment progress over time'
  };
}
