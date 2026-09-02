import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('Fetching table list...');
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  
  console.log('Tables found:');
  for (const row of res.rows) {
    console.log(`- ${row.table_name}`);
  }
  
  await client.end();
}

main().catch(console.error);
