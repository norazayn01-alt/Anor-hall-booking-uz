import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/pg";
import "@/lib/db"; // ensure migration runs

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");

    let query = "SELECT * FROM service_providers WHERE status = 'active'";
    const params: string[] = [];
    if (category) {
      query += " AND category = $1";
      params.push(category);
    }
    query += " ORDER BY id ASC";

    const res = await pool.query(query, params);
    return NextResponse.json(res.rows.map(r => ({
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
      createdAt: r.created_at,
    })));
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, category, subCategory, description, phone, address, images, pricePerSession } = body;

    if (!name || !category || !phone) {
      return NextResponse.json({ error: "Ism, kategoriya va telefon majburiy" }, { status: 400 });
    }

    const res = await pool.query(
      `INSERT INTO service_providers (name, category, sub_category, description, phone, address, images, price_per_session)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [name, category, subCategory || null, description || null, phone, address || null,
       JSON.stringify(images || []), pricePerSession || null]
    );

    return NextResponse.json({ success: true, id: res.rows[0].id }, { status: 201 });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, category, subCategory, description, phone, address, images, pricePerSession, status } = body;

    if (!id || !name || !category || !phone) {
      return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 });
    }

    await pool.query(
      `UPDATE service_providers
       SET name=$1, category=$2, sub_category=$3, description=$4, phone=$5,
           address=$6, images=$7, price_per_session=$8, status=$9
       WHERE id=$10`,
      [name, category, subCategory || null, description || null, phone,
       address || null, JSON.stringify(images || []), pricePerSession || null,
       status || 'active', id]
    );

    return NextResponse.json({ success: true });
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

    await pool.query("DELETE FROM service_providers WHERE id=$1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
