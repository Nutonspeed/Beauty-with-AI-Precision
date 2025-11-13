import pg from 'pg';
const { Client } = pg;

// Skip SSL verification for Supabase connection
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: 'postgres://postgres.bgejeqqngzvuokdffadu:fovdyaf2TGERL9Yz@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres'
});

try {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL\n');

  // Get all tables count
  const { rows: tables } = await client.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log('📊 Total Tables in Database:', tables.length);
  console.log('---');
  tables.forEach((t, i) => {
    console.log(`${i + 1}. ${t.table_name}`);
  });

  console.log('\n');

  // Get table columns
  const { rows: columns } = await client.query(`
    SELECT column_name, data_type, udt_name, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'sales_leads'
    ORDER BY ordinal_position;
  `);

  console.log('📋 Table: sales_leads');
  console.log('Columns:', columns.length);
  console.log('---');
  columns.forEach((col, i) => {
    console.log(`${i + 1}. ${col.column_name} (${col.data_type === 'USER-DEFINED' ? col.udt_name : col.data_type})`);
  });

  console.log('\n');

  // Get enum values for lead_source
  const { rows: enumValues } = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_source')
    ORDER BY enumsortorder;
  `);

  console.log('🔤 ENUM: lead_source values');
  console.log('---');
  enumValues.forEach((v, i) => {
    console.log(`${i + 1}. '${v.enumlabel}'`);
  });

  console.log('\n');

  // Get enum values for lead_status
  const { rows: statusValues } = await client.query(`
    SELECT enumlabel 
    FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'lead_status')
    ORDER BY enumsortorder;
  `);

  console.log('🔤 ENUM: lead_status values');
  console.log('---');
  statusValues.forEach((v, i) => {
    console.log(`${i + 1}. '${v.enumlabel}'`);
  });

  await client.end();
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
