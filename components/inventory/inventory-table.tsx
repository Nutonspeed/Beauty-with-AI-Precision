"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Package, AlertTriangle, Loader2 } from "lucide-react"

interface InventoryItem {
  id: string
  name: string
  sku: string
  category: string
  quantity_in_stock: number
  min_stock_level: number
  unit_price: number
  unit_of_measure: string
  supplier_name: string
}

interface InventoryTableProps {
  items: InventoryItem[]
  loading: boolean
  onTransaction: (item: InventoryItem) => void
}

export function InventoryTable({ items, loading, onTransaction }: InventoryTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
        <Package className="h-12 w-12 mb-4 opacity-50" />
        <p>No items found</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item Name</TableHead>
          <TableHead>SKU</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Stock</TableHead>
          <TableHead>Unit Price</TableHead>
          <TableHead>Supplier</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const isLowStock = item.quantity_in_stock <= item.min_stock_level
          const isOutOfStock = item.quantity_in_stock === 0

          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.sku}</TableCell>
              <TableCell>
                <Badge variant="outline">{item.category}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {isOutOfStock ? (
                    <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                  ) : isLowStock ? (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  ) : null}
                  <span className={isLowStock ? "text-yellow-600 font-medium" : ""}>
                    {item.quantity_in_stock} {item.unit_of_measure}
                  </span>
                </div>
              </TableCell>
              <TableCell>${item.unit_price?.toFixed(2)}</TableCell>
              <TableCell>{item.supplier_name || "-"}</TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => onTransaction(item)}>
                  Record Transaction
                </Button>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
