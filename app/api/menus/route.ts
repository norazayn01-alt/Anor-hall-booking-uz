import { NextResponse } from "next/server";
import pool from "@/lib/pg";

export async function GET() {
  try {
    const res = await pool.query("SELECT * FROM menu_items ORDER BY id ASC");
    const grouped: Record<string, any[]> = {};
    for (const r of res.rows) {
      if (!grouped[r.category]) {
        grouped[r.category] = [];
      }
      grouped[r.category].push({
        name: r.name,
        price: r.price,
        description: r.description
      });
    }
    const result = Object.keys(grouped).map(category => ({
      category,
      items: grouped[category]
    }));
    return NextResponse.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
