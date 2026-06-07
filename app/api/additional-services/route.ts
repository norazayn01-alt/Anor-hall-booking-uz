import { NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM additional_services ORDER BY id ASC");
    return NextResponse.json(res.rows.map(r => ({
      id: r.id,
      name: typeof r.name === 'string' ? JSON.parse(r.name) : r.name,
      category: r.category,
      subCategory: r.sub_category ? (typeof r.sub_category === 'string' ? JSON.parse(r.sub_category) : r.sub_category) : undefined,
      price: typeof r.price === 'string' ? JSON.parse(r.price) : r.price,
      image: r.image,
      desc: typeof r.description === 'string' ? JSON.parse(r.description) : r.description
    })));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
