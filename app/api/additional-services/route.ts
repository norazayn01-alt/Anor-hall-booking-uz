import { NextRequest, NextResponse } from "next/server";
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nameUz, nameRu, category, subCategoryUz, subCategoryRu, priceUz, priceRu, image, descUz, descRu } = body;

    if (!nameUz || !nameRu || !category || !priceUz || !priceRu || !descUz || !descRu) {
      return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 });
    }

    const name = JSON.stringify({ uz: nameUz, ru: nameRu });
    const price = JSON.stringify({ uz: priceUz, ru: priceRu });
    const description = JSON.stringify({ uz: descUz, ru: descRu });
    const sub_category = subCategoryUz && subCategoryRu
      ? JSON.stringify({ uz: subCategoryUz, ru: subCategoryRu })
      : null;

    const res = await pool.query(
      `INSERT INTO additional_services (name, category, sub_category, price, image, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [name, category, sub_category, price, image || null, description]
    );

    return NextResponse.json({ success: true, id: res.rows[0].id });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, nameUz, nameRu, category, subCategoryUz, subCategoryRu, priceUz, priceRu, image, descUz, descRu } = body;

    if (!id || !nameUz || !nameRu || !category || !priceUz || !priceRu || !descUz || !descRu) {
      return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 });
    }

    const name = JSON.stringify({ uz: nameUz, ru: nameRu });
    const price = JSON.stringify({ uz: priceUz, ru: priceRu });
    const description = JSON.stringify({ uz: descUz, ru: descRu });
    const sub_category = subCategoryUz && subCategoryRu
      ? JSON.stringify({ uz: subCategoryUz, ru: subCategoryRu })
      : null;

    await pool.query(
      `UPDATE additional_services
       SET name=$1, category=$2, sub_category=$3, price=$4, image=$5, description=$6
       WHERE id=$7`,
      [name, category, sub_category, price, image || null, description, id]
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
    if (!id) return NextResponse.json({ error: "ID yo'q" }, { status: 400 });

    await pool.query("DELETE FROM additional_services WHERE id=$1", [Number(id)]);
    return NextResponse.json({ success: true });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
