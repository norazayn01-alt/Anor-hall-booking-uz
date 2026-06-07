import pool from '../lib/pg';

async function testConcurrency() {
  try {
    const venueId = 1;
    const bookingDay = 28; // will result in 2026-05-28 or similar YYYY-MM-DD
    const bookingDateStr = '2026-05-28';

    console.log('Cleaning up existing bookings for date:', bookingDateStr);
    await pool.query('DELETE FROM bookings WHERE venue_id = $1 AND booking_date = $2', [venueId, bookingDateStr]);

    console.log('Starting concurrency test...');

    const payload = {
      toyxonaId: venueId,
      sana: bookingDay.toString(),
      odamSoni: 300,
      user: {
        ism: 'Concurrency',
        familiya: 'Test',
        raqam: '+998901234567'
      },
      xizmatlar: []
    };

    // Fire two parallel POST requests to the API route
    const request1 = fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const request2 = fetch('http://localhost:3000/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Firing concurrent requests...');
    const [response1, response2] = await Promise.all([request1, request2]);

    const res1Json = await response1.json().catch(() => ({}));
    const res2Json = await response2.json().catch(() => ({}));

    console.log('Request 1 response:', response1.status, res1Json);
    console.log('Request 2 response:', response2.status, res2Json);

    if (
      (response1.status === 201 && response2.status === 400 && res2Json.error === 'Ushbu sana allaqachon bron qilingan!') ||
      (response2.status === 201 && response1.status === 400 && res1Json.error === 'Ushbu sana allaqachon bron qilingan!')
    ) {
      console.log('SUCCESS: One booking succeeded, and the duplicate concurrent booking was correctly blocked and handled!');
    } else {
      console.log('FAILURE: Concurrency handling did not behave as expected.');
    }
  } catch (err) {
    console.error('Error during concurrency test:', err);
  } finally {
    await pool.end();
  }
}

testConcurrency();
