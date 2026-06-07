import pool from '../lib/pg';
import fs from 'fs';
import path from 'path';

async function initDb() {
  console.log('Initializing PostgreSQL tables...');
  
  try {
    // 1. Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        surname VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        otp VARCHAR(50)
      );
    `);
    console.log('Created users table.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS venues (
        id SERIAL PRIMARY KEY,
        tuman VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        image TEXT,
        location VARCHAR(255) NOT NULL,
        description TEXT,
        phone_number VARCHAR(100) NOT NULL,
        status VARCHAR(50) NOT NULL,
        capacity INT NOT NULL,
        owner_id INT REFERENCES users(id) ON DELETE SET NULL,
        karnay_surnay_available BOOLEAN DEFAULT FALSE,
        karnay_surnay_price NUMERIC DEFAULT 0,
        menu JSONB,
        currency VARCHAR(10) DEFAULT 'UZS'
      );
    `);
    console.log('Created venues table.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS venue_images (
        id SERIAL PRIMARY KEY,
        venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL
      );
    `);
    console.log('Created venue_images table.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS venue_singers (
        id SERIAL PRIMARY KEY,
        venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        image TEXT
      );
    `);
    console.log('Created venue_singers table.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS venue_cars (
        id SERIAL PRIMARY KEY,
        venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
        brand VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        image TEXT
      );
    `);
    console.log('Created venue_cars table.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        venue_id INT REFERENCES venues(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id) ON DELETE SET NULL,
        booking_date DATE NOT NULL,
        guest_count INT NOT NULL,
        contact_name VARCHAR(255) NOT NULL,
        contact_surname VARCHAR(255) NOT NULL,
        contact_phone VARCHAR(100) NOT NULL,
        selected_services JSONB,
        status VARCHAR(100) NOT NULL
      );
    `);
    console.log('Created bookings table.');

    // 2. Create indexes
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venues_tuman ON venues(tuman);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venue_images_venue_id ON venue_images(venue_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venue_singers_venue_id ON venue_singers(venue_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_venue_cars_venue_id ON venue_cars(venue_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);');
    await pool.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_venue_date_unique ON bookings (venue_id, booking_date);');
    console.log('Created indexes.');

    // 3. Seed initial data if tables are empty
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(usersCount.rows[0].count, 10) === 0) {
      console.log('Seeding initial data from db.json...');
      const dbPath = path.join(__dirname, '../data/db.json');
      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

      // Seed Users
      for (const u of dbData.users) {
        await pool.query(
          `INSERT INTO users (id, name, surname, email, username, password, role, verified, otp)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [u.id, u.name, u.surname, u.email, u.username, u.password, u.role, u.verified, u.otp || null]
        );
      }
      console.log('Seeded users.');

      // Seed Venues
      for (const t of dbData.toyxonalar) {
        const isKarnayAvail = !!t.karnaySurnay?.mavjud;
        const karnayPrice = t.karnaySurnay ? Number(t.karnaySurnay.narx.replace(/,/g, '')) : 0;
        await pool.query(
          `INSERT INTO venues (id, tuman, title, price, image, location, description, phone_number, status, capacity, owner_id, karnay_surnay_available, karnay_surnay_price, menu, currency)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [t.id, t.tuman, t.title, t.price, t.image, t.location, t.description, t.phoneNumber, t.status, t.capacity, t.ownerId || null, isKarnayAvail, karnayPrice, JSON.stringify(t.menu || null), t.currency || 'UZS']
        );

        if (t.images?.length) {
          for (const img of t.images) {
            await pool.query('INSERT INTO venue_images (venue_id, image_url) VALUES ($1, $2)', [t.id, img]);
          }
        }

        if (t.xonandalar?.length) {
          for (const s of t.xonandalar) {
            await pool.query('INSERT INTO venue_singers (venue_id, name, price, image) VALUES ($1, $2, $3, $4)', [t.id, s.ism, Number(s.narx.replace(/,/g, '')), s.rasm || null]);
          }
        }

        if (t.mashinalar?.length) {
          for (const c of t.mashinalar) {
            await pool.query('INSERT INTO venue_cars (venue_id, brand, price, image) VALUES ($1, $2, $3, $4)', [t.id, c.brand, Number(c.price.replace(/,/g, '')), c.image || null]);
          }
        }
      }
      console.log('Seeded venues.');

      // Seed Bookings
      for (const b of dbData.bookings) {
        const day = Number(b.sana);
        const dateStr = b.sana.includes('-') ? b.sana : `2026-05-${day.toString().padStart(2, '0')}`;
        await pool.query(
          `INSERT INTO bookings (id, venue_id, user_id, booking_date, guest_count, contact_name, contact_surname, contact_phone, selected_services, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [b.id, b.toyxonaId, b.user.userId || null, dateStr, b.odamSoni, b.user.ism, b.user.familiya, b.user.raqam, JSON.stringify(b.xizmatlar), b.status]
        );
      }
      console.log('Seeded bookings.');
    } else {
      console.log('Database already has data. Skipping seed.');
    }

    console.log('Database initialization completed successfully!');
  } catch (err) {
    console.error('Error during database initialization:', err);
  } finally {
    await pool.end();
  }
}

initDb();
