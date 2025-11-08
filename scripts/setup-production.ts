import { PrismaClient } from '@prisma/client'

const isDryRun = process.argv.includes('--dry-run') || process.argv.includes('-d')

const prisma = new PrismaClient()

// Production user data - Update with real admin accounts
const productionUsers = [
  {
    id: "prod-admin-001",
    email: "admin@yourclinic.com", // Change this to your admin email
    password: "$2b$12$km0R2JP8hAmhgQLYj89vNeXKAWNYMRYXXo1VLa0B.PsuPDftUtNrS", // "password123" - CHANGE THIS IN PRODUCTION!
    name: "Production Admin",
    role: "super_admin" as const,
    tenantId: null
  },
  // Add more admin users as needed
]

// Production tenant data - Update with your clinic information
const productionTenants = [
  {
    id: 'prod-tenant-001',
    slug: 'your-clinic-slug', // Change this to your clinic slug
    settings: {
      clinicName: 'Your Clinic Name', // Change this
      clinicType: 'aesthetic_clinic',
      email: 'contact@yourclinic.com', // Change this
      phone: '+66-XX-XXX-XXXX', // Change this
      address: {
        street: 'Your Street Address', // Change this
        city: 'Your City', // Change this
        state: 'Your State', // Change this
        postalCode: 'XXXXX', // Change this
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
      maxUsers: 50,
      maxCustomersPerMonth: 1000,
      maxStorageGB: 100,
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
      startDate: new Date(),
      billingCycle: 'monthly',
      amount: 9900,
      currency: 'THB',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'prod-admin-001',
    isActive: true,
    isTrial: false,
    isolationStrategy: 'shared_schema',
    usage: {
      currentUsers: 5,
      currentCustomers: 50,
      storageUsedGB: 5,
      apiCallsThisMonth: 1000,
      lastActivityAt: new Date(),
    },
  },
]

async function setupProductionDatabase() {
  console.log('🚀 Setting up Production Database...')
  console.log(`📊 Dry-run mode: ${isDryRun ? 'ENABLED' : 'DISABLED'}`)
  console.log(`🔗 Database URL: ${process.env.DATABASE_URL?.replace(/:[^:]*@/, ':***@')}\n`)

  try {
    // Test database connection
    console.log('1. Testing database connection...')
    if (!isDryRun) {
      await prisma.$connect()
      console.log('   ✅ Database connection successful\n')
    } else {
      console.log('   🔍 [DRY-RUN] Would test database connection\n')
    }

    // Run migrations
    console.log('2. Running database migrations...')
    if (!isDryRun) {
      // Note: In production, run: npx prisma migrate deploy
      console.log('   ℹ️  Run: npx prisma migrate deploy (in production)\n')
    } else {
      console.log('   🔍 [DRY-RUN] Would run database migrations\n')
    }

    // Create production tenants
    console.log('3. Creating production tenants...')
    for (const tenant of productionTenants) {
      if (!isDryRun) {
        await prisma.tenant.upsert({
          where: { id: tenant.id },
          update: tenant,
          create: tenant,
        })
      }
      console.log(`   ${isDryRun ? '🔍 [DRY-RUN]' : '✅'} Would create tenant: ${tenant.settings.clinicName} (${tenant.id})`)
    }
    console.log(`   ${isDryRun ? '🔍 [DRY-RUN]' : '✅'} Processed ${productionTenants.length} production tenants\n`)

    // Create production users
    console.log('4. Creating production users...')
    for (const user of productionUsers) {
      if (!isDryRun) {
        await prisma.user.upsert({
          where: { id: user.id },
          update: user,
          create: user,
        })
      }
      console.log(`   ${isDryRun ? '🔍 [DRY-RUN]' : '✅'} Would create user: ${user.name} (${user.email})`)
    }
    console.log(`   ${isDryRun ? '🔍 [DRY-RUN]' : '✅'} Processed ${productionUsers.length} production users\n`)

    // Verify setup
    console.log('5. Verifying setup...')
    if (!isDryRun) {
      const userCount = await prisma.user.count()
      const tenantCount = await prisma.tenant.count()

      console.log(`   Users: ${userCount}`)
      console.log(`   Tenants: ${tenantCount}`)
      console.log('   ✅ Setup verification complete\n')
    } else {
      console.log('   🔍 [DRY-RUN] Would verify setup (count users and tenants)\n')
    }

    console.log('🎉 Production database setup complete!')
    console.log('\n📋 Next Steps:')
    console.log('1. Update .env.production with your actual database credentials')
    console.log('2. Run: npx prisma migrate deploy (in production)')
    console.log('3. Update admin email and password in this script')
    console.log('4. Test the application with production database')
    console.log('5. Update NEXTAUTH_SECRET and NEXTAUTH_URL in production')

  } catch (error) {
    console.error('❌ Production setup failed:', error instanceof Error ? error.message : String(error))
    console.log('\n🔧 Troubleshooting:')
    console.log('1. Check DATABASE_URL in .env.production')
    console.log('2. Ensure PostgreSQL server is running')
    console.log('3. Verify database user permissions')
    if (isDryRun) {
      console.log('4. Run without --dry-run flag to execute actual setup')
    }
    throw error
  } finally {
    if (!isDryRun) {
      await prisma.$disconnect()
    } else {
      console.log('🔍 [DRY-RUN] Would disconnect from database')
    }
  }
}

// Run setup
setupProductionDatabase()
  .then(() => {
    console.log(`\n✨ Production setup script completed ${isDryRun ? '(DRY-RUN)' : ''}`)
    process.exit(0)
  })
  .catch((error) => {
    console.error(`\n💥 Production setup script failed ${isDryRun ? '(DRY-RUN)' : ''}:`, error)
    process.exit(1)
  })
