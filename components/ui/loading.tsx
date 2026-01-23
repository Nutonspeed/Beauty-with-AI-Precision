import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function LoadingSpinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex items-center justify-center relative", className)} {...props}>
      <div className="absolute size-12 rounded-full bg-pink-500/10 animate-ping opacity-20" />
      <Loader2 className="h-8 w-8 animate-spin text-pink-600 shadow-glow-pink" />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] gap-6">
      <div className="relative">
        <div className="absolute inset-[-1rem] size-20 rounded-full bg-pink-100/50 animate-ping opacity-20" />
        <div className="relative flex items-center justify-center size-16 rounded-[2rem] bg-white shadow-premium">
          <Loader2 className="h-8 w-8 animate-spin text-pink-600 shadow-glow-pink" />
        </div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] italic text-slate-400 animate-pulse">
        Initializing Precision...
      </p>
    </div>
  );
}

export function ButtonLoading() {
  return <Loader2 className="h-4 w-4 animate-spin stroke-[3]" />;
}
