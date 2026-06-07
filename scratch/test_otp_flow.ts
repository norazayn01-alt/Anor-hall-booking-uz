import pool from '../lib/pg';
import { getDb, saveDb } from '../lib/db';

async function testOtpFlow() {
  try {
    const db = await getDb();
    console.log('Total users:', db.users.length);

    // Let's find if there are any unverified owners in the DB
    const unverifiedOwner = db.users.find(u => u.role === 'owner' && !u.verified);
    if (!unverifiedOwner) {
      console.log('No unverified owner found. Cannot test OTP verification.');
      return;
    }

    console.log('Found unverified owner:', unverifiedOwner);

    // Let's simulate verify-otp logic
    const userId = unverifiedOwner.id;
    const otp = unverifiedOwner.otp;

    console.log(`Verifying user ${userId} with OTP ${otp}...`);
    
    // Find in db
    const userIdx = db.users.findIndex(u => u.id === userId);
    if (userIdx === -1) {
      console.error('User not found in db array');
      return;
    }

    const user = db.users[userIdx];
    if (user.otp !== otp?.toString()) {
      console.error(`OTP mismatch: DB has "${user.otp}", trying to verify with "${otp}"`);
      return;
    }

    // Verify
    db.users[userIdx].verified = true;
    db.users[userIdx].otp = undefined;
    
    console.log('Saving database...');
    await saveDb(db);
    console.log('Verified successfully!');

    // Check PostgreSQL
    const res = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    console.log('PostgreSQL verification status:', res.rows[0]);

    // Restore back to unverified for the user's testing
    console.log('Restoring back to unverified...');
    db.users[userIdx].verified = false;
    db.users[userIdx].otp = otp;
    await saveDb(db);
    console.log('Restored successfully');

  } catch (error) {
    console.error('OTP test failed:', error);
  } finally {
    await pool.end();
  }
}

testOtpFlow();
