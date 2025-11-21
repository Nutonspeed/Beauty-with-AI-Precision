'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Customer } from '@/lib/mock/customer-mock-data';
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

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'name',
    header: 'ชื่อ-นามสกุล',
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
    header: 'ข้อมูลติดต่อ',
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
    header: 'การมาใช้บริการ',
    cell: ({ row }: { row: Row<Customer> }) => {
      const customer = row.original;
      return (
        <div className="space-y-1">
          <div>มาแล้ว {customer.totalVisits} ครั้ง</div>
          <div className="text-sm text-muted-foreground">
            ใช้จ่าย {customer.totalSpent.toLocaleString()} บาท
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'lastVisit',
    header: 'มาใช้บริการล่าสุด',
    cell: ({ row }: { row: Row<Customer> }) => {
      const customer = row.original;
      return customer.lastVisit
        ? new Date(customer.lastVisit).toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })
        : 'ยังไม่เคยมาใช้บริการ';
    },
  },
  {
    id: 'actions',
    cell: ({ row }: { row: Row<Customer> }) => {
      const customer = row.original;

      // Delegate to a proper React component to allow using hooks safely
      const Actions: React.FC<{ customer: Customer }> = ({ customer }) => {
        const router = useRouter();
        return (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => router.push(`/admin/customers/${customer.id}`)}
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">แก้ไข</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">ลบ</span>
            </Button>
          </div>
        );
      };

      return <Actions customer={customer} />;
    },
  },
];

interface CustomersTableProps {
  data: Customer[];
  onSearch: (search: string) => void;
  onAddNew: () => void;
}

export function CustomersTable({ data, onSearch, onAddNew }: CustomersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="ค้นหาลูกค้า..."
            onChange={(e) => onSearch(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                คอลัมน์ <ChevronDown className="ml-2 h-4 w-4" />
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
                        ? 'ชื่อ-นามสกุล'
                        : column.id === 'contact'
                        ? 'ข้อมูลติดต่อ'
                        : column.id === 'visits'
                        ? 'การมาใช้บริการ'
                        : column.id === 'lastVisit'
                        ? 'มาใช้บริการล่าสุด'
                        : column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={onAddNew}>
          เพิ่มลูกค้าใหม่
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
                  ไม่พบข้อมูลลูกค้า
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          แสดง {table.getFilteredRowModel().rows.length} รายการ จากทั้งหมด{' '}
          {data.length} รายการ
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ก่อนหน้า
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            ถัดไป
          </Button>
        </div>
      </div>
    </div>
  );
}
