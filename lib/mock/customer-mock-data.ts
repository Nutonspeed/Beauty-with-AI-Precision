export type CustomerGender = 'male' | 'female' | 'other'
export type CustomerMembershipLevel = 'silver' | 'gold' | 'platinum'

export interface Customer {
  id: string
  firstName: string
  lastName: string
  phone: string
  email?: string
  gender: CustomerGender
  birthDate: string
  address?: string
  allergies?: string[]
  notes?: string
  membershipLevel: CustomerMembershipLevel
  profileImage?: string
  totalVisits: number
  totalSpent: number
  lastVisit?: string
  createdAt: string
  updatedAt: string
}

export const mockCustomers: Customer[] = [
  {
    id: 'cust-001',
    firstName: 'สุดา',
    lastName: 'ใจดี',
    phone: '089-123-4567',
    email: 'suda@example.com',
    gender: 'female',
    birthDate: '1990-05-12',
    address: '123 ถนนสุขุมวิท กรุงเทพ',
    allergies: ['น้ำหอม'],
    notes: 'ชอบบริการปรับผิวหน้า',
    membershipLevel: 'gold',
    profileImage: undefined,
    totalVisits: 8,
    totalSpent: 42500,
    lastVisit: '2024-08-15T10:00:00Z',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2024-08-15T12:30:00Z',
  },
  {
    id: 'cust-002',
    firstName: 'สมชาย',
    lastName: 'ตั้งใจ',
    phone: '081-555-9876',
    email: 'somchai@example.com',
    gender: 'male',
    birthDate: '1985-11-02',
    address: '456 ถนนเพชรบุรี กรุงเทพ',
    allergies: [],
    notes: 'สนใจโปรแกรมฟื้นฟูผิว',
    membershipLevel: 'platinum',
    profileImage: undefined,
    totalVisits: 15,
    totalSpent: 86200,
    lastVisit: '2024-08-10T09:30:00Z',
    createdAt: '2022-08-01T09:00:00Z',
    updatedAt: '2024-08-10T11:15:00Z',
  },
  {
    id: 'cust-003',
    firstName: 'มาลี',
    lastName: 'สุขใจ',
    phone: '086-222-3344',
    email: 'malee@example.com',
    gender: 'female',
    birthDate: '1995-02-20',
    address: '789 ถนนราชดำริ กรุงเทพ',
    allergies: ['ละอองเกสร'],
    notes: 'เน้นลดเลือนจุดด่างดำ',
    membershipLevel: 'silver',
    profileImage: undefined,
    totalVisits: 5,
    totalSpent: 23800,
    lastVisit: '2024-07-30T14:15:00Z',
    createdAt: '2023-06-18T10:45:00Z',
    updatedAt: '2024-07-30T15:00:00Z',
  },
]
