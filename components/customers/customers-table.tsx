'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/lib/mock/customer-mock-data';
import { useTranslations } from 'next-intl';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
  HeaderGroup,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Pencil, Trash2 } from 'lucide-react';

interface CustomersTableProps {
  data: Customer[];
  onSearch: (search: string) => void;
  onAddNew: () => void;
}

export function CustomersTable({ data, onSearch, onAddNew }: CustomersTableProps) {
  const t = useTranslations('customers.table');
  const commonT = useTranslations('common');
  const router = useRouter();

  const columns = useMemo<ColumnDef<Customer>[]>(() => [
    {
      accessorKey: 'name',
      header: () => t('columns.name'),
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
              {customer.profileImage ? (
                <img
                  src={customer.profileImage}
                  alt={`${customer.firstName} ${customer.lastName}`}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="text-gray-500 font-medium">
                  {customer.firstName[0]}
                  {customer.lastName[0]}
                </span>
              )}
            </div>
            <div>
              <div className="font-medium">
                {customer.firstName} {customer.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {customer.membershipLevel}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'contact',
      header: () => t('columns.contact'),
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{customer.phone}</div>
            <div className="text-sm text-muted-foreground">{customer.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'visits',
      header: () => t('columns.visits'),
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original;
        return (
          <div className="space-y-1">
            <div>{t('visitInfo.count', { count: customer.totalVisits })}</div>
            <div className="text-sm text-muted-foreground">
              {t('visitInfo.spent', { 
                amount: customer.totalSpent.toLocaleString(), 
                currency: commonT('currency.thb') 
              })}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'lastVisit',
      header: () => t('columns.lastVisit'),
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original;
        return customer.lastVisit
          ? new Date(customer.lastVisit).toLocaleDateString('th-TH', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : t('visitInfo.never');
      },
    },
    {
      id: 'actions',
      header: () => t('columns.actions'),
      cell: ({ row }: { row: Row<Customer> }) => {
        const customer = row.original;
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/admin/customers/${customer.id}`);
              }}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">{commonT('edit')}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-red-500"
              onClick={(e) => {
                e.stopPropagation();
                // Handle delete logic here
              }}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{commonT('delete')}</span>
            </Button>
          </div>
        );
      },
    },
  ], [t, commonT, router]);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder={t('searchPlaceholder')}
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                {t('columnsButton')} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id === 'name'
                        ? t('columns.name')
                        : column.id === 'contact'
                        ? t('columns.contact')
                        : column.id === 'visits'
                        ? t('columns.visits')
                        : column.id === 'lastVisit'
                        ? t('columns.lastVisit')
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={onAddNew}>
          {t('addNew')}
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup: HeaderGroup<Customer>) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row: Row<Customer>) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => {}}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {t('noResults')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {t('pagination.showing', { count: table.getFilteredRowModel().rows.length, total: data.length })}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {t('pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('pagination.next')}
          </Button>
        </div>
      </div>
    </div>
  );
}
