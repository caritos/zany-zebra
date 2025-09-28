#!/usr/bin/env node

/**
 * Database Cleanup Script
 * Cleans all user data from the database while preserving schema structure
 */

const fs = require('fs');
const path = require('path');

// Read the cleanup SQL file
const sqlFilePath = path.join(__dirname, '../database/migrations/999_clean_database.sql');
const cleanupSQL = fs.readFileSync(sqlFilePath, 'utf8');

console.log('🧹 Database Cleanup Script');
console.log('==========================');
console.log('');
console.log('This script will clean all user data from your database:');
console.log('- All clubs and club memberships');
console.log('- All match records and sets');
console.log('- All guest players');
console.log('- All user profiles');
console.log('- Reset ID sequences to start from 1');
console.log('');
console.log('⚠️  WARNING: This action cannot be undone!');
console.log('');

// Check if we're in an interactive terminal
const isInteractive = process.stdin.isTTY;

if (isInteractive) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Are you sure you want to proceed? (type "yes" to confirm): ', (answer) => {
    if (answer.toLowerCase() === 'yes') {
      executeCleanup();
    } else {
      console.log('❌ Database cleanup cancelled.');
      process.exit(0);
    }
    rl.close();
  });
} else {
  // Non-interactive mode - require explicit confirmation via environment variable
  if (process.env.CONFIRM_DB_CLEANUP === 'yes') {
    executeCleanup();
  } else {
    console.log('❌ For non-interactive cleanup, set CONFIRM_DB_CLEANUP=yes');
    console.log('');
    console.log('Example:');
    console.log('CONFIRM_DB_CLEANUP=yes node scripts/clean-database.js');
    process.exit(1);
  }
}

async function executeCleanup() {
  console.log('');
  console.log('🚀 Starting database cleanup...');

  try {
    // Try to use Supabase client if available
    let supabase;
    try {
      const { createClient } = require('@supabase/supabase-js');
      require('dotenv').config();

      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Missing Supabase configuration');
      }

      supabase = createClient(supabaseUrl, supabaseServiceKey);
      console.log('✅ Connected to Supabase');

    } catch (error) {
      console.log('❌ Could not connect to Supabase:', error.message);
      console.log('');
      console.log('📋 Manual cleanup instructions:');
      console.log('1. Copy the SQL from: database/migrations/999_clean_database.sql');
      console.log('2. Run it in your Supabase SQL editor');
      console.log('3. Or use your preferred database client');
      console.log('');
      console.log('🔗 SQL Content:');
      console.log('================');
      console.log(cleanupSQL);
      return;
    }

    // Execute the cleanup SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql: cleanupSQL });

    if (error) {
      console.log('❌ Error executing cleanup:', error.message);
      console.log('');
      console.log('📋 Try running this SQL manually in Supabase:');
      console.log(cleanupSQL);
    } else {
      console.log('✅ Database cleanup completed successfully!');
      console.log('');
      console.log('🎉 Your database is now clean and ready for fresh data.');
      console.log('');
      console.log('Next steps:');
      console.log('- Create new clubs');
      console.log('- Invite users to join');
      console.log('- Start recording matches');
    }

  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    console.log('');
    console.log('📋 Manual cleanup recommended - run this SQL:');
    console.log(cleanupSQL);
  }
}