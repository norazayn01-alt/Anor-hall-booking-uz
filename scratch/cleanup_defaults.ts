import pool from '../lib/pg';
import fs from 'fs';
import path from 'path';

async function cleanupDefaults() {
  try {
    console.log('Starting cleanup of default singers and cars...');

    // 1. Clean up data/db.json
    const dbPath = path.join(__dirname, '../data/db.json');
    if (fs.existsSync(dbPath)) {
      const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      
      let updatedCount = 0;
      dbData.toyxonalar = dbData.toyxonalar.map((toy: any) => {
        if (toy.id !== 1) {
          if ((toy.xonandalar && toy.xonandalar.length > 0) || (toy.mashinalar && toy.mashinalar.length > 0)) {
            toy.xonandalar = [];
            toy.mashinalar = [];
            updatedCount++;
          }
        }
        return toy;
      });

      fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
      console.log(`Successfully updated db.json. Cleared defaults for ${updatedCount} venues.`);
    } else {
      console.log('db.json not found, skipping file cleanup.');
    }

    // 2. Clean up Postgres database tables
    console.log('Cleaning up database tables...');
    
    // Delete singers for all venues except venue_id = 1
    const singersRes = await pool.query('DELETE FROM venue_singers WHERE venue_id != 1');
    console.log(`Deleted ${singersRes.rowCount} singer rows from database.`);

    // Delete cars for all venues except venue_id = 1
    const carsRes = await pool.query('DELETE FROM venue_cars WHERE venue_id != 1');
    console.log(`Deleted ${carsRes.rowCount} car rows from database.`);

    console.log('Database cleanup completed successfully!');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await pool.end();
  }
}

cleanupDefaults();
