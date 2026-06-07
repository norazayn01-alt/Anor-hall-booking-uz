import pool from '../lib/pg';

async function dumpDb() {
  try {
    console.log('--- BOOKINGS ---');
    const bookings = await pool.query('SELECT * FROM bookings');
    console.log(JSON.stringify(bookings.rows, null, 2));

    console.log('--- VENUES ---');
    const venues = await pool.query('SELECT id, title, owner_id FROM venues');
    console.log(JSON.stringify(venues.rows, null, 2));

    console.log('--- SINGERS ---');
    const singers = await pool.query('SELECT * FROM venue_singers');
    console.log(JSON.stringify(singers.rows, null, 2));

    console.log('--- CARS ---');
    const cars = await pool.query('SELECT * FROM venue_cars');
    console.log(JSON.stringify(cars.rows, null, 2));
  } catch (err) {
    console.error('Error dumping DB:', err);
  } finally {
    await pool.end();
  }
}

dumpDb();
