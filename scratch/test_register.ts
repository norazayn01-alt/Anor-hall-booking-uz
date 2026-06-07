import pool from '../lib/pg';
import { getDb, saveDb, hashPassword } from '../lib/db';

async function test() {
  try {
    console.log('Testing getDb...');
    const db = await getDb();
    console.log('Current users count:', db.users.length);
    
    // Simulate user creation
    const username = 'test_owner_' + Date.now();
    const email = 'test_owner_' + Date.now() + '@anor.uz';
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    const yangiUser = {
      id: db.users.length > 0 ? Math.max(...db.users.map((u: any) => u.id)) + 1 : 1,
      name: 'Test',
      surname: 'Owner',
      email,
      username,
      password: hashPassword('owner123'),
      role: 'owner' as const,
      verified: false,
      otp
    };

    console.log('Inserting user:', yangiUser);
    db.users.push(yangiUser);
    
    console.log('Saving db...');
    await saveDb(db);
    console.log('Saved successfully! OTP is:', otp);
    
    // Verify it is in database
    const res = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    console.log('Query result:', res.rows);
    
    // Clean up
    await pool.query('DELETE FROM users WHERE username = $1', [username]);
    console.log('Cleaned up successfully');
    
  } catch (error) {
    console.error('Registration test failed:', error);
  } finally {
    await pool.end();
  }
}

test();
