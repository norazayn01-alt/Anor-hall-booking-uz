import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await pool.query(
      "SELECT * FROM service_providers WHERE id=$1 LIMIT 1",
      [Number(id)]
    );

    if (res.rows.length === 0) {
      return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
    }

    const r = res.rows[0];

    // Get bookings for this provider
    const bookingsRes = await pool.query(
      "SELECT booking_date, start_time, end_time FROM service_bookings WHERE provider_id=$1 AND status != 'cancelled'",
      [Number(id)]
    );

    return NextResponse.json({
      id: r.id,
      name: r.name,
      category: r.category,
      subCategory: r.sub_category,
      description: r.description,
      phone: r.phone,
      address: r.address,
      images: Array.isArray(r.images) ? r.images : (typeof r.images === 'string' ? JSON.parse(r.images) : []),
      pricePerSession: r.price_per_session,
      status: r.status,
      bookedSlots: bookingsRes.rows.map(b => ({
        date: b.booking_date,
        startTime: b.start_time,
        endTime: b.end_time,
      })),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
