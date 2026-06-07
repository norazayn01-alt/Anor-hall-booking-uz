import pool from '../lib/pg';

async function createIndexes() {
  const queries = [
    'CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);',
    'CREATE INDEX IF NOT EXISTS idx_venues_status ON venues(status);',
    'CREATE INDEX IF NOT EXISTS idx_venues_tuman ON venues(tuman);',
    'CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON venues(owner_id);',
    'CREATE INDEX IF NOT EXISTS idx_venue_images_venue_id ON venue_images(venue_id);',
    'CREATE INDEX IF NOT EXISTS idx_venue_singers_venue_id ON venue_singers(venue_id);',
    'CREATE INDEX IF NOT EXISTS idx_venue_cars_venue_id ON venue_cars(venue_id);',
    'CREATE INDEX IF NOT EXISTS idx_bookings_venue_id ON bookings(venue_id);',
    'CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);'
  ];

  console.log('Starting index creation in PostgreSQL...');
  for (const query of queries) {
    try {
      await pool.query(query);
      console.log(`Successfully run: ${query}`);
    } catch (error) {
      console.error(`Error running query: ${query}`, error);
    }
  }
  console.log('Finished index creation.');
  await pool.end();
}

createIndexes();
