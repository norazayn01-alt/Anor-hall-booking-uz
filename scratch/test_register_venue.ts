import { saveVenue, getNextVenueId, ToyxonaType } from '../lib/db';

async function testRegisterVenue() {
  try {
    const nextId = await getNextVenueId();
    console.log('Next Venue ID:', nextId);

    const testVenue: ToyxonaType = {
      id: nextId,
      tuman: 'Bektemir',
      title: 'Shahzoda Tantasari',
      price: 4500,
      capacity: 350,
      image: 'https://sarbon-restaurant.uz/_next/image?url=%2Fhalls%2Fmain%2Fmain-2.webp&w=3840&q=75',
      images: [],
      location: 'Toshkent, Bektemir rayon',
      description: 'Hashamatli to\'yxona',
      phoneNumber: '+998901112233',
      status: 'tasdiqlanmagan',
      ownerId: 3,
      currency: 'UZS',
      menu: {
        suyuq: ['Sho\'rva'],
        quyuq: ['Palov']
      },
      xonandalar: [],
      karnaySurnay: { mavjud: false, narx: '0' },
      mashinalar: [],
      bronKunlar: []
    };

    console.log('Saving test venue...');
    await saveVenue(testVenue);
    console.log('Successfully saved venue!');
  } catch (err) {
    console.error('Error saving venue:', err);
  }
}

testRegisterVenue();
