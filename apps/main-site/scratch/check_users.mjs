import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('--- USERS IN DATABASE ---');
  const usersRes = await client.query('SELECT id, email, role, name, kyc_status FROM users');
  console.table(usersRes.rows);

  console.log('--- PROPERTIES IN DATABASE ---');
  const propRes = await client.query('SELECT id, owner_id, slug, title FROM properties');
  console.table(propRes.rows);
  
  await client.end();
}

main().catch(console.error);
