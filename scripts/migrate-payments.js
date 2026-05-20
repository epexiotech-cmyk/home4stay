const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

// Load environment variables manually if they exist in .env.local
const rootEnvPath = path.resolve(__dirname, '../.env.local');
const appEnvPath = path.resolve(__dirname, '../apps/main-site/.env.local');

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (fs.existsSync(appEnvPath)) {
    const envContent = fs.readFileSync(appEnvPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) databaseUrl = match[1].trim();
  }
}
if (!databaseUrl) {
  if (fs.existsSync(rootEnvPath)) {
    const envContent = fs.readFileSync(rootEnvPath, 'utf8');
    const match = envContent.match(/^DATABASE_URL=(.+)$/m);
    if (match) databaseUrl = match[1].trim();
  }
}

if (!databaseUrl) {
  databaseUrl = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';
}

console.log('Migrating database at URL:', databaseUrl.replace(/:[^:@]+@/, ':***@'));

const pool = new Pool({
  connectionString: databaseUrl,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    console.log('Connected to database. Commencing transaction...');
    await client.query('BEGIN');

    // 1. Create property_payment_configs table
    console.log('Creating property_payment_configs table if not exists...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_payment_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        property_id TEXT NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
        provider TEXT NOT NULL,
        upi_id TEXT,
        merchant_name TEXT,
        bank_name TEXT,
        gateway_key TEXT,
        gateway_secret TEXT,
        webhook_secret TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add index on property_payment_configs(property_id) if it doesn't exist
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_property_payment_configs_property_id ON property_payment_configs(property_id);
    `);

    // 2. Safely add columns to bookings table
    const columnsToAdd = [
      { name: 'payment_mode', type: 'TEXT' },
      { name: 'payment_reference', type: 'TEXT' },
      { name: 'utr_number', type: 'TEXT' },
      { name: 'payment_submitted_at', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'payment_verified_at', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'payment_expires_at', type: 'TIMESTAMP WITH TIME ZONE' },
      { name: 'temporary_inventory_locked_until', type: 'TIMESTAMP WITH TIME ZONE' }
    ];

    for (const col of columnsToAdd) {
      console.log(`Checking if column ${col.name} exists in bookings table...`);
      const colCheck = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'bookings' AND column_name = $1;
      `, [col.name]);

      if (colCheck.rows.length === 0) {
        console.log(`Adding column ${col.name} to bookings...`);
        await client.query(`ALTER TABLE bookings ADD COLUMN ${col.name} ${col.type};`);
      } else {
        console.log(`Column ${col.name} already exists. Skipping.`);
      }
    }

    // Add unique index on payment_reference to ensure absolute booking reference uniqueness
    console.log('Creating unique index on bookings(payment_reference) if not exists...');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_payment_reference_unique 
      ON bookings(payment_reference) 
      WHERE payment_reference IS NOT NULL;
    `);

    await client.query('COMMIT');
    console.log('🎉 Migration successful!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();
