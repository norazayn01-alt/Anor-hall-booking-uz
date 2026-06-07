import { NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM pricing_packages ORDER BY id ASC");
    return NextResponse.json(res.rows.map(r => ({
      name: r.name,
      price: r.price,
      description: r.description,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
      badge: r.badge || undefined
    })));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
