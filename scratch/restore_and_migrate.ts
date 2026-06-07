import pool from '../lib/pg';

async function restoreAndMigrate() {
  try {
    console.log('Starting migration and restore...');

    // 1. Add singers_enabled and cars_enabled columns to venues table
    console.log('Adding singers_enabled and cars_enabled columns...');
    await pool.query(`
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS singers_enabled BOOLEAN DEFAULT FALSE;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS cars_enabled BOOLEAN DEFAULT FALSE;
    `);

    // 2. Set enabled = true for venue ID 1
    await pool.query(`
      UPDATE venues SET singers_enabled = TRUE, cars_enabled = TRUE WHERE id = 1;
    `);
    console.log('Enabled singers and cars for venue ID 1.');

    // 3. Restore default singers and cars for all other venues (2 to 37)
    console.log('Restoring default singers and cars in database...');
    const venuesRes = await pool.query('SELECT id FROM venues WHERE id != 1');
    const venueIds = venuesRes.rows.map(r => r.id);

    const defaultSingers = [
      { name: 'Jahongir Otajonov', price: 35000000 },
      { name: 'Munisa Rizayeva', price: 32000000 }
    ];

    const defaultCars = [
      { brand: 'Mercedes-Benz G-Class (Gelandewagen)', price: 3000000 },
      { brand: 'Rolls-Royce Ghost', price: 7000000 }
    ];

    let singersRestored = 0;
    let carsRestored = 0;

    for (const id of venueIds) {
      // Check if singers already exist for this venue (to avoid duplicates)
      const singerCheck = await pool.query('SELECT 1 FROM venue_singers WHERE venue_id = $1 LIMIT 1', [id]);
      if (singerCheck.rows.length === 0) {
        for (const s of defaultSingers) {
          await pool.query(
            'INSERT INTO venue_singers (venue_id, name, price, image) VALUES ($1, $2, $3, $4)',
            [id, s.name, s.price, null]
          );
          singersRestored++;
        }
      }

      // Check if cars already exist for this venue
      const carCheck = await pool.query('SELECT 1 FROM venue_cars WHERE venue_id = $1 LIMIT 1', [id]);
      if (carCheck.rows.length === 0) {
        for (const c of defaultCars) {
          await pool.query(
            'INSERT INTO venue_cars (venue_id, brand, price, image) VALUES ($1, $2, $3, $4)',
            [id, c.brand, c.price, null]
          );
          carsRestored++;
        }
      }
    }

    console.log(`Restored ${singersRestored} singer rows and ${carsRestored} car rows.`);
    console.log('Migration and restore completed successfully!');
  } catch (err) {
    console.error('Error during migration and restore:', err);
  } finally {
    await pool.end();
  }
}

restoreAndMigrate();
