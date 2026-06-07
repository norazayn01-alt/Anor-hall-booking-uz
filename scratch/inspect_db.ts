import pool from '../lib/pg';

async function inspectDb() {
  try {
    console.log('Inspecting bookings table schema...');
    const bookingsRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'bookings'
    `);
    console.log('Bookings columns:', bookingsRes.rows);

    console.log('Inspecting venues table schema...');
    const venuesRes = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'venues'
    `);
    console.log('Venues columns:', venuesRes.rows);

  } catch (err) {
    console.error('Error inspecting DB:', err);
  } finally {
    await pool.end();
  }
}

inspectDb();
