"use client"; // Hooklar ishlashi uchun Next.js Client Component direktivasi

import React, { useState, useEffect, useCallback } from "react";
import { use } from "react"; // Next.js dynamic params uchun
import { useRouter } from "next/navigation";
import { BookingType } from "@/lib/db";
import { translateToyxona, DISTRICT_TRANSLATIONS, FALLBACK_MENU, FALLBACK_XONANDALAR } from "@/lib/toyxonaTranslations";
import { DISTRICTS, getDistrictSlug } from "@/lib/districts";
import { isValidPhoneNumber, formatDateStr } from "@/lib/utils";

interface ToyxonaDetailType {
  id: number;
  tuman: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  location: string;
  description: string;
  phoneNumber: string;
  capacity?: number;
  currency?: "UZS" | "USD";
  status?: string;
  menu?: {
    suyuq: string[];
    quyuq: string[];
    images?: string[];
  };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
  karnaySurnay?: { mavjud: boolean; narx: string };
  mashinalar?: Array<{ brand: string; price: string; image?: string }>;
  bronKunlar?: number[];
  singersEnabled?: boolean;
  carsEnabled?: boolean;
}

interface SinglePageProps {
  params: Promise<{ slug: string; id: string }>;
}

const translations = {
  uz: {
    loadingText: "To'yxona ma'lumotlari yuklanmoqda...",
    notFoundTitle: "To'yxona topilmadi",
    notFoundDesc: "Kiritilgan ID bo'yicha to'yxona ma'lumotlari topilmadi.",
    districtLabel: "tumani",
    descriptionTitle: "To'yxona Tavsifi",
    capacityLabel: "O'rindiq sig'imi:",
    priceLabel: "1 o'rindiq narxi:",
    peopleCount: "{count} kishi",
    som: "so'm",
    menuTitle: "Taomlar Menyusi",
    suyuqTitle: "Suyuq Taomlar",
    quyuqTitle: "Quyuq Taomlar",
    hideImages: "Rasmlarni yashirish",
    showImages: "Taomlar rasmini ko'rish",
    visualsTitle: "Taqdim etiladigan taomlarning ko'rinishi",
    extraServices: "Qo'shimcha xizmatlar",
    karnaySurnayLabel: "Karnay-surnay xizmati:",
    available: "Mavjud",
    notAvailable: "Mavjud emas",
    artistsTitle: "Taklif etiladigan san'atkorlar:",
    contactTitle: "To'yxona Egasi bilan aloqa",
    contactDesc: "Savollar yoki maxsus buyurtmalar bo'yicha bog'laning",
    calendarTitle: "Bron qilish taqvimi",
    calendarDesc: "2026-yil \"May\" oyi uchun joriy holat. Bo'sh kunni ustiga bosib bron qiling.",
    free: "Bo'sh",
    busy: "Band",
    past: "O'tgan",
    bookingDetails: "Bron tafsilotlari",
    date: "Sana",
    client: "Mijoz",
    phone: "Telefon raqam",
    guests: "Odam soni",
    additional: "Qo'shimcha",
    close: "Yopish",
    bookTitle: "Marosimni bron qilish",
    selectedDay: "Tanlangan kun",
    nameLabel: "Ismingiz *",
    surnameLabel: "Familiyangiz *",
    phoneLabel: "Telefon raqamingiz *",
    guestsCountLabel: "Mehmonlar soni:",
    extraServicesOptional: "Qo'shimcha xizmatlar (ixtiyoriy):",
    karnaySurnayOption: "Karnay-surnay",
    hallRentPrice: "Zal ijarasi",
    extraServicesPrice: "Qo'shimcha xizmatlar:",
    totalPrice: "Umumiy narx:",
    prepayLabel: "Avans (20% to'lanadi) *:",
    bookAndPay: "Bron qilish va to'lash",
    authRequiredTitle: "Tizimga kirish talab etiladi",
    authRequiredDesc: "Kalendardan foydalanib to'yxonani bron qilish uchun iltimos shaxsiy kabinetingizga kiring yoki ro'yxatdan o'ting.",
    loginRegister: "Kirish / Ro'yxatdan o'tish",
    paymentSuccess: "Muvaffaqiyatli to'landi! Avans (20%): {amount} so'm qabul qilindi.",
    paymentSuccessTitle: "To'lov Muvaffaqiyatli!",
    noBookingDetails: "Bron ma'lumotlari topilmadi",
    allContactFieldsRequired: "Barcha aloqa ma'lumotlarini kiriting"
  },
  ru: {
    loadingText: "Загрузка информации о зале...",
    notFoundTitle: "Зал не найден",
    notFoundDesc: "Информация по данному ID не найдена.",
    districtLabel: "район",
    descriptionTitle: "Описание зала",
    capacityLabel: "Вместимость мест:",
    priceLabel: "Цена за 1 место:",
    peopleCount: "{count} человек",
    som: "сум",
    menuTitle: "Меню блюд",
    suyuqTitle: "Первые блюда",
    quyuqTitle: "Вторые блюда",
    hideImages: "Скрыть фото",
    showImages: "Посмотреть фото блюд",
    visualsTitle: "Внешний вид подаваемых блюд",
    extraServices: "Дополнительные услуги",
    karnaySurnayLabel: "Услуги карнай-сурнай:",
    available: "Есть",
    notAvailable: "Нет",
    artistsTitle: "Предлагаемые артисты:",
    contactTitle: "Связь с владельцем зала",
    contactDesc: "Свяжитесь по вопросам или специальным заказам",
    calendarTitle: "Календарь бронирования",
    calendarDesc: "Текущий статус на май 2026 года. Нажмите на свободный день для бронирования.",
    free: "Свободно",
    busy: "Занято",
    past: "Прошло",
    bookingDetails: "Детали бронирования",
    date: "Дата",
    client: "Клиент",
    phone: "Номер телефона",
    guests: "Количество людей",
    additional: "Дополнительно",
    close: "Закрыть",
    bookTitle: "Забронировать мероприятие",
    selectedDay: "Выбранный день",
    nameLabel: "Имя *",
    surnameLabel: "Фамилия *",
    phoneLabel: "Номер телефона *",
    guestsCountLabel: "Количество гостей:",
    extraServicesOptional: "Дополнительные услуги (опционально):",
    karnaySurnayOption: "Карнай-сурнай",
    hallRentPrice: "Аренда зала",
    extraServicesPrice: "Дополнительные услуги:",
    totalPrice: "Общая стоимость:",
    prepayLabel: "Аванс (оплачивается 20%) *:",
    bookAndPay: "Забронировать и оплатить",
    authRequiredTitle: "Требуется авторизация",
    authRequiredDesc: "Чтобы использовать календарь для бронирования зала, пожалуйста, войдите в личный кабинет или зарегистрируйтесь.",
    loginRegister: "Войти / Зарегистрироваться",
    paymentSuccess: "Оплата прошла успешно! Принят аванс (20%): {amount} сум.",
    paymentSuccessTitle: "Оплата успешна!",
    noBookingDetails: "Информация о бронировании не найдена",
    allContactFieldsRequired: "Пожалуйста, заполните все контактные поля"
  }
};

