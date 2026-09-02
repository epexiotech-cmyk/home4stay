import pg from 'pg';
const { Pool } = pg;

const connectionString = 'postgresql://home4stay_user:home4stay_pass@localhost:5432/home4stay';

// Standard pre-hashed password string for Home@4971
const HASHED_PASSWORD = '$2b$10$J/RJVfyyo1RH1hLlizOWpu51X1NTZrXEDT71JVYvTr7rNpaxkXFn.';

const USERS = [
  { id: 'user_super_admin', email: 'super_admin@home4stay.com', password: HASHED_PASSWORD, role: 'super_admin', name: 'Super Admin' },
  { id: 'user_admin', email: 'admin@home4stay.com', password: HASHED_PASSWORD, role: 'admin', name: 'System Admin' },
  { id: 'owner_shivay', email: 'owner@shivay.com', password: HASHED_PASSWORD, role: 'owner', name: 'Shivay Resort Owner' },
  { id: 'owner_royalvilla', email: 'owner@royalvilla.com', password: HASHED_PASSWORD, role: 'owner', name: 'Royal Villa Owner' },
  { id: 'owner_tajvilla', email: 'owner@tajvilla.com', password: HASHED_PASSWORD, role: 'owner', name: 'Taj Villa Owner' },
  { id: 'owner_oceanview', email: 'owner@oceanview.com', password: HASHED_PASSWORD, role: 'owner', name: 'Ocean View Owner' },
  { id: 'customer_1', email: 'customer@home4stay.com', password: HASHED_PASSWORD, role: 'customer', name: 'Elite Guest User' }
];

const PROPERTIES = [
  { id: 'shivay-resort-101', ownerId: 'owner_shivay', slug: 'shivay', title: 'Shivay Resort' },
  { id: 'royal-villa-102', ownerId: 'owner_royalvilla', slug: 'royal-villa', title: 'Royal Villa' },
  { id: 'taj-villa-103', ownerId: 'owner_tajvilla', slug: 'taj-villa', title: 'Taj Villa' },
  { id: 'ocean-view-104', ownerId: 'owner_oceanview', slug: 'ocean-view', title: 'Ocean View' }
];

const ROOMS = [
  { id: 'room-deluxe-101', propertyId: 'shivay-resort-101', name: 'Deluxe Alpine Room', price: 4500, capacity: '2 Adults', view: 'Alpine Mountains', count: 5 },
  { id: 'room-suite-102', propertyId: 'shivay-resort-101', name: 'Presidential Suite', price: 12000, capacity: '4 Adults', view: 'Himalayan Ranges', count: 3 },
  { id: 'room-royal-201', propertyId: 'royal-villa-102', name: 'Royal Garden Villa Room', price: 7500, capacity: '2 Adults', view: 'Royal Palace Gardens', count: 5 }
];

const EXPERIENCES = [
  { id: 'exp-shv-1', propertyId: 'shivay-resort-101', title: 'Sunrise Mountain Paragliding', category: 'ADVENTURE', slug: 'sunrise-paragliding', description: 'Experience pure alpine flight at sunrise!' },
  { id: 'exp-shv-2', propertyId: 'shivay-resort-101', title: 'Himalayan Organic Spa Ritual', category: 'WELLNESS', slug: 'himalayan-spa', description: 'Recharge your spirit with traditional therapeutic botanical sessions.' },
  { id: 'exp-ryv-1', propertyId: 'royal-villa-102', title: 'Private Garden BBQ Gastronomy', category: 'FOOD_DRINK', slug: 'garden-bbq', description: 'Indulge in a signature palace culinary feast in private royal lawns.' },
  { id: 'exp-ryv-2', propertyId: 'royal-villa-102', title: 'Heritage Architecture Walk', category: 'CULTURE', slug: 'heritage-walk', description: 'Discover rich Mughal and modern palace details and stories.' }
];

const OFFERS = [
  { id: 'promo-shv-1', propertyId: 'shivay-resort-101', code: 'SHIVAY15', discountValue: 15, title: 'Inaugural Resort Discount', slug: 'shivay-inaugural', description: 'Get 15% off your alpine stay!' },
  { id: 'promo-ryv-1', propertyId: 'royal-villa-102', code: 'ROYAL5K', discountValue: 5000, title: 'Elite Villa Getaway', slug: 'royal-5k', description: 'Flat ₹5000 off on luxury villa experiences.' }
];

