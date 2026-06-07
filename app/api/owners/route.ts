import { NextResponse } from "next/server";
import pool from "@/lib/pg";

// GET - Barcha to'yxona egalarini ko'rish (faqat Admin uchun)
export async function GET() {
  try {
    const res = await pool.query(
      "SELECT id, name, surname, email, username, verified, otp FROM users WHERE role = 'owner' ORDER BY id ASC"
    );
    return NextResponse.json(res.rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
