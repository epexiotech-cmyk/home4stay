import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../apps/main-site/.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const users = [
  { name: 'Admin User', email: 'admin@home4stay.homes', role: 'admin' },
  { name: 'Customer User', email: 'customer@home4stay.homes', role: 'customer' },
  { name: 'Owner User', email: 'owner@home4stay.homes', role: 'owner' },
  { name: 'Manager User', email: 'manager@home4stay.homes', role: 'manager' },
  { name: 'Super Admin User', email: 'super_admin@home4stay.homes', role: 'super_admin' },
];

async function seed() {
  try {
    const hashedPassword = await bcrypt.hash('Home@4971', 10);
    
    for (const user of users) {
      console.log(`Checking if ${user.role} user exists (${user.email})...`);
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [user.email]);
      
      if (rows.length === 0) {
        const newId = crypto.randomUUID();
        await pool.query(
          "INSERT INTO users (id, name, email, password, role, updated_at) VALUES ($1, $2, $3, $4, $5, NOW())",
          [newId, user.name, user.email, hashedPassword, user.role]
        );
        console.log(`✅ ${user.role} user created.`);
      } else {
        // Update role and password if it exists
        await pool.query("UPDATE users SET role = $1, password = $2 WHERE email = $3", [user.role, hashedPassword, user.email]);
        console.log(`✅ ${user.role} user updated with new password.`);
      }
    }
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
