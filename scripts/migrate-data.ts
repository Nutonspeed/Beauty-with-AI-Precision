import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock user data from auth.ts
const mockUsers = [
  {
    id: "1",
    email: "clinic-owner@example.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS", // "password123"
    name: "Clinic Owner",
    role: "clinic_owner" as const,
    tenantId: "tenant_001"
  },
  {
    id: "2",
    email: "sales@example.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS", // "password123"
    name: "Sales Staff",
    role: "sales_staff" as const,
    tenantId: "tenant_001"
  },
  {
    id: "3",
    email: "customer@example.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS", // "password123"
    name: "Customer",
    role: "customer_free" as const,
    tenantId: "tenant_001"
  },
  {
    id: "4",
    email: "owner@dermacenter.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS",
    name: "Dr. Somchai",
    role: "clinic_owner" as const,
    tenantId: "tenant_002"
  },
  {
    id: "5",
    email: "staff@wellnessspa.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS",
    name: "Sarah",
    role: "sales_staff" as const,
    tenantId: "tenant_003"
  },
  {
    id: "super_admin_001",
    email: "admin@ai367bar.com",
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS",
    name: "Super Admin",
    role: "super_admin" as const,
    tenantId: null
  }
]

// Mock tenant data from tenant-manager.ts
const mockTenants = [
  {
    id: 'tenant_001',
    slug: 'beauty-clinic-bkk',
    settings: {
      clinicName: 'Beauty Clinic Bangkok',
      clinicType: 'aesthetic_clinic',
      email: 'contact@beautyclinic.com',
      phone: '+66-2-123-4567',
      address: {
        street: '123 Sukhumvit Road',
        city: 'Bangkok',
        state: 'Bangkok',
        postalCode: '10110',
        country: 'Thailand',
      },
      timezone: 'Asia/Bangkok',
      businessHours: {
        monday: { open: '09:00', close: '18:00', closed: false },
        tuesday: { open: '09:00', close: '18:00', closed: false },
        wednesday: { open: '09:00', close: '18:00', closed: false },
        thursday: { open: '09:00', close: '18:00', closed: false },
        friday: { open: '09:00', close: '18:00', closed: false },
        saturday: { open: '10:00', close: '16:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      defaultLanguage: 'th',
      supportedLanguages: ['th', 'en'],
      currency: 'THB',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: true,
    },
    branding: {
      primaryColor: '#8B5CF6',
      secondaryColor: '#EC4899',
    },
    features: {
      maxUsers: 10,
      maxCustomersPerMonth: 500,
      maxStorageGB: 5,
      aiAnalysisEnabled: true,
      advancedReporting: true,
      multiLocationSupport: false,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
    },
    subscription: {
      plan: 'professional',
      status: 'active',
      startDate: new Date('2025-01-01'),
      billingCycle: 'monthly',
      amount: 9900,
      currency: 'THB',
    },
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date(),
    createdBy: 'super_admin_001',
    isActive: true,
    isTrial: false,
    isolationStrategy: 'shared_schema',
    usage: {
      currentUsers: 12,
      currentCustomers: 234,
      storageUsedGB: 5.2,
      apiCallsThisMonth: 1450,
      lastActivityAt: new Date(),
    },
  },
  {
    id: 'tenant_002',
    slug: 'derma-center-cm',
    settings: {
      clinicName: 'Dermatology Center Chiang Mai',
      clinicType: 'dermatology',
      email: 'info@dermacenter.com',
      phone: '+66-53-123-456',
      address: {
        street: '456 Nimmanhaemin Road',
        city: 'Chiang Mai',
        state: 'Chiang Mai',
        postalCode: '50200',
        country: 'Thailand',
      },
      timezone: 'Asia/Bangkok',
      businessHours: {
        monday: { open: '08:00', close: '17:00', closed: false },
        tuesday: { open: '08:00', close: '17:00', closed: false },
        wednesday: { open: '08:00', close: '17:00', closed: false },
        thursday: { open: '08:00', close: '17:00', closed: false },
        friday: { open: '08:00', close: '17:00', closed: false },
        saturday: { open: '09:00', close: '14:00', closed: false },
        sunday: { open: '00:00', close: '00:00', closed: true },
      },
      defaultLanguage: 'th',
      supportedLanguages: ['th', 'en'],
      currency: 'THB',
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
    },
    features: {
      maxUsers: 50,
      maxCustomersPerMonth: 2000,
      maxStorageGB: 50,
      aiAnalysisEnabled: true,
      advancedReporting: true,
      multiLocationSupport: true,
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
    },
    subscription: {
      plan: 'enterprise',
      status: 'active',
      startDate: new Date('2024-06-01'),
      billingCycle: 'annual',
      amount: 180000,
      currency: 'THB',
    },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date(),
    createdBy: 'super_admin_001',
    isActive: true,
    isTrial: false,
    isolationStrategy: 'shared_schema',
    usage: {
      currentUsers: 35,
      currentCustomers: 890,
      storageUsedGB: 28.5,
      apiCallsThisMonth: 5670,
      lastActivityAt: new Date(),
    },
  },
  {
    id: 'tenant_003',
    slug: 'wellness-spa-phuket',
    settings: {
      clinicName: 'Wellness Spa Phuket',
      clinicType: 'wellness_center',
      email: 'hello@wellnessspa.com',
      phone: '+66-76-234-567',
      address: {
        street: '789 Beach Road',
        city: 'Phuket',
        state: 'Phuket',
        postalCode: '83000',
        country: 'Thailand',
      },
      timezone: 'Asia/Bangkok',
      businessHours: {
        monday: { open: '10:00', close: '20:00', closed: false },
        tuesday: { open: '10:00', close: '20:00', closed: false },
        wednesday: { open: '10:00', close: '20:00', closed: false },
        thursday: { open: '10:00', close: '20:00', closed: false },
        friday: { open: '10:00', close: '20:00', closed: false },
        saturday: { open: '10:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '20:00', closed: false },
      },
      defaultLanguage: 'en',
      supportedLanguages: ['en', 'th'],
      currency: 'THB',
      emailNotifications: true,
      smsNotifications: true,
      pushNotifications: false,
    },
    branding: {
      primaryColor: '#06B6D4',
      secondaryColor: '#F59E0B',
    },
    features: {
      maxUsers: 5,
      maxCustomersPerMonth: 100,
      maxStorageGB: 2,
      aiAnalysisEnabled: true,
      advancedReporting: false,
      multiLocationSupport: false,
      apiAccess: false,
      customBranding: true,
      prioritySupport: false,
    },
    subscription: {
      plan: 'starter',
      status: 'trial',
      startDate: new Date('2025-10-01'),
      endDate: new Date('2025-11-01'),
      billingCycle: 'monthly',
      amount: 2900,
      currency: 'THB',
    },
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date(),
    createdBy: 'super_admin_001',
    isActive: true,
    isTrial: true,
    isolationStrategy: 'shared_schema',
    usage: {
      currentUsers: 3,
      currentCustomers: 45,
      storageUsedGB: 1.2,
      apiCallsThisMonth: 230,
      lastActivityAt: new Date(),
    },
  },
]

async function main() {
  console.log('Starting data migration...')

  try {
    // Migrate tenants first
    console.log('Migrating tenants...')
    for (const tenant of mockTenants) {
      await prisma.tenant.upsert({
        where: { id: tenant.id },
        update: tenant,
        create: tenant,
      })
    }
    console.log(`✅ Migrated ${mockTenants.length} tenants`)

    // Migrate users
    console.log('Migrating users...')
    for (const user of mockUsers) {
      await prisma.user.upsert({
        where: { id: user.id },
        update: user,
        create: user,
      })
    }
    console.log(`✅ Migrated ${mockUsers.length} users`)

    console.log('🎉 Data migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run migration
main()
  .then(() => {
    console.log('Migration script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Migration script failed:', error)
    process.exit(1)
  })
