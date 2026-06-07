import { NextRequest, NextResponse } from "next/server";
import { getUserByUsername, getUserById, saveUser, getNextUserId, hashPassword, UserType } from "@/lib/db";
import pool from "@/lib/pg";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. RO'YXATDAN O'TISH (REGISTER)
    if (action === "register") {
      const { name, surname, email, username, password, role } = body;

      if (!name || !surname || !email || !username || !password || !role) {
        return NextResponse.json({ error: "Barcha maydonlarni to'ldiring" }, { status: 400 });
      }

      // Username yoki Email bandligini tekshirish
      const checkRes = await pool.query(
        "SELECT 1 FROM users WHERE username = $1 OR email = $2 LIMIT 1",
        [username, email]
      );
      if (checkRes.rows.length > 0) {
        return NextResponse.json({ error: "Foydalanuvchi nomi yoki email band" }, { status: 400 });
      }

      // OTP yaratish (To'yxona egasi bo'lsa verifikatsiya talab etiladi)
      const otp = role === "owner" ? Math.floor(100000 + Math.random() * 900000).toString() : undefined;
      
      if (otp) {
        console.log(`[OTP Verification] User: ${username}, Email: ${email}, Code: ${otp}`);
      }

      const nextId = await getNextUserId();
      const yangiUser: UserType = {
        id: nextId,
        name,
        surname,
        email,
        username,
        password: hashPassword(password),
        role,
        verified: role !== "owner", // Foydalanuvchilar (user) avtomatik tasdiqlangan, Ownerlar verifikatsiya qilinishi kerak
        otp
      };

      await saveUser(yangiUser);

      return NextResponse.json({
        message: role === "owner" ? "Ro'yxatdan o'tdingiz. Elektron pochtangizga yuborilgan OTP kodni kiriting." : "Muvaffaqiyatli ro'yxatdan o'tdingiz",
        user: {
          id: yangiUser.id,
          name: yangiUser.name,
          surname: yangiUser.surname,
          email: yangiUser.email,
          username: yangiUser.username,
          role: yangiUser.role,
          verified: yangiUser.verified
        },
        otp: yangiUser.otp // Dev rejimida test qilish oson bo'lishi uchun qaytaramiz
      }, { status: 201 });
    }

    // 2. TIZIMGA KIRISH (LOGIN)
    if (action === "login") {
      const { username, password } = body;

      if (!username || !password) {
        return NextResponse.json({ error: "Username va parolni kiriting" }, { status: 400 });
      }

      const user = await getUserByUsername(username);
      if (!user) {
        return NextResponse.json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" }, { status: 401 });
      }

      const kiritilganHash = hashPassword(password);
      if (user.password !== kiritilganHash) {
        return NextResponse.json({ error: "Noto'g'ri foydalanuvchi nomi yoki parol" }, { status: 401 });
      }

      // Agar to'yxona egasi hali verifikatsiyadan o'tmagan bo'lsa
      if (user.role === "owner" && !user.verified) {
        // Yangi OTP yaratamiz va saqlaymiz
        const yangiOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = yangiOtp;
        console.log(`[OTP Verification] User: ${user.username}, Email: ${user.email}, Code: ${yangiOtp}`);
        await saveUser(user);

        return NextResponse.json({
          requireOtp: true,
          email: user.email,
          userId: user.id,
          otp: yangiOtp // Dev rejimida kiritish uchun qaytaramiz
        });
      }

      return NextResponse.json({
        message: "Muvaffaqiyatli kirdingiz",
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          username: user.username,
          role: user.role,
          verified: user.verified
        }
      });
    }

    // 3. OTP VERIFIKATSIYASI (VERIFY OTP)
    if (action === "verify-otp") {
      const { userId, otp } = body;

      if (!userId || !otp) {
        return NextResponse.json({ error: "Ma'lumotlar to'liq emas" }, { status: 400 });
      }

      const user = await getUserById(Number(userId));
      if (!user) {
        return NextResponse.json({ error: "Foydalanuvchi topilmadi" }, { status: 404 });
      }

      if (user.otp !== otp.toString()) {
        return NextResponse.json({ error: "Noto'g'ri OTP kod kiritildi" }, { status: 400 });
      }

      // Tasdiqlaymiz
      user.verified = true;
      user.otp = undefined; // OTPni o'chiramiz
      await saveUser(user);

      return NextResponse.json({
        message: "OTP tasdiqlandi. Akkauntingiz faollashtirildi.",
        user: {
          id: user.id,
          name: user.name,
          surname: user.surname,
          email: user.email,
          username: user.username,
          role: user.role,
          verified: true
        }
      });
    }

    return NextResponse.json({ error: "Noto'g'ri harakat" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Xatolik yuz berdi";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
