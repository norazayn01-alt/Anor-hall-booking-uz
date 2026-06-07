import { getVenues } from '../lib/db';

async function testGetVenues() {
  try {
    console.log('Fetching venues with status: undefined');
    const venues = await getVenues({});
    console.log('Result count:', venues.length);
    console.log('Venues:', venues.map(v => ({ id: v.id, title: v.title, status: v.status })));
  } catch (err) {
    console.error('Error fetching venues:', err);
  }
}

testGetVenues();
