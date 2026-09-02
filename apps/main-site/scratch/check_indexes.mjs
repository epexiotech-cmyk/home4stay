import pg from 'pg';
const { Client } = pg;

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

async function main() {
  const client = new Client({ connectionString });
  await client.connect();
  
  console.log('--- INDEXES IN DATABASE ---');
  const indexRes = await client.query(`
    SELECT
        tablename,
        indexname,
        indexdef
    FROM
        pg_indexes
    WHERE
        schemaname = 'public'
    ORDER BY
        tablename,
        indexname;
  `);
  console.table(indexRes.rows);

  console.log('--- FOREIGN KEYS ---');
  const fkRes = await client.query(`
    SELECT
        tc.table_name, 
        kcu.column_name, 
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name 
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
  `);
  console.table(fkRes.rows);
  
  await client.end();
}

main().catch(console.error);
