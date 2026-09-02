import pg from 'pg';
import crypto from 'crypto';
const { Client } = pg;

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('--- STARTING PROPERTY ACCESS BACKFILL ---');
  
  // 1. Fetch all properties
  console.log('Fetching properties from database...');
  const propRes = await client.query('SELECT id, owner_id, title, slug FROM properties');
  const properties = propRes.rows;
  console.log(`Found ${properties.length} properties to process.`);
  
  let createdCount = 0;
  let skippedCount = 0;
  
  // 2. Process each property
  for (const prop of properties) {
    const propertyId = prop.id;
    const userId = prop.owner_id;
    
    if (!userId) {
      console.warn(`⚠️ Warning: Property ${prop.title} (${propertyId}) has no owner_id. Skipping.`);
      skippedCount++;
      continue;
    }
    
    // Check if the user access record already exists
    const checkRes = await client.query(
      'SELECT id FROM property_user_access WHERE property_id = $1 AND user_id = $2',
      [propertyId, userId]
    );
    
    if (checkRes.rows.length > 0) {
      console.log(`ℹ️ Access already exists for Property: ${prop.title} (${prop.slug}) -> User: ${userId}`);
      skippedCount++;
    } else {
      // Insert new access record with role 'owner'
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO property_user_access (id, property_id, user_id, role, created_at, updated_at)
         VALUES ($1, $2, $3, 'owner', NOW(), NOW())`,
        [id, propertyId, userId]
      );
      console.log(`✅ Backfilled Access: Property ${prop.title} (${prop.slug}) -> User ${userId} (Role: owner)`);
      createdCount++;
    }
  }
  
  console.log('--- BACKFILL PROCESS COMPLETED ---');
  console.log(`Created: ${createdCount} records`);
  console.log(`Skipped/Already Existed: ${skippedCount} records`);
  
  // 3. Verify the final count in property_user_access
  const verifyRes = await client.query('SELECT COUNT(*) FROM property_user_access');
  console.log(`Total records in property_user_access: ${verifyRes.rows[0].count}`);
  
  await client.end();
}

main().catch(console.error);
