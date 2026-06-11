import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

const TIME_SLOTS = [
  { start: "09:00", end: "12:00" },
  { start: "12:00", end: "15:00" },
  { start: "15:00", end: "18:00" },
  { start: "18:00", end: "21:00" },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const providerId = searchParams.get("providerId");
    const date = searchParams.get("date");

    if (!providerId) {
      return NextResponse.json({ error: "providerId kerak" }, { status: 400 });
    }

    let query = "SELECT * FROM service_bookings WHERE provider_id=$1";
    const params: (string | number)[] = [Number(providerId)];
    if (date) {
      query += " AND booking_date=$2";
      params.push(date);
    }
    query += " ORDER BY booking_date ASC, start_time ASC";

    const res = await pool.query(query, params);
    return NextResponse.json({
      bookings: res.rows.map(r => ({
        id: r.id,
        providerId: r.provider_id,
        date: r.booking_date,
        startTime: r.start_time,
        endTime: r.end_time,
        clientName: r.client_name,
        clientPhone: r.client_phone,
        note: r.note,
        status: r.status,
        createdAt: r.created_at,
      })),
      timeSlots: TIME_SLOTS,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { providerId, date, startTime, endTime, clientName, clientPhone, note } = body;

    if (!providerId || !date || !startTime || !endTime || !clientName || !clientPhone) {
      return NextResponse.json({ error: "Barcha majburiy maydonlarni to'ldiring" }, { status: 400 });
    }

    // Check if slot is already booked
    const existing = await pool.query(
      `SELECT 1 FROM service_bookings
       WHERE provider_id=$1 AND booking_date=$2 AND start_time=$3 AND status != 'cancelled'`,
      [Number(providerId), date, startTime]
    );

    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "Bu vaqt sloti allaqachon band!" }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO service_bookings (provider_id, booking_date, start_time, end_time, client_name, client_phone, note)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [Number(providerId), date, startTime, endTime, clientName, clientPhone, note || null]
    );

    return NextResponse.json({ success: true, id: res.rows[0].id }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID kerak" }, { status: 400 });

    await pool.query("DELETE FROM service_bookings WHERE id=$1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
