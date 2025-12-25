#!/usr/bin/env node
/**
 * Dev seed script (no SQL editor needed)
 * - Uses Supabase service role to bypass RLS
 * - Seeds: clinics, customers, services, staff_members
 *
 * Usage:
 *   pnpm seed:dev
 *
 * Safety:
 * - Refuses to run when NODE_ENV === 'production'
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') })
const { createClient } = require('@supabase/supabase-js')

function requireEnv(name) {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing required env var: ${name}`)
    process.exit(1)
  }
  return value
}

if (process.env.NODE_ENV === 'production') {
  console.error('Refusing to run seed-dev.js in production (NODE_ENV=production).')
  process.exit(1)
}

const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const serviceKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function upsertClinic() {
  const email = 'demo@beautyclinic.com'
  const slug = 'beauty-clinic-demo'

  const { data: existing, error: existErr } = await supabase
    .from('clinics')
    .select('id,email,slug')
    .eq('email', email)
    .maybeSingle()

  if (existErr) throw existErr
  if (existing) return { ...existing, _seed_status: 'exists' }

  const { data, error } = await supabase
    .from('clinics')
    .insert({
      name: 'Beauty Clinic Demo',
      slug,
      email,
      phone: '02-123-4567',
      address: '123 ถนนสุขุมวิท กรุงเทพฯ',
    })
    .select('id,email,slug')
    .single()

  if (error) throw error
  return { ...data, _seed_status: 'created' }
}

async function ensureCustomer(clinicId) {
  const email = 'customer@test.com'

  const { data: existing, error: existErr } = await supabase
    .from('customers')
    .select('id,email')
    .eq('clinic_id', clinicId)
    .eq('email', email)
    .maybeSingle()

  if (existErr) throw existErr
  if (existing) return { ...existing, _seed_status: 'exists' }

  const { data, error } = await supabase
    .from('customers')
    .insert({
      clinic_id: clinicId,
      full_name: 'สมศรี ทดสอบ',
      email,
      phone: '089-876-5432',
      status: 'active',
      is_active: true,
    })
    .select('id,email')
    .single()

  if (error) throw error
  return { ...data, _seed_status: 'created' }
}

async function ensureService(clinicId, { name, price, duration_minutes, description }) {
  const { data: existing, error: existErr } = await supabase
    .from('services')
    .select('id,name')
    .eq('clinic_id', clinicId)
    .eq('name', name)
    .maybeSingle()

  if (existErr) throw existErr
  if (existing) return { ...existing, _seed_status: 'exists' }

  const { data, error } = await supabase
    .from('services')
    .insert({
      clinic_id: clinicId,
      name,
      description,
      price,
      duration_minutes,
      is_active: true,
      currency: 'THB',
      category: 'facial',
    })
    .select('id,name')
    .single()

  if (error) throw error
  return { ...data, _seed_status: 'created' }
}

async function ensureStaffMember(clinicId) {
  const email = 'doctor@beautyclinic.com'

  const { data: existing, error: existErr } = await supabase
    .from('staff_members')
    .select('id,email')
    .eq('clinic_id', clinicId)
    .eq('email', email)
    .maybeSingle()

  if (existErr) throw existErr
  if (existing) return { ...existing, _seed_status: 'exists' }

  const { data, error } = await supabase
    .from('staff_members')
    .insert({
      clinic_id: clinicId,
      role: 'doctor',
      name: 'พญ. แพทย์สาธิต',
      email,
      phone: '082-345-6789',
      status: 'active',
    })
    .select('id,email')
    .single()

  if (error) throw error
  return { ...data, _seed_status: 'created' }
}

async function summaryCountsForDemoClinic(clinicId) {
  const [customers, services, staffMembers] = await Promise.all([
    supabase.from('customers').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    supabase.from('services').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
    supabase.from('staff_members').select('id', { count: 'exact', head: true }).eq('clinic_id', clinicId),
  ])

  return {
    clinic_id: clinicId,
    customers: customers.count ?? null,
    services: services.count ?? null,
    staff_members: staffMembers.count ?? null,
  }
}

async function main() {
  console.log('Seeding dev data into Supabase (service role)...')

  const clinic = await upsertClinic()
  console.log(`Clinic (${clinic._seed_status}):`, { id: clinic.id, email: clinic.email, slug: clinic.slug })

  const customer = await ensureCustomer(clinic.id)
  console.log(`Customer (${customer._seed_status}):`, { id: customer.id, email: customer.email })

  const service1 = await ensureService(clinic.id, {
    name: 'ทรีทเมน์หน้าใส',
    description: 'ทรีทเมน์ดูแลผิวหน้าพิเศษ',
    duration_minutes: 60,
    price: 1500,
  })
  console.log(`Service (${service1._seed_status}):`, { id: service1.id, name: service1.name })

  const service2 = await ensureService(clinic.id, {
    name: 'ฟิลเลอร์ปากกระจับ',
    description: 'เพิ่มปริมาณริมฝีปาก',
    duration_minutes: 30,
    price: 5000,
  })
  console.log(`Service (${service2._seed_status}):`, { id: service2.id, name: service2.name })

  const staff = await ensureStaffMember(clinic.id)
  console.log(`Staff member (${staff._seed_status}):`, { id: staff.id, email: staff.email })

  const counts = await summaryCountsForDemoClinic(clinic.id)
  console.log('Demo clinic counts:', counts)

  console.log('✅ Done. You can now test booking/invoice flows.')
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
