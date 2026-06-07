import { NextRequest, NextResponse } from "next/server";
import { saveMessage, getMessages, getBookings, saveBooking } from "@/lib/db";
import { isValidPhoneNumber, formatPhoneNumber } from "@/lib/utils";

// GET - Xabarlarni olish (Admin barcha xabarlarni oladi, user esa faqat o'zinikini)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    // Agar userId bo'lsa faqat shu userning xabarlarini oladi, aks holda barcha xabarlarni
    const resMessages = await getMessages({
      userId: userId ? Number(userId) : undefined
    });

    return NextResponse.json(resMessages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Yangi xabar yozish (Aloqa sahifasidan yoki chat'dan)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, message, senderId, receiverId, isAdminMessage, subject } = body;

    if (!name || !phone || !message) {
      return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
    }

    let cleanPhone = phone;
    // Admin yozayotgan bo'lmasa telefon raqamini validatsiya qilamiz
    if (!isAdminMessage) {
      if (!isValidPhoneNumber(phone)) {
        return NextResponse.json({ error: "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" }, { status: 400 });
      }
      cleanPhone = formatPhoneNumber(phone);
    }

    const yangiXabar = {
      senderId: senderId ? Number(senderId) : null,
      receiverId: receiverId ? Number(receiverId) : null,
      name,
      phone: cleanPhone,
      message,
      isAdminMessage: !!isAdminMessage,
      subject: subject || undefined
    };

    await saveMessage(yangiXabar);

    // Agar user tizimga kirgan bo'lsa va xabar biror xizmat (subject) haqida bo'lsa
    // uni foydalanuvchining faol buyurtmasiga (endi bo'ladigan) qo'shib qo'yamiz
    if (senderId && subject && !isAdminMessage) {
      try {
        const userBookings = await getBookings({
          userId: Number(senderId),
          status: "endi bo'ladigan"
        });
        if (userBookings.length > 0) {
          const latestBooking = userBookings[userBookings.length - 1];
          if (!latestBooking.xizmatlar.includes(subject)) {
            latestBooking.xizmatlar.push(subject);
            await saveBooking(latestBooking);
          }
        }
      } catch (err) {
        console.error("Error auto-appending service to booking:", err);
      }
    }

    return NextResponse.json({ message: "Xabar muvaffaqiyatli saqlandi", data: yangiXabar }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
