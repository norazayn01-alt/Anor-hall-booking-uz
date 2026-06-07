import { NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM gallery_items ORDER BY id ASC");
    return NextResponse.json(res.rows.map(r => ({
      src: r.src,
      title: r.title
    })));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
