# Anor - To'yxonalar va Marosim Zallari Band Qilish Platformasi

Zamonaviy, tezkor va qulay veb-ilova bo'lib, u orqali foydalanuvchilar o'zlariga mos to'yxona va marosim zallarini topishlari, ko'zdan kechirishlari hamda onlayn tarzda band qilishlari mumkin. 

## Loyiha Haqida

Ushbu platforma Next.js (App Router) arxitekturasida yozilgan bo'lib, zamonaviy UI/UX talablariga to'liq javob beradi. Foydalanuvchilar uchun vizual qulaylik yaratish maqsadida Tailwind CSS va turli xil animatsiyalar (Framer Motion, GSAP) qilingan. Loyiha ham mijozlar, ham to'yxona egalari uchun qulay sharoitlarni o'z ichiga oladi.

## Asosiy Funksiyalar va Ularning Vazifalari

Platforma uchta asosiy foydalanuvchi turiga (Mijoz, To'yxona egasi, Admin) mo'ljallangan funksiyalarga ega:

### 1. Mijozlar (Foydalanuvchilar) uchun
- ** Aqlli Qidiruv va Filtrlar:** Foydalanuvchilar o'zlariga kerakli tuman, narx, odam soni yoki to'yxona nomiga qarab tezkor qidiruvni amalga oshirishlari mumkin. (Masalan, Yunusobod, Chilonzor kabi tumanlarga alohida sahifalar ajratilgan).
- ** To'yxona Profili:** Har bir to'yxonaning batafsil ma'lumotlari, zallari soni, xizmat turlari, maxsus menyulari va yuqori sifatli rasmlari (galereya) joylashgan.
- ** Onlayn Band Qilish (Booking):** Yoqqan to'yxonani tanlab, kerakli sanani belgilash, mehmonlar sonini kiritish va band qilish so'rovini yuborish imkoniyati (Cart va Booking tizimi).
- ** Narxlar va Paketlar:** To'yxona taqdim etadigan turli xil narx paketlari (Standart, Premium, V.I.P) bilan to'liq tanishish.

###  2. To'yxona Egalari (Owners) uchun
- ** Shaxsiy Kabinet (Dashboard):** To'yxona egasi o'zining shaxsiy profiliga ega bo'ladi (Buning uchun maxsus `OwnerSidebar` va marshrutlar yaratilgan).
- ** Zallar va Menyuni Boshqarish:** O'z to'yxonasidagi zallarni qo'shish, menyudagi ovqatlarni tahrirlash, rasmlarni yangilash va xizmatlarni o'zgartirish huquqi.
- ** Buyurtmalarni Nazorat Qilish:** Mijozlar tomonidan kelib tushgan band qilish (bron) so'rovlarini ko'rib chiqish, tasdiqlash yoki rad etish.

### 3. Tizim Administratori (Admin) uchun
- ** Umumiy Boshqaruv:** Platformadagi barcha to'yxonalarni, ularning statusini nazorat qilish va tizim xavfsizligini ta'minlash.

## Texnologiyalar (Tech Stack)

Loyihani yaratishda quyidagi zamonaviy texnologiyalardan foydalanilgan:
- **Frontend Framework:** Next.js 16 (App Router), React
- **Dizayn va Stil:** Tailwind CSS, Shadcn UI
- **Animatsiyalar:** Framer Motion, GSAP
- **Ma'lumotlar Bazasi:** PostgreSQL (lokal ishlash uchun `db.json` ham ko'zda tutilgan)
- **Dasturlash Tili:** TypeScript

## Loyihani Ishga Tushirish (Getting Started)

Loyihani o'z kompyuteringizda ishga tushirish uchun quyidagi qadamlarni bajaring:

### 1. Repozitoriyni yuklab olish (Clone)
```bash
git clone https://github.com/norazayn01-alt/Anor-hall-booking-uz.git
cd anor-booking-halls
```

### 2. Kutubxonalarni o'rnatish
```bash
npm install
# yoki
yarn install
```

### 3. Dasturlash (Development) muhitini ishga tushirish
```bash
npm run dev
# yoki
yarn dev
```

### 4. Natijani ko'rish
Brauzeringizda quyidagi manzilni oching:
 [http://localhost:3000](http://localhost:3000)

Loyiha Next.js App Router standartlariga mos holda yozilgan bo'lib, komponentlar toza va qayta ishlatiladigan (reusable) shaklda `components/` papkasiga yig'ilgan va `PascalCase` formatida nomlangan.
