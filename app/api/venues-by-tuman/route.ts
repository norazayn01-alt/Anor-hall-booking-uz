import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";

// Bu endpoint faqat tumanlar/[slug] sahifasi uchun optimallashtirilgan.
// getDb() o'rniga to'g'ridan-to'g'ri bir SQL so'rov ishlatiladi — 
// faqat ToyxonaCard uchun kerakli maydonlar olinadi.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tuman = searchParams.get("tuman");
  const capacity = searchParams.get("capacity"); // "small" | "medium" | "large" | "all"

  if (!tuman) {
    return NextResponse.json({ error: "tuman parametri kerak" }, { status: 400 });
  }

  try {
    // Tumanlarni normalizatsiya qilish (slug formatidan asl formatga)
    // Masalan: "bektemir" → "Bektemir", "mirzo_ulugbek" → "Mirzo Ulug'bek"
    const normalize = (t: string) =>
      t.toLowerCase().replace(/['`’]/g, "").replace(/[\s-_]+/g, "_");

    // Bitta SQL so'rovda faqat kerakli maydonlar + tasdiqlangan status
    const result = await pool.query(
      `SELECT id, tuman, title, price, image, location, description, capacity
       FROM venues
       WHERE status = 'tasdiqlangan'
         AND (
           LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(tuman, '''', ''), '\`', ''), '’', ''), ' ', '_'), '-', '_')) = $1
           OR LOWER(tuman) = $2
         )
       ORDER BY id ASC`,
      [normalize(tuman), tuman.toLowerCase()]
    );

    let venues = result.rows;

    // Sig'im bo'yicha filtrlash (JavaScript'da — bitta so'rovdan keyin)
    if (capacity && capacity !== "all") {
      venues = venues.filter((v) => {
        const cap = Number(v.capacity) || 300;
        if (capacity === "small") return cap <= 250;
        if (capacity === "medium") return cap > 250 && cap <= 400;
        if (capacity === "large") return cap > 400;
        return true;
      });
    }

    return NextResponse.json(venues, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("venues-by-tuman error:", error);
    return NextResponse.json({ error: "Server xatoligi" }, { status: 500 });
  }
}
