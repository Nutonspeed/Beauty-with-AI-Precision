export interface DashboardStats {
  totalCustomers: number
  newCustomersThisMonth: number
  sessionsToday: number
  cancelledSessions: number
  monthlyRevenue: number
  revenueChange: number
  lowStockItems: number
}

export interface DashboardSession {
  id: string
  customerName: string
  program: string
  time: string
  status: 'confirmed' | 'pending'
}

export interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
}

export interface PopularProgram {
  name: string
  count: number
}

export interface DashboardData {
  stats: DashboardStats
  recentSessions: DashboardSession[]
  lowStockItems: LowStockItem[]
  popularPrograms: PopularProgram[]
}

export const mockDashboardData: DashboardData = {
  stats: {
    totalCustomers: 1240,
    newCustomersThisMonth: 48,
    sessionsToday: 32,
    cancelledSessions: 3,
    monthlyRevenue: 985000,
    revenueChange: 12,
    lowStockItems: 6,
  },
  recentSessions: [
    {
      id: 'appt-001',
      customerName: 'สุดา ใจดี',
      program: 'Toning Laser',
      time: 'วันนี้ • 10:30 น.',
      status: 'confirmed',
    },
    {
      id: 'appt-002',
      customerName: 'มานะ ขยันดี',
      program: 'HydraFacial',
      time: 'วันนี้ • 13:00 น.',
      status: 'pending',
    },
    {
      id: 'appt-003',
      customerName: 'อรทัย รุ่งเรือง',
      program: 'Microneedling',
      time: 'วันนี้ • 15:30 น.',
      status: 'confirmed',
    },
  ],
  lowStockItems: [
    {
      id: 'stock-001',
      name: 'เซรั่มวิตามินซี 30ml',
      currentStock: 8,
      minStock: 15,
    },
    {
      id: 'stock-002',
      name: 'มอยส์เจอร์ไรเซอร์สูตรกลางคืน',
      currentStock: 5,
      minStock: 12,
    },
    {
      id: 'stock-003',
      name: 'ชุดรักษาสิวเรื้อรัง',
      currentStock: 4,
      minStock: 10,
    },
  ],
  popularPrograms: [
    {
      name: 'HydraFacial Signature',
      count: 120,
    },
    {
      name: 'Brightening Laser',
      count: 98,
    },
    {
      name: 'Acne Clear Program',
      count: 86,
    },
  ],
}
