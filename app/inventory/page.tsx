"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { InventoryTable } from "@/components/inventory/inventory-table"
import { AddItemDialog } from "@/components/inventory/add-item-dialog"
import { TransactionDialog } from "@/components/inventory/transaction-dialog"
import { Package, AlertTriangle, Plus, Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventory()
    fetchLowStock()
  }, [])

  const fetchInventory = async () => {
    try {
      const response = await fetch("/api/inventory/items")
      const data = await response.json()
      setItems(data.items || [])
    } catch (error) {
      console.error("[v0] Error fetching inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLowStock = async () => {
    try {
      const response = await fetch("/api/inventory/items?low_stock=true")
      const data = await response.json()
      setLowStockItems(data.items || [])
    } catch (error) {
      console.error("[v0] Error fetching low stock:", error)
    }
  }

  const filteredItems = items.filter(
    (item: { name: string; sku: string; category: string }) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleTransaction = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowTransactionDialog(true)
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">Track and manage clinic supplies</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{lowStockItems.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {items
                .reduce(
                  (sum: number, item: { quantity_in_stock: number; unit_price: number }) =>
                    sum + item.quantity_in_stock * (item.unit_price || 0),
                  0,
                )
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Inventory Items</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Items ({items.length})</TabsTrigger>
              <TabsTrigger value="low-stock">
                Low Stock
                {lowStockItems.length > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">{lowStockItems.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <InventoryTable items={filteredItems} loading={loading} onTransaction={handleTransaction} />
            </TabsContent>
            <TabsContent value="low-stock">
              <InventoryTable items={lowStockItems} loading={loading} onTransaction={handleTransaction} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AddItemDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={fetchInventory} />

      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        item={selectedItem}
        onSuccess={() => {
          fetchInventory()
          fetchLowStock()
        }}
      />
    </div>
  )
}