const REVIEWS = [
  { id: 'rev-shv-1', propertyId: 'shivay-resort-101', rating: 5, author: 'Siddharth M.', text: 'Absolutely spectacular vistas! Service was exceptional.', title: 'Spectacular stay!' },
  { id: 'rev-ryv-1', propertyId: 'royal-villa-102', rating: 5, author: 'Priyanka K.', text: 'Royal Villa exceeded all hospitality benchmarks.', title: 'Ultimate Luxury' }
];

async function seed() {
  const pool = new Pool({ connectionString });
  const client = await pool.connect();
  
  try {
    console.log("Starting transactional database seeding...");
    await client.query('BEGIN');

    console.log("Seeding users...");
    for (const u of USERS) {
      await client.query(
        `INSERT INTO users (id, email, password, role, name, kyc_status, verified_badge, verification_level, trusted_guest_score, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, 'NOT_VERIFIED', false, 0, 0, NOW(), NOW())
         ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, name = EXCLUDED.name, updated_at = NOW()`,
        [u.id, u.email, u.password, u.role, u.name]
      );
    }

    console.log("Seeding properties...");
    for (const p of PROPERTIES) {
      await client.query(
        `INSERT INTO properties (id, owner_id, slug, title, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET title = EXCLUDED.title, owner_id = EXCLUDED.owner_id, updated_at = NOW()`,
        [p.id, p.ownerId, p.slug, p.title]
      );
    }

    console.log("Seeding rooms & inventory...");
    for (const r of ROOMS) {
      await client.query(
        `INSERT INTO rooms (id, property_id, name, price, capacity, view, images, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, '[]', true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, updated_at = NOW()`,
        [r.id, r.propertyId, r.name, r.price, r.capacity, r.view]
      );
      
      await client.query(
        `INSERT INTO room_inventory (room_id, available_count)
         VALUES ($1, $2)
         ON CONFLICT (room_id) DO UPDATE SET available_count = EXCLUDED.available_count`,
        [r.id, r.count]
      );
    }

    console.log("Seeding experiences...");
    for (const e of EXPERIENCES) {
      await client.query(
        `INSERT INTO property_experiences (id, property_id, title, slug, description, category, price, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, 2500, true, NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, category = EXCLUDED.category, updated_at = NOW()`,
        [e.id, e.propertyId, e.title, e.slug, e.description, e.category]
      );
    }

    console.log("Seeding offers...");
    for (const o of OFFERS) {
      const isPercentage = o.code === 'SHIVAY15';
      await client.query(
        `INSERT INTO property_offers (id, property_id, title, slug, description, offer_type, discount_type, discount_value, coupon_code, minimum_booking_amount, start_date, end_date, is_active, is_featured, applicable_rooms, applicable_experiences, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW() + INTERVAL '30 days', true, false, '[]', '[]', NOW(), NOW())
         ON CONFLICT (id) DO UPDATE SET coupon_code = EXCLUDED.coupon_code, discount_value = EXCLUDED.discount_value, updated_at = NOW()`,
        [o.id, o.propertyId, o.title, o.slug, o.description, isPercentage ? 'discount' : 'package', isPercentage ? 'percentage' : 'flat', o.discountValue, o.code, isPercentage ? 0 : 20000]
      );
    }

    console.log("Seeding reviews...");
    for (const rv of REVIEWS) {
      await client.query(
        `INSERT INTO property_reviews (id, property_id, guest_name, guest_avatar, rating, title, message, stay_type, room_type, is_verified, is_published, is_featured, created_at)
         VALUES ($1, $2, $3, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150', $4, $5, $6, 'Leisure', 'Deluxe Room', true, true, true, NOW())
         ON CONFLICT (id) DO UPDATE SET rating = EXCLUDED.rating, message = EXCLUDED.message`,
        [rv.id, rv.propertyId, rv.author, rv.rating, rv.title, rv.text]
      );
    }

    await client.query('COMMIT');
    console.log("🎉 Database seeding completed successfully with 100% integrity!");
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("❌ Seeding transaction failed, transaction rolled back safely:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
