import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}

export function ButtonLoading() {
  return <Loader2 className="h-4 w-4 animate-spin" />;
}