export default function ToyxonaYakkaSahifa({ params }: SinglePageProps) {
  const { id, slug } = use(params);
  const router = useRouter();

  // DYNAMIC DATA STATE
  const [toyxona, setToyxona] = useState<ToyxonaDetailType | null>(null);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // USER ID FOR BOOKING
  const [userId, setUserId] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [lang, setLang] = useState<"uz" | "ru">("uz");

  const t = translations[lang];

  useEffect(() => {
    const handleLang = () => {
      const savedLang = localStorage.getItem("lang") as "uz" | "ru";
      if (savedLang === "uz" || savedLang === "ru") {
        setLang(savedLang);
      }
    };
    handleLang();
    window.addEventListener("languageChange", handleLang);
    return () => window.removeEventListener("languageChange", handleLang);
  }, []);


  // INTERACTIVE BOOKING STATE
  const [selectedMonth, setSelectedMonth] = useState<"june" | "july" | "august">("june");
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [odamSoni, setOdamSoni] = useState(100);
  const [customerName, setCustomerName] = useState("");
  const [customerSurname, setCustomerSurname] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedXizmatlar, setSelectedXizmatlar] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // VIEW BOOKING DETAILS MODAL STATE
  const [activeBookingDetails, setActiveBookingDetails] = useState<BookingType | null>(null);

  // CARUSEL UCHUN STATE
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMenuImages, setShowMenuImages] = useState(false);

  useEffect(() => {
    // Check logged in user
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUserId(u.id);
      setCustomerName(u.name || "");
      setCustomerSurname(u.surname || "");
    }
  }, []);

  const fetchToyxonaData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch Toyxona Details
      const res = await fetch(`/api/toyxonalar?id=${id}`);
      if (!res.ok) {
        throw new Error("To'yxona ma'lumotlarini yuklashda xatolik yuz berdi");
      }
      const data = await res.json();
      setToyxona(data);

      // 2. Fetch bookings for this toyxona to query calendar details
      const bRes = await fetch(`/api/bookings?toyxonaId=${id}`);
      const bData = await bRes.json();
      setBookings(bData);
    } catch (err) {
      const errorVal = err as Error;
      console.error(errorVal);
      setError(errorVal.message || "Xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchToyxonaData();
  }, [id, fetchToyxonaData]);

  const menuImages = [
    "/osh.jpg",
    "/chuchvara.jpg",
    "/mastava.jpg",
    "/shorva.jpg",
    "/mampar.jpg",
    "/qozon-kabob.jpg",
    "/assorti.jpg",
    "/tuxumbarak.jpg",
    "/salat.jpg",
    "/achchuchuk.jpg",
  ];


  const daysInMonth = selectedMonth === "june" ? 30 : 31;
  const kunlar = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-500 font-medium py-20 text-lg animate-pulse">
          {t.loadingText}
        </div>
      </div>
    );
  }

  if (error || !toyxona) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-white border border-dashed rounded-2xl py-16 px-4 shadow-sm max-w-md mx-auto mt-10">
          <p className="text-gray-400 font-bold text-lg mb-1">
            {t.notFoundTitle}
          </p>
          <p className="text-gray-500 text-sm">
            {error || t.notFoundDesc}
          </p>
        </div>
      </div>
    );
  }

  const translatedToyxona = translateToyxona(toyxona, lang);

  const displayedMenuImages = (translatedToyxona.menu?.images && translatedToyxona.menu.images.length > 0)
    ? translatedToyxona.menu.images
    : menuImages;

  // FALLBACKS
  const currentImages = translatedToyxona.images && translatedToyxona.images.length > 0
    ? translatedToyxona.images
    : [
        translatedToyxona.image || "https://sarbon-restaurant.uz/_next/image?url=%2Fhalls%2Fmain%2Fmain-2.webp&w=3840&q=75",
        "https://thumbs.dreamstime.com/b/luxury-banquet-hall-scene-luxurious-adorned-elegant-chandeliers-ornate-columns-floral-arrangements-creating-opulent-405088627.jpg",
        "https://avatars.mds.yandex.net/get-altay/12548008/2a0000018f1a4963f2f61c9bd236bec1e9d6/L_height",
        "https://5.imimg.com/data5/SELLER/Default/2024/11/467370693/NY/LR/GW/97164208/banquet-hall-design-ideas.jpeg",
      ];

  const currentMenu = translatedToyxona.menu || FALLBACK_MENU[lang];

  const currentXonandalar = translatedToyxona.singersEnabled ? (translatedToyxona.xonandalar || []) : [];

  const currentKarnaySurnay = translatedToyxona.karnaySurnay || { mavjud: true, narx: "2,000,000" };
  const currentCapacity = translatedToyxona.capacity || 350;
  const currentBronKunlar = translatedToyxona.bronKunlar || [];

  const currentMashinalar = translatedToyxona.carsEnabled ? (translatedToyxona.mashinalar || []) : [];

  // Price calculations
  const extraServicesTotal = selectedXizmatlar.reduce((total, serviceName) => {
    if (serviceName === "Karnay-surnay xizmati") {
      return total + Number(currentKarnaySurnay.narx.replace(/,/g, ""));
    }
    const matchingXonanda = currentXonandalar.find(x => x.ism === serviceName);
    if (matchingXonanda) {
      return total + Number(matchingXonanda.narx.replace(/,/g, ""));
    }
    const matchingMashina = currentMashinalar.find(m => m.brand === serviceName);
    if (matchingMashina) {
      return total + Number(matchingMashina.price.replace(/,/g, ""));
    }
    return total;
  }, 0);

  const mainPriceTotal = odamSoni * translatedToyxona.price;
  const grandTotal = mainPriceTotal + extraServicesTotal;
  const prepay20Percent = grandTotal * 0.2;

  // Find matching district to translate slug in UI
  const matchedDistrict = DISTRICTS.find(d => getDistrictSlug(d) === slug);
  const displayDistrict = matchedDistrict 
    ? (lang === "ru" ? DISTRICT_TRANSLATIONS[matchedDistrict]?.ru : matchedDistrict)
    : slug;

  // Calendar Click Handler
  const handleDateClick = (kun: number, isBand: boolean) => {
    if (isBand) {
      // Find booking details
      let monthPart = "06";
      if (selectedMonth === "july") monthPart = "07";
      if (selectedMonth === "august") monthPart = "08";
      const targetDateStr = `2026-${monthPart}-${kun.toString().padStart(2, '0')}`;

      const booking = bookings.find(b => {
        if (b.sana.includes('-')) return b.sana === targetDateStr;
        return `2026-05-${Number(b.sana).toString().padStart(2, '0')}` === targetDateStr;
      });

      if (booking) {
        setActiveBookingDetails(booking);
      } else {
        alert(t.noBookingDetails);
      }
    } else {
      if (!userId) {
        setShowAuthPrompt(true);
      } else {
        setSelectedDate(kun);
      }
    }
  };

  // Submit Booking
  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerSurname || !customerPhone) {
      alert(t.allContactFieldsRequired);
      return;
    }

    if (!isValidPhoneNumber(customerPhone)) {
      alert(lang === "uz" ? "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" : "Неверный формат номера телефона. Пример: +998901234567");
      return;
    }

    const bookingData = {
      toyxonaId: translatedToyxona.id,
      sana: (() => {
        let monthPart = "06";
        if (selectedMonth === "july") monthPart = "07";
        if (selectedMonth === "august") monthPart = "08";
        return `2026-${monthPart}-${selectedDate?.toString().padStart(2, '0')}`;
      })(),
      odamSoni,
      user: {
        ism: customerName,
        familiya: customerSurname,
        raqam: customerPhone,
        userId: userId
      },
      xizmatlar: selectedXizmatlar
    };

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData)
    });

    const data = await res.json();
    if (res.ok) {
      // Show payment toast
      setToastMessage(t.paymentSuccess.replace("{amount}", prepay20Percent.toLocaleString()));
      setSelectedDate(null);
      setSelectedXizmatlar([]);
      fetchToyxonaData();
      
      // Auto close toast after 5s
      setTimeout(() => setToastMessage(null), 6000);
    } else {
      alert(data.error || "Xatolik yuz berdi");
    }
  };

  const handleServiceChange = (serviceName: string) => {
    if (selectedXizmatlar.includes(serviceName)) {
      setSelectedXizmatlar(selectedXizmatlar.filter(s => s !== serviceName));
    } else {
      setSelectedXizmatlar([...selectedXizmatlar, serviceName]);
    }
  };

  return (
    <div className="pt-24 md:pt-28 px-6 pb-24 max-w-6xl mx-auto min-h-screen relative">
      {/* 20% Pre-payment Toast */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-green-900 border border-green-800 text-white p-6 rounded-2xl shadow-2xl z-50 max-w-sm animate-bounce">
          <div className="flex gap-3">
            <svg className="w-8 h-8 text-green-400 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <div>
              <h4 className="font-bold text-sm">{t.paymentSuccessTitle}</h4>
              <p className="text-xs text-green-100 mt-1">{toastMessage}</p>
            </div>
          </div>
          <button onClick={() => setToastMessage(null)} className="absolute top-2 right-2 text-white font-bold text-xs hover:text-gray-300">✕</button>
        </div>
      )}

      {/* Back Button */}
      <div className="flex justify-start mb-6">
        <button
          onClick={() => router.push(`/tumanlar/${slug}`)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-slate-650 hover:text-emerald-850 hover:bg-slate-100/80 rounded-xl border border-slate-200 bg-white transition cursor-pointer shadow-2xs"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          {lang === "uz" ? "ORQAGA QAYTISH" : "НАЗАД"}
        </button>
      </div>

      {/* 1. DINAMIK ASOSIY SARLAVHA */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-green-950 leading-tight mb-2">
          {translatedToyxona.title}
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-medium">
          {translatedToyxona.location}
        </p>
      </div>

      {/* 2. SURATLAR KARUSELI */}
      <div className="relative w-full max-w-2xl mx-auto h-96 bg-gray-900 rounded-2xl overflow-hidden shadow-lg group mb-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={currentImages[currentImageIndex]}
          alt={`${translatedToyxona.title} - ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-500 ease-in-out"
        />

        {currentImageIndex > 0 && (
          <button
            onClick={() => setCurrentImageIndex((prev) => prev - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white font-bold flex items-center justify-center hover:bg-black/70 transition backdrop-blur-sm z-10"
          >
            ‹
          </button>
        )}

        {currentImageIndex < currentImages.length - 1 && (
          <button
            onClick={() => setCurrentImageIndex((prev) => prev + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white font-bold flex items-center justify-center hover:bg-black/70 transition backdrop-blur-sm z-10"
          >
            ›
          </button>
        )}

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-sm z-10">
          {currentImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                currentImageIndex === index
                  ? "w-4 bg-green-500"
                  : "w-2 bg-white/60 hover:bg-white"
              }`}
            />
          ))}
        </div>

        <div className="absolute top-4 right-4 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
          {currentImageIndex + 1} / {currentImages.length}
        </div>
      </div>

      {/* 3. TAVSIF VA MA'LUMOTLAR BLOKI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-green-900 mb-2">
              {t.descriptionTitle}
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              {translatedToyxona.description}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
              <div className="bg-green-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">
                  {t.capacityLabel}
                </span>
                <span className="font-bold text-green-900 text-lg">
                  {t.peopleCount.replace("{count}", String(currentCapacity))}
                </span>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <span className="text-xs text-gray-500 block">
                  {t.priceLabel}
                </span>
                <span className="font-bold text-amber-800 text-lg">
                  {translatedToyxona.price.toLocaleString()} {translatedToyxona.currency === "USD" ? "$" : t.som}
                </span>
              </div>
            </div>
          </div>

          {/* TAOMLAR MENYUSI */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-green-900 mb-4 text-center">
              {t.menuTitle}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-50 hover:bg-amber-50/20">
                <h4 className="font-semibold text-amber-800 border-b pb-2 mb-2 text-center">
                  {t.suyuqTitle}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 text-center">
                  {currentMenu.suyuq.map((taom, i) => (
                    <li key={i}>{taom}</li>
                  ))}
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-gray-50 hover:bg-amber-50/20">
                <h4 className="font-semibold text-amber-800 border-b pb-2 mb-2 text-center">
                  {t.quyuqTitle}
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 text-center">
                  {currentMenu.quyuq.map((taom, i) => (
                    <li key={i}>{taom}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="flex justify-center w-full pt-5">
              <button
                onClick={() => setShowMenuImages(!showMenuImages)}
                className="text-center border border-green-700 rounded-lg h-10 w-72 bg-green-900 hover:bg-green-800 text-white font-bold transition-all shadow-sm text-sm cursor-pointer"
              >
                {showMenuImages ? t.hideImages : t.showImages}
              </button>
            </div>
          </div>

          {/* Taomlar rasmlari */}
          {showMenuImages && (
            <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-inner transition-all duration-300">
              <h4 className="text-sm font-bold text-green-900 mb-3 uppercase tracking-wider text-center">
                {t.visualsTitle}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {displayedMenuImages.map((imgUrl, index) => (
                  <div
                    key={index}
                    className="h-48 rounded-lg overflow-hidden shadow-sm border border-gray-100 group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgUrl}
                      alt={`Taom ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QO'SHIMCHA XIZMATLAR */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-xl font-bold text-green-900 mb-3">
              {t.extraServices}
            </h3>
            <div className="space-y-4 text-sm text-gray-700">
              <p>
                <strong>{t.karnaySurnayLabel}</strong>{" "}
                {currentKarnaySurnay.mavjud
                  ? `${t.available} (Narxi: ${currentKarnaySurnay.narx} ${t.som})`
                  : t.notAvailable}
              </p>
              {currentXonandalar.length > 0 && (
                <div className="pt-2">
                  <strong className="block mb-2">
                    {t.artistsTitle}
                  </strong>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {currentXonandalar.map((xonanda, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-gray-50 min-w-45 flex flex-col items-center"
                      >
                        <div className="w-12 h-12 rounded-full bg-gray-300 mb-2 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            className="w-full h-full object-cover"
                            src={(xonanda as any).rasm || "https://portal.madaniyat.uz/media/artists/i.webp"}
                            alt={xonanda.ism}
                          />
                        </div>
                        <span className="font-semibold text-xs text-center">
                          {xonanda.ism}
                        </span>
                        <span className="text-[10px] text-amber-800 font-bold mt-0.5">
                          {xonanda.narx} {t.som}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* O'ng tomon: Aloqa va Kalendar */}
        <div className="flex flex-col gap-6">
          {/* ALOQA PANELI */}
          <div className="bg-white p-6 rounded-xl shadow-sm text-center">
            <h4 className="font-bold text-gray-800 mb-2">
              {t.contactTitle}
            </h4>
            <p className="text-xs text-gray-500 mb-4">
              {t.contactDesc}
            </p>
            <a
              href={`tel:${translatedToyxona.phoneNumber}`}
              className="flex items-center justify-center gap-2 w-full bg-green-900 text-white font-bold py-3 rounded-xl hover:bg-green-800 transition shadow-sm text-sm"
            >
              <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              {translatedToyxona.phoneNumber}
            </a>
          </div>

          {/* KALENDAR */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              {t.calendarTitle}
            </h3>
            
            {/* Oylar Selector Tablari */}
            <div className="flex gap-1.5 p-1 bg-slate-100 rounded-xl mb-3 border border-slate-200/50">
              {[
                { id: "june", labelUz: "Iyun", labelRu: "Июнь" },
                { id: "july", labelUz: "Iyul", labelRu: "Июль" },
                { id: "august", labelUz: "Avgust", labelRu: "Август" }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    setSelectedMonth(m.id as any);
                    setSelectedDate(null);
                  }}
                  className={`flex-1 text-center py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    selectedMonth === m.id
                      ? "bg-green-800 text-white shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {lang === "uz" ? m.labelUz : m.labelRu}
                </button>
              ))}
            </div>

            <p className="text-[10px] text-gray-400 mb-4">
              {lang === "uz"
                ? `2026-yil "${selectedMonth === "june" ? "Iyun" : selectedMonth === "july" ? "Iyul" : "Avgust"}" oyi uchun joriy holat. Bo'sh kunni ustiga bosib bron qiling.`
                : `Текущий статус на ${selectedMonth === "june" ? "июнь" : selectedMonth === "july" ? "июль" : "август"} 2026 года. Нажмите на свободный день для бронирования.`}
            </p>

            <div className="grid grid-cols-7 gap-1.5 bg-gray-50 p-3 rounded-lg text-center">
              {kunlar.map((kun) => {
                // Bugungi kundan o'tib ketganligini hisoblash (dinamik)
                const isOtiBketgan = (() => {
                  const today = new Date();
                  const currentYear = today.getFullYear();
                  const currentMonth = today.getMonth(); // June is 5 (0-indexed)
                  const currentDay = today.getDate();

                  let targetMonthIndex = 5; // June
                  if (selectedMonth === "july") targetMonthIndex = 6;
                  if (selectedMonth === "august") targetMonthIndex = 7;

                  if (currentYear > 2026) return true;
                  if (currentYear < 2026) return false;
                  if (targetMonthIndex < currentMonth) return true;
                  if (targetMonthIndex > currentMonth) return false;
                  return kun < currentDay;
                })();

                // Band ekanligini so'rov orqali aniqlash
                const isBand = (() => {
                  let monthPart = "06";
                  if (selectedMonth === "july") monthPart = "07";
                  if (selectedMonth === "august") monthPart = "08";
                  const targetDateStr = `2026-${monthPart}-${kun.toString().padStart(2, '0')}`;

                  return bookings.some(b => {
                    if (b.sana.includes('-')) return b.sana === targetDateStr;
                    return `2026-05-${Number(b.sana).toString().padStart(2, '0')}` === targetDateStr;
                  });
                })();

                let bgClass =
                  "bg-green-800 text-green-50 border-green-800 hover:bg-green-700 cursor-pointer";
                if (isBand)
                  bgClass =
                  "bg-red-500 text-white border-red-600 hover:bg-red-600 cursor-pointer";
                if (isOtiBketgan && !isBand)
                  bgClass = "bg-gray-200 text-gray-400 cursor-not-allowed";

                return (
                  <button
                    key={kun}
                    disabled={isOtiBketgan && !isBand} // O'tgan kunlar lekin band bo'lganlarni ko'ra olishi uchun
                    onClick={() => handleDateClick(kun, isBand)}
                    className={`p-2 text-xs font-bold rounded-full border transition ${bgClass}`}
                  >
                    {kun}
                  </button>
                );
              })}
            </div>

            <div className="flex justify-around mt-4 text-[10px] text-gray-500 px-1">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-green-800 border rounded inline-block"></span>{" "}
                {t.free}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-red-500 rounded inline-block"></span>{" "}
                {t.busy}
              </div>
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-gray-200 rounded inline-block"></span>{" "}
                {t.past}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. MODAL: BRON MA'LUMOTLARINI KO'RISH */}
      {activeBookingDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl relative border border-gray-100 text-left">
            <h3 className="font-bold text-lg text-green-950 mb-4 border-b pb-2">{t.bookingDetails}</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <strong>{t.date}:</strong> {formatDateStr(activeBookingDetails.sana, lang)}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <strong>{t.client}:</strong> {activeBookingDetails.user.ism} {activeBookingDetails.user.familiya}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <strong>{t.phone}:</strong> {activeBookingDetails.user.raqam}
              </p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <strong>{t.guests}:</strong> {activeBookingDetails.odamSoni} {lang === "uz" ? "kishi" : "чел."}
              </p>
              {activeBookingDetails.xizmatlar.length > 0 && (
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                  <strong>{t.additional}:</strong> {activeBookingDetails.xizmatlar.join(", ")}
                </p>
              )}
            </div>
            <button
              onClick={() => setActiveBookingDetails(null)}
              className="mt-6 w-full py-2 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition cursor-pointer"
            >
              {t.close}
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL: BRON QILISH FORMASI */}
      {selectedDate !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 my-8 text-left">
            <h3 className="font-bold text-xl text-green-950 mb-2">{t.bookTitle}</h3>
            <p className="text-xs text-gray-400 mb-4 border-b pb-2">
              {t.selectedDay}: <strong>
                {(() => {
                  let monthPart = "06";
                  if (selectedMonth === "july") monthPart = "07";
                  if (selectedMonth === "august") monthPart = "08";
                  return formatDateStr(`2026-${monthPart}-${selectedDate?.toString().padStart(2, '0')}`, lang);
                })()}
              </strong>
            </p>
            
            <form onSubmit={handleBook} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.surnameLabel}</label>
                  <input
                    type="text"
                    required
                    value={customerSurname}
                    onChange={e => setCustomerSurname(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">{t.phoneLabel}</label>
                <input
                  type="text"
                  required
                  placeholder="+998"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">
                  {t.guestsCountLabel} <span className="text-green-900 font-bold">{odamSoni} {lang === "uz" ? "kishi" : "чел."}</span>
                </label>
                <input
                  type="range"
                  min="50"
                  max={currentCapacity}
                  step="10"
                  value={odamSoni}
                  onChange={e => setOdamSoni(Number(e.target.value))}
                  className="w-full accent-green-850 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Min: 50 {lang === "uz" ? "kishi" : "чел."}</span>
                  <span>Maks: {currentCapacity} {lang === "uz" ? "kishi" : "чел."}</span>
                </div>
              </div>

              {/* Extra Services Selector */}
              {(currentKarnaySurnay.mavjud || currentXonandalar.length > 0 || currentMashinalar.length > 0) && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-500">{t.extraServicesOptional}</label>
                  <div className="space-y-2 bg-gray-50 p-3 rounded-xl max-h-36 overflow-y-auto border border-gray-100">
                    {currentKarnaySurnay.mavjud && (
                      <label className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedXizmatlar.includes("Karnay-surnay xizmati")}
                          onChange={() => handleServiceChange("Karnay-surnay xizmati")}
                          className="accent-green-900 cursor-pointer"
                        />
                        <span>{t.karnaySurnayOption} (+{currentKarnaySurnay.narx} {t.som})</span>
                      </label>
                    )}
                    {currentXonandalar.map((xonanda, idx) => (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedXizmatlar.includes(xonanda.ism)}
                          onChange={() => handleServiceChange(xonanda.ism)}
                          className="accent-green-900 cursor-pointer"
                        />
                        <span>{xonanda.ism} (+{xonanda.narx} {t.som})</span>
                      </label>
                    ))}
                    {currentMashinalar.map((mashina, idx) => (
                      <label key={`car-${idx}`} className="flex items-center gap-2 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={selectedXizmatlar.includes(mashina.brand)}
                          onChange={() => handleServiceChange(mashina.brand)}
                          className="accent-green-900 cursor-pointer"
                        />
                        <span>{mashina.brand} (+{mashina.price} {t.som})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Calculations Output */}
              <div className="bg-green-50 p-4 rounded-xl space-y-2 text-xs border border-green-100 text-green-950">
                <div className="flex justify-between">
                  <span>{t.hallRentPrice} ({odamSoni} x {translatedToyxona.price.toLocaleString()}):</span>
                  <span>{mainPriceTotal.toLocaleString()} {translatedToyxona.currency === "USD" ? "$" : t.som}</span>
                </div>
                {extraServicesTotal > 0 && (
                  <div className="flex justify-between">
                    <span>{t.extraServicesPrice}</span>
                    <span>{extraServicesTotal.toLocaleString()} {translatedToyxona.currency === "USD" ? "$" : t.som}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-green-200/50 pt-2 font-bold text-sm text-green-950">
                  <span>{t.totalPrice.replace(":", "")}:</span>
                  <span>{grandTotal.toLocaleString()} {translatedToyxona.currency === "USD" ? "$" : t.som}</span>
                </div>
                <div className="flex justify-between text-amber-800 font-bold border-t border-dashed border-green-200/50 pt-1">
                  <span>{t.prepayLabel}</span>
                  <span>{prepay20Percent.toLocaleString()} {translatedToyxona.currency === "USD" ? "$" : t.som}</span>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition shadow-md cursor-pointer"
                >
                  {t.bookAndPay}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDate(null)}
                  className="px-4 py-3 border border-gray-200 text-gray-500 rounded-xl font-bold cursor-pointer"
                >
                  {t.close}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full shadow-2xl relative border border-gray-100 text-center">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200">
              <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="font-bold text-lg text-green-950 mb-2">{t.authRequiredTitle}</h3>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {t.authRequiredDesc}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => router.push("/account")}
                className="flex-1 py-2.5 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition shadow-md text-xs cursor-pointer"
              >
                {t.loginRegister}
              </button>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="px-4 py-2.5 border border-gray-200 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition text-xs cursor-pointer"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
