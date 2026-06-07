import pool from '../lib/pg';

async function checkUsers() {
  try {
    const res = await pool.query('SELECT * FROM users ORDER BY id ASC');
    console.log('Current users in PostgreSQL:', res.rows);
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkUsers();
