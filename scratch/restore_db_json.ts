import fs from 'fs';
import path from 'path';

function restoreDbJson() {
  const dbPath = path.join(__dirname, '../data/db.json');
  if (fs.existsSync(dbPath)) {
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const defaultSingers = [
      { ism: 'Jahongir Otajonov', narx: '35,000,000' },
      { ism: 'Munisa Rizayeva', narx: '32,000,000' }
    ];

    const defaultCars = [
      { brand: 'Mercedes-Benz G-Class (Gelandewagen)', price: '3,000,000' },
      { brand: 'Rolls-Royce Ghost', price: '7,000,000' }
    ];

    let updatedCount = 0;
    dbData.toyxonalar = dbData.toyxonalar.map((toy: any) => {
      if (toy.id !== 1) {
        if (!toy.xonandalar || toy.xonandalar.length === 0) {
          toy.xonandalar = defaultSingers;
          updatedCount++;
        }
        if (!toy.mashinalar || toy.mashinalar.length === 0) {
          toy.mashinalar = defaultCars;
        }
      }
      return toy;
    });

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2), 'utf8');
    console.log(`Successfully restored db.json default values for ${updatedCount} venues.`);
  } else {
    console.log('db.json not found!');
  }
}

restoreDbJson();
