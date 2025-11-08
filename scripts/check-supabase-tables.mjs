import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

// ใช้ NON_POOLING URL สำหรับ direct connection
const connectionString = process.env.SUPABASE_POSTGRES_URL_NON_POOLING;

async function checkDatabase() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('✅ Connected to Supabase PostgreSQL\n');

    // 1. เช็คตาราง public ทั้งหมด
    console.log('📋 === EXISTING TABLES ===\n');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    const existingTables = tablesResult.rows.map(r => r.table_name);
    console.log('Tables found:', existingTables.length);
    existingTables.forEach(table => console.log(`  - ${table}`));

    // 2. เช็คตาราง users โดยเฉพาะ
    console.log('\n📊 === USERS TABLE INFO ===\n');
    if (existingTables.includes('users')) {
      // เช็ค columns
      const columnsResult = await client.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users'
        ORDER BY ordinal_position;
      `);
      
      console.log('Columns in users table:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name} (${col.data_type}, nullable: ${col.is_nullable})`);
      });

      // เช็ค foreign keys
      const fkResult = await client.query(`
        SELECT
          tc.constraint_name,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = 'users' AND tc.constraint_type = 'FOREIGN KEY';
      `);

      console.log('\nForeign keys in users table:');
      if (fkResult.rows.length === 0) {
        console.log('  (none)');
      } else {
        fkResult.rows.forEach(fk => {
          console.log(`  - ${fk.constraint_name}: ${fk.column_name} → ${fk.foreign_table_name}.${fk.foreign_column_name}`);
        });
      }

      // เช็คข้อมูลใน users ที่มี clinic_id
      const usersWithClinicResult = await client.query(`
        SELECT COUNT(*) as count, clinic_id 
        FROM users 
        WHERE clinic_id IS NOT NULL 
        GROUP BY clinic_id;
      `);

      console.log('\nUsers with clinic_id:');
      if (usersWithClinicResult.rows.length === 0) {
        console.log('  (none)');
      } else {
        usersWithClinicResult.rows.forEach(row => {
          console.log(`  - clinic_id: ${row.clinic_id} (${row.count} users)`);
        });
      }
    } else {
      console.log('❌ users table NOT found!');
    }

    // 3. เช็คว่า clinics table มีหรือยัง
    console.log('\n🏥 === CLINICS TABLE INFO ===\n');
    if (existingTables.includes('clinics')) {
      const clinicsCountResult = await client.query('SELECT COUNT(*) as count FROM clinics;');
      console.log(`✅ clinics table exists (${clinicsCountResult.rows[0].count} rows)`);
    } else {
      console.log('❌ clinics table NOT found');
    }

    // 4. สรุปตารางที่ต้องสร้าง
    console.log('\n📝 === MIGRATION PLAN ===\n');
    const requiredTables = ['clinics', 'customers', 'services', 'bookings', 'user_preferences'];
    const missingTables = requiredTables.filter(t => !existingTables.includes(t));

    if (missingTables.length === 0) {
      console.log('✅ All required tables already exist!');
    } else {
      console.log('⚠️  Missing tables:');
      missingTables.forEach(table => console.log(`  - ${table}`));
    }

    // 5. แนะนำแก้ไข
    console.log('\n💡 === RECOMMENDATIONS ===\n');
    
    if (existingTables.includes('users') && !existingTables.includes('clinics')) {
      console.log('⚠️  PROBLEM: users table exists but clinics table does NOT exist');
      console.log('   → Cannot add foreign key users.clinic_id → clinics.id');
      console.log('   → SOLUTION: Create clinics table FIRST, then add foreign key');
    }

    const usersHasClinicId = existingTables.includes('users');
    if (usersHasClinicId) {
      const columnsResult = await client.query(`
        SELECT column_name 
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'clinic_id';
      `);
      
      if (columnsResult.rows.length > 0) {
        console.log('✅ users.clinic_id column exists');
        
        // เช็คว่ามี invalid clinic_id ไหม
        const invalidClinicIdsResult = await client.query(`
          SELECT DISTINCT clinic_id 
          FROM users 
          WHERE clinic_id IS NOT NULL 
          AND clinic_id NOT IN (SELECT id FROM clinics WHERE 1=0);
        `);
        
        if (invalidClinicIdsResult.rows.length > 0) {
          console.log('\n⚠️  Found users with invalid clinic_id:');
          invalidClinicIdsResult.rows.forEach(row => {
            console.log(`   - ${row.clinic_id}`);
          });
          console.log('   → Need to fix these before adding foreign key');
        }
      }
    }

    console.log('\n✅ Database check complete!\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

checkDatabase().catch(console.error);
