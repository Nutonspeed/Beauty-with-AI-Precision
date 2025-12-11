import { EmbeddedSalesDashboard } from '@/components/sales/embedded-sales-dashboard'

export default function SalesDashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <EmbeddedSalesDashboard />
      </div>
    </div>
  )
}
