import pool from '../lib/pg';

async function addUniqueIndex() {
  try {
    console.log('Adding unique constraint to bookings table...');
    
    // Create a unique index on venue_id and booking_date
    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_venue_date_unique 
      ON bookings (venue_id, booking_date);
    `);
    
    console.log('Unique index idx_bookings_venue_date_unique added successfully.');
  } catch (err) {
    console.error('Error adding unique index:', err);
  } finally {
    await pool.end();
  }
}

addUniqueIndex();
