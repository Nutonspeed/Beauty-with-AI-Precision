import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function PaginationControls({
  page,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: PaginationControlsProps) {
  const t = useTranslations();
  return (
    <div className="flex items-center justify-between mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('pagination.itemsPerPage')}</span>
        <select
          className="border rounded px-2 py-1 text-sm bg-transparent text-white border-white/10"
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
        >
          <option value={5} className="bg-[#020617]">5</option>
          <option value={10} className="bg-[#020617]">10</option>
          <option value={25} className="bg-[#020617]">25</option>
          <option value={50} className="bg-[#020617]">50</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
        >
          {t('pagination.previous')}
        </Button>
        <span className="text-sm text-muted-foreground">
          {t('pagination.pageOf', { page, total: totalPages || 1 })}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10"
        >
          {t('pagination.next')}
        </Button>
      </div>
    </div>
  );
}
