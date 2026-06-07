import { NextRequest, NextResponse } from "next/server";
import { getBookings, getVenues, saveBooking, deleteBooking, getNextBookingId, BookingType } from "@/lib/db";
import pool from "@/lib/pg";
import { isValidPhoneNumber, formatPhoneNumber } from "@/lib/utils";

// GET - Bronlarni olish (Admin, Owner va User uchun moslashuvchan)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const ownerId = searchParams.get("ownerId");
    const toyxonaId = searchParams.get("toyxonaId");
    const tuman = searchParams.get("tuman");
    const status = searchParams.get("status"); // "bo'lib o'tgan" / "endi bo'ladigan"
    const sortBy = searchParams.get("sortBy"); // "sana"
    const order = searchParams.get("order") || "asc"; // "asc" / "desc"

    const resBookings = await getBookings({
      userId: userId ? Number(userId) : undefined,
      ownerId: ownerId ? Number(ownerId) : undefined,
      toyxonaId: toyxonaId ? Number(toyxonaId) : undefined,
      tuman: tuman || undefined,
      status: status || undefined,
    });

    // SORTING (Sana bo'yicha tartiblash)
    if (sortBy === "sana") {
      resBookings.sort((a: BookingType, b: BookingType) => {
        const valA = a.sana.includes('-') ? new Date(a.sana).getTime() : Number(a.sana);
        const valB = b.sana.includes('-') ? new Date(b.sana).getTime() : Number(b.sana);
        return order === "desc" ? valB - valA : valA - valB;
      });
    }

    return NextResponse.json(resBookings);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - To'yxonani bron qilish (Foydalanuvchi uchun)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toyxonaId, sana, odamSoni, user, xizmatlar } = body;

    if (!toyxonaId || !sana || !odamSoni || !user || !user.ism || !user.familiya || !user.raqam) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    if (!isValidPhoneNumber(user.raqam)) {
      return NextResponse.json({ error: "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" }, { status: 400 });
    }
    const cleanPhone = formatPhoneNumber(user.raqam);

    // To'yxonani tekshiramiz
    const venues = await getVenues({ id: Number(toyxonaId) });
    if (venues.length === 0) {
      return NextResponse.json({ error: "To'yxona topilmadi" }, { status: 404 });
    }

    const toyxona = venues[0];

    // Kun bandligini tekshiramiz
    const kun = Number(sana);
    if (toyxona.bronKunlar && toyxona.bronKunlar.includes(kun)) {
      return NextResponse.json({ error: "Ushbu sana allaqachon bron qilingan!" }, { status: 400 });
    }

    // Yangi bron yaratamiz
    const nextId = await getNextBookingId();
    const yangiBron: BookingType = {
      id: nextId,
      toyxonaId: Number(toyxonaId),
      toyxonaTitle: toyxona.title,
      tuman: toyxona.tuman,
      sana: sana.toString(),
      odamSoni: Number(odamSoni),
      user: {
        ism: user.ism,
        familiya: user.familiya,
        raqam: cleanPhone,
        userId: user.userId ? Number(user.userId) : undefined
      },
      xizmatlar: xizmatlar || [],
      status: "endi bo'ladigan"
    };

    await saveBooking(yangiBron);

    return NextResponse.json({
      message: "Muvaffaqiyatli bron qilindi. Avans (20%) to'lovi simulyatsiya qilindi.",
      booking: yangiBron
    }, { status: 201 });
  } catch (error: any) {
    if (error && error.code === "23505") {
      return NextResponse.json({ error: "Ushbu sana allaqachon bron qilingan!" }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Bronni bekor qilish
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Bron ID kiritilishi shart" }, { status: 400 });
    }

    // Bronni topamiz
    const checkRes = await pool.query("SELECT 1 FROM bookings WHERE id = $1 LIMIT 1", [Number(id)]);
    if (checkRes.rows.length === 0) {
      return NextResponse.json({ error: "Bron topilmadi" }, { status: 404 });
    }

    // Bronni o'chiramiz
    await deleteBooking(Number(id));

    return NextResponse.json({ message: "Bron muvaffaqiyatli bekor qilindi" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
