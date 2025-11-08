#!/usr/bin/env node

import dotenv from 'dotenv';
import { supabaseAdmin } from '../lib/supabase/admin';

dotenv.config();

try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .limit(1);
    if (error) throw error;
    if (!data || data.length === 0) {
      console.error('No users found');
      process.exit(2);
    }
    console.log(`First user id: ${data[0].id} email=${data[0].email}`);
    process.exit(0);
} catch (e) {
  console.error('Failed to fetch user:', e);
  process.exit(1);
}
