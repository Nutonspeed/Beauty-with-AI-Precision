export interface DashboardStats {
  totalClients: number
  newClientsThisMonth: number
  appointmentsToday: number
  cancelledAppointments: number
  monthlyRevenue: number
  revenueChange: number
  lowStockItems: number
}

export interface DashboardAppointment {
  id: string
  clientName: string
  treatment: string
  time: string
  status: 'confirmed' | 'pending'
}

export interface LowStockItem {
  id: string
  name: string
  currentStock: number
  minStock: number
}

export interface PopularTreatment {
  name: string
  count: number
}

export interface DashboardData {
  stats: DashboardStats
  recentAppointments: DashboardAppointment[]
  lowStockItems: LowStockItem[]
  popularTreatments: PopularTreatment[]
}

export const mockDashboardData: DashboardData = {
  stats: {
    totalClients: 1240,
    newClientsThisMonth: 48,
    appointmentsToday: 32,
    cancelledAppointments: 3,
    monthlyRevenue: 985000,
    revenueChange: 12,
    lowStockItems: 6,
  },
  recentAppointments: [
    {
      id: 'appt-001',
      clientName: 'สุดา ใจดี',
      treatment: 'Toning Laser',
      time: 'วันนี้ • 10:30 น.',
      status: 'confirmed',
    },
    {
      id: 'appt-002',
      clientName: 'มานะ ขยันดี',
      treatment: 'HydraFacial',
      time: 'วันนี้ • 13:00 น.',
      status: 'pending',
    },
    {
      id: 'appt-003',
      clientName: 'อรทัย รุ่งเรือง',
      treatment: 'Microneedling',
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
  popularTreatments: [
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
