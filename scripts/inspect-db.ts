/**
 * Check database structure
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectData() {
  const { data, error } = await supabase
    .from('skin_analyses')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Raw data from database:');
  console.log(JSON.stringify(data[0], null, 2));
}

inspectData();
