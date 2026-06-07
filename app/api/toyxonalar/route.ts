import { NextRequest, NextResponse } from "next/server";
import { getVenues, saveVenue, getNextVenueId, ToyxonaType } from "@/lib/db";
import pool from "@/lib/pg";
import { translateToyxona } from "@/lib/toyxonaTranslations";
import { isValidPhoneNumber, formatPhoneNumber } from "@/lib/utils";

// GET - Toyxonalarni olish va qidirish
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idParam = searchParams.get("id");
    const tumanParam = searchParams.get("tuman");
    const searchParam = searchParams.get("search");
    const statusParam = searchParams.get("status"); // "tasdiqlangan" / "tasdiqlanmagan"
    const sortBy = searchParams.get("sortBy"); // "price" yoki "capacity"
    const order = searchParams.get("order"); // "asc" yoki "desc"
    const ownerIdParam = searchParams.get("ownerId");

    const venues = await getVenues({
      id: idParam ? Number(idParam) : undefined,
      tuman: tumanParam || undefined,
      status: statusParam || undefined,
      ownerId: ownerIdParam ? Number(ownerIdParam) : undefined,
    });

    // 1. ANIQ BITTA ID BO'YICHA OLISH
    if (idParam) {
      if (venues.length === 0) {
        return NextResponse.json(
          { error: "To'yxona topilmadi" },
          { status: 404 }
        );
      }
      return NextResponse.json(venues[0]);
    }

    let natija = [...venues];

    // 2. QIDIRISH (SEARCH)
    if (searchParam) {
      const query = searchParam.toLowerCase();
      natija = natija.filter(
        (item: ToyxonaType) => {
          const matchesUz =
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query);

          const ruTrans = translateToyxona(item, "ru");
          const matchesRu =
            ruTrans.title.toLowerCase().includes(query) ||
            ruTrans.description.toLowerCase().includes(query) ||
            ruTrans.location.toLowerCase().includes(query);

          return matchesUz || matchesRu;
        }
      );
    }

    // 3. TARTIBLASH (SORTING)
    if (sortBy === "price") {
      natija.sort((a: ToyxonaType, b: ToyxonaType) =>
        order === "desc" ? b.price - a.price : a.price - b.price
      );
    } else if (sortBy === "capacity") {
      natija.sort((a: ToyxonaType, b: ToyxonaType) =>
        order === "desc" ? b.capacity - a.capacity : a.capacity - b.capacity
      );
    }

    return NextResponse.json(natija);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Yangi to'yxona qo'shish
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nextId = await getNextVenueId();

    if (!body.phoneNumber || !isValidPhoneNumber(body.phoneNumber)) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" }, { status: 400 });
    }
    const cleanPhone = formatPhoneNumber(body.phoneNumber);

    const yangiToyxona: ToyxonaType = {
      id: nextId,
      title: body.title,
      tuman: body.tuman,
      price: Number(body.price),
      capacity: Number(body.capacity),
      image: body.image || "https://sarbon-restaurant.uz/_next/image?url=%2Fhalls%2Fmain%2Fmain-2.webp&w=3840&q=75",
      images: body.images || [],
      location: body.location,
      description: body.description || "",
      phoneNumber: cleanPhone,
      status: body.status || "tasdiqlanmagan", // Ega qo'shsa "tasdiqlanmagan", Admin qo'shsa "tasdiqlangan"
      ownerId: body.ownerId ? Number(body.ownerId) : undefined,
      currency: body.currency || "UZS",
      menu: body.menu || {
        suyuq: ["Chuchvara", "Mastava", "Sho'rva"],
        quyuq: ["To'y Palovi", "Qozon Kabob", "Vaguri"]
      },
      xonandalar: body.xonandalar || [],
      mashinalar: body.mashinalar || [],
      karnaySurnay: body.karnaySurnay || { mavjud: false, narx: "0" },
      bronKunlar: [],
      singersEnabled: body.xonandalar && body.xonandalar.length > 0 ? true : false,
      carsEnabled: body.mashinalar && body.mashinalar.length > 0 ? true : false
    };

    await saveVenue(yangiToyxona);

    return NextResponse.json(yangiToyxona, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT - To'yxonani tahrirlash (yoki tasdiqlash)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: "ID kiritilishi shart" }, { status: 400 });
    }

    const venues = await getVenues({ id: Number(id) });
    if (venues.length === 0) {
      return NextResponse.json({ error: "To'yxona topilmadi" }, { status: 404 });
    }

    if (updates.phoneNumber !== undefined) {
      if (!updates.phoneNumber || !isValidPhoneNumber(updates.phoneNumber)) {
        return NextResponse.json({ error: "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" }, { status: 400 });
      }
      updates.phoneNumber = formatPhoneNumber(updates.phoneNumber);
    }

    const currentToyxona = venues[0];
    
    let singersEnabled = currentToyxona.singersEnabled;
    if (updates.xonandalar !== undefined) {
      singersEnabled = updates.xonandalar.length > 0;
    }
    
    let carsEnabled = currentToyxona.carsEnabled;
    if (updates.mashinalar !== undefined) {
      carsEnabled = updates.mashinalar.length > 0;
    }

    const updatedToyxona: ToyxonaType = {
      ...currentToyxona,
      ...updates,
      // Narx va sig'imni son formatida saqlash
      price: updates.price !== undefined ? Number(updates.price) : currentToyxona.price,
      capacity: updates.capacity !== undefined ? Number(updates.capacity) : currentToyxona.capacity,
      ownerId: updates.ownerId !== undefined ? (updates.ownerId ? Number(updates.ownerId) : undefined) : currentToyxona.ownerId,
      singersEnabled,
      carsEnabled
    };

    await saveVenue(updatedToyxona);
    return NextResponse.json(updatedToyxona);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - To'yxonani o'chirish
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID kiritilishi shart" }, { status: 400 });
    }

    const checkRes = await pool.query("SELECT 1 FROM venues WHERE id = $1 LIMIT 1", [Number(id)]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "To'yxona topilmadi" }, { status: 404 });
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM venue_images WHERE venue_id = $1", [Number(id)]);
      await client.query("DELETE FROM venue_singers WHERE venue_id = $1", [Number(id)]);
      await client.query("DELETE FROM venue_cars WHERE venue_id = $1", [Number(id)]);
      await client.query("DELETE FROM bookings WHERE venue_id = $1", [Number(id)]);
      await client.query("DELETE FROM venues WHERE id = $1", [Number(id)]);
      await client.query("COMMIT");
    } catch (e) {
      await client.query("ROLLBACK");
      throw e;
    } finally {
      client.release();
    }

    return NextResponse.json({ message: "Muvaffaqiyatli o'chirildi" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
