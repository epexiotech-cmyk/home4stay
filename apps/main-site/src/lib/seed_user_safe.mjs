import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function seed() {
  try {
    console.log("Checking if admin user exists...");
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", ["admin@home4stay.homes"]);
    
    if (rows.length === 0) {
      console.log("Admin user not found. Seeding...");
      const hashedPassword = await bcrypt.hash("123456", 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Admin", "admin@home4stay.homes", hashedPassword, "admin"]
      );
      console.log("✅ Admin user created: admin@home4stay.homes / 123456");
    } else {
      console.log("✅ Admin user already exists.");
    }

    console.log("Checking if customer user exists...");
    const { rows: customerRows } = await pool.query("SELECT * FROM users WHERE email = $1", ["customer@home4stay.homes"]);
    
    if (customerRows.length === 0) {
      console.log("Customer user not found. Seeding...");
      const hashedPassword = await bcrypt.hash("123456", 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ["Customer", "customer@home4stay.homes", hashedPassword, "customer"]
      );
      console.log("✅ Customer user created: customer@home4stay.homes / 123456");
    } else {
      console.log("✅ Customer user already exists.");
    }
  } catch (err) {
    console.error("❌ Error seeding user:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

seed();
