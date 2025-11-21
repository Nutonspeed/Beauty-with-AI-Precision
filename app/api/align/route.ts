import { NextResponse } from 'next/server';
import { alignPhotos } from '@/lib/progress/photo-aligner-server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  // Supabase server client manages cookies internally
  const supabase = await createServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { sourceImageUrl, targetImageUrl, quality = 0.95 } = await request.json();

  if (!sourceImageUrl || !targetImageUrl) {
    return NextResponse.json({ 
      error: 'Missing required parameters', 
      details: 'Both sourceImageUrl and targetImageUrl are required' 
    }, { status: 400 });
  }

  // Validate URLs
  try {
    new URL(sourceImageUrl);
    new URL(targetImageUrl);
  } catch {
    return NextResponse.json({
      error: 'Invalid URLs',
      details: 'Source and target must be valid URLs'
    }, { status: 400 });
  }

  try {
    console.log('[Align API] Starting photo alignment...');
    console.log('[Align API] Source:', sourceImageUrl);
    console.log('[Align API] Target:', targetImageUrl);
    
    const startTime = Date.now();
    
  // Call the server-side alignment function with retry logic
  let result: Awaited<ReturnType<typeof alignPhotos>> | null = null;
    let retryCount = 0;
    const maxRetries = 2;
    
    while (retryCount <= maxRetries) {
      try {
  result = await alignPhotos(sourceImageUrl, targetImageUrl, quality);
        break; // Success, exit retry loop
      } catch (error) {
        retryCount++;
        if (retryCount > maxRetries) throw error;
        
        console.warn(`[Align API] Retry ${retryCount}/${maxRetries} after error:`, error);
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    const duration = Date.now() - startTime;
    if (!result) {
      throw new Error('Alignment did not return a result');
    }
    console.log(`[Align API] Alignment completed in ${duration}ms`);
    console.log(`[Align API] Alignment score: ${(result.alignmentScore * 100).toFixed(1)}%`);
    
    // Add performance metadata
    return NextResponse.json({
      ...result,
      metadata: {
        duration,
        quality,
        timestamp: new Date().toISOString(),
        isWellAligned: result.alignmentScore >= 0.7
      }
    });
  } catch (error) {
    console.error('[Align API] Alignment failed:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred during alignment.';
    
    return NextResponse.json({ 
      error: 'Alignment failed', 
      details: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
