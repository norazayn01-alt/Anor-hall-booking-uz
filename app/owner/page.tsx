"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isValidPhoneNumber, formatPhoneNumber, formatDateStr } from "@/lib/utils";

type UserType = {
  id: number;
  name: string;
  surname: string;
  role: string;
  email: string;
  username: string;
};

type ToyxonaType = {
  id: number;
  title: string;
  tuman: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  image: string;
  description: string;
  phoneNumber: string;
  ownerId: number;
  images?: string[];
  menu?: { suyuq: string[]; quyuq: string[]; images?: string[] };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
  karnaySurnay?: { mavjud: boolean; narx: string };
  mashinalar?: Array<{ brand: string; price: string; image?: string }>;
  currency?: "UZS" | "USD";
};

type BookingType = {
  id: number;
  toyxonaTitle: string;
  sana: string;
  odamSoni: number;
  status: string;
  user: { ism: string; familiya: string; raqam: string };
  xizmatlar: string[];
  grandTotal?: number;
  prepayAmount?: number;
  currency?: string;
};

const translations = {
  uz: {
    loading: "Yuklanmoqda...",
    otpTitle: "Akkauntni faollashtirish",
    otpSubtitle: "Elektron pochtangizga ({email}) yuborilgan OTP kodni kiriting.",
    otpPlaceholder: "OTP Kod (masalan: 123456)",
    testCode: "Test kodi:",
    confirmBtn: "Tasdiqlash",
    regTitle: "To'yxonangizni ro'yxatdan o'tkazing",
    regSubtitle: "Platformada to'yxonangizni ko'rsatish uchun quyidagi ma'lumotlarni to'ldiring",
    nameLabel: "To'yxona nomi *",
    tumanLabel: "Tuman (Rayon) *",
    priceLabel: "1 o'rindiq narxi *",
    som: "so'm (UZS)",
    usd: "USD ($)",
    capacityLabel: "Zal sig'imi (kishi) *",
    phoneLabel: "Telefon raqam *",
    addressLabel: "Batafsil manzil *",
    mainImageLabel: "Asosiy rasm *",
    fromComputer: "Kompyuterdan",
    fromUrl: "URL orqali",
    chooseFile: "Rasm faylini tanlang",
    urlPlaceholder: "Rasm URL manzili (https://...)",
    registerBtn: "Ro'yxatdan o'tkazish",
    ownerPanelTitle: "To'yxona Egasi kabineti",
    tabBookings: "Kelgan Bronlar",
    tabEdit: "To'yxona tahrirlash",
    tabProfile: "Mening profilim",
    logout: "Chiqish",
    bookingsTitle: "Kelgan bronlar ro'yxati",
    bookingsCount: "Jami bronlar soni:",
    ta: "ta",
    noBookings: "Sizning to'yxonangizda hozircha bronlar mavjud emas",
    thId: "Bron ID",
    thClient: "Mijoz ma'lumotlari",
    thDate: "Tadbir sanasi",
    thGuests: "Odam soni",
    thServices: "Qo'shimcha xizmatlar",
    thTotal: "Umumiy summa",
    thPrepay: "Avans (20%)",
    thStatus: "Status",
    thActions: "Amallar",
    statusPast: "o'tgan",
    statusActive: "faol",
    cancelBtn: "Bekor qilish",
    editTitle: "To'yxona ma'lumotlarini tahrirlash",
    platformStatus: "Platforma holati:",
    editPriceLabel: "Narx (1 kishi uchun) *",
    editCurrencyLabel: "Valyuta *",
    editCapacityLabel: "Maksimal sig'imi (kishi) *",
    editDescLabel: "Zal tavsifi / Haqida *",
    editMainImageLabel: "Asosiy rasm",
    editChooseFile: "Yangi rasm tanlash (yoki faylni tashlang)",
    menuTitle: "Marosim Taomlar Menyusi",
    liquidLabel: "Suyuq taomlar (vergul bilan ajrating)",
    solidLabel: "Quyuq taomlar (vergul bilan ajrating)",
    karnayCheck: "Karnay-surnay xizmati mavjud",
    karnayPriceLabel: "Karnay-surnay xizmati narxi (so'm)",
    singersTitle: "San'atkorlar (Xonandalar)",
    addNew: "+ Yangi qo'shish",
    singerNamePl: "Xonanda ismi...",
    pricePl: "Narxi...",
    imagePl: "Rasm URL (https://...)",
    deleteBtn: "O'chirish",
    carsTitle: "Kortej mashinalari",
    carBrandPl: "Mashina rusumi...",
    carPricePl: "Kunlik ijara narxi...",
    extraImagesTitle: "Qo'shimcha rasmlar (Galereya)",
    addUrlBtn: "+ URL qo'shish",
    saveDataBtn: "Ma'lumotlarni saqlash",
    profileTitle: "Shaxsiy Profil Ma'lumotlari",
    profileRoleLabel: "Rol:",
    profileRoleVal: "Hamkor / To'yxona egasi",
    usernameLabel: "Foydalanuvchi nomi",
    emailLabel: "Elektron pochta",
    projectRoleLabel: "Loyiha roli",
    projectRoleVal: "To'yxona hamkori (Owner)"
  },
  ru: {
    loading: "Загрузка...",
    otpTitle: "Активация аккаунта",
    otpSubtitle: "Введите OTP-код, отправленный на вашу электронную почту ({email}).",
    otpPlaceholder: "OTP-код (например: 123456)",
    testCode: "Тестовый код:",
    confirmBtn: "Подтвердить",
    regTitle: "Зарегистрируйте свой свадебный зал",
    regSubtitle: "Заполните форму ниже, чтобы ваш зал отображался на платформе",
    nameLabel: "Название зала *",
    tumanLabel: "Район *",
    priceLabel: "Цена за 1 место *",
    som: "сум (UZS)",
    usd: "USD ($)",
    capacityLabel: "Вместимость зала (чел.) *",
    phoneLabel: "Номер телефона *",
    addressLabel: "Точный адрес *",
    mainImageLabel: "Основное изображение *",
    fromComputer: "С компьютера",
    fromUrl: "По ссылке",
    chooseFile: "Выберите изображение",
    urlPlaceholder: "Ссылка на изображение (https://...)",
    registerBtn: "Зарегистрировать",
    ownerPanelTitle: "Кабинет владельца зала",
    tabBookings: "Полученные брони",
    tabEdit: "Редактировать зал",
    tabProfile: "Мой профиль",
    logout: "Выйти",
    bookingsTitle: "Список полученных бронирований",
    bookingsCount: "Всего броней:",
    ta: "шт",
    noBookings: "В вашем свадебном зале пока нет бронирований",
    thId: "ID Брони",
    thClient: "Информация о клиенте",
    thDate: "Дата мероприятия",
    thGuests: "Кол-во гостей",
    thServices: "Дополнительные услуги",
    thTotal: "Общая сумма",
    thPrepay: "Аванс (20%)",
    thStatus: "Статус",
    thActions: "Действия",
    statusPast: "прошедший",
    statusActive: "активен",
    cancelBtn: "Отменить",
    editTitle: "Редактирование информации о зале",
    platformStatus: "Статус на платформе:",
    editPriceLabel: "Цена (за 1 человека) *",
    editCurrencyLabel: "Валюта *",
    editCapacityLabel: "Максимальная вместимость (чел.) *",
    editDescLabel: "Описание зала / О нас *",
    editMainImageLabel: "Основное изображение",
    editChooseFile: "Выберите новое изображение (или перетащите файл)",
    menuTitle: "Меню торжеств",
    liquidLabel: "Первые блюда (через запятую)",
    solidLabel: "Вторые блюда (через запятую)",
    karnayCheck: "Услуга карнай-сурнай доступна",
    karnayPriceLabel: "Стоимость услуги карнай-сурнай (сум)",
    singersTitle: "Артисты (Певцы)",
    addNew: "+ Добавить",
    singerNamePl: "Имя певца...",
    pricePl: "Цена...",
    imagePl: "Ссылка на фото (https://...)",
    deleteBtn: "Удалить",
    carsTitle: "Свадебный кортеж",
    carBrandPl: "Марка машины...",
    carPricePl: "Стоимость аренды в день...",
    extraImagesTitle: "Дополнительные фото (Галерея)",
    addUrlBtn: "+ Добавить ссылку",
    saveDataBtn: "Сохранить данные",
    profileTitle: "Личная информация профиля",
    profileRoleLabel: "Роль:",
    profileRoleVal: "Партнер / Владелец зала",
    usernameLabel: "Имя пользователя",
    emailLabel: "Электронная почта",
    projectRoleLabel: "Роль в проекте",
    projectRoleVal: "Партнер зала (Owner)"
  }
};

function OwnerDashboardContent() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [toyxona, setToyxona] = useState<ToyxonaType | null>(null);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"bookings" | "toyxona" | "profile">("bookings");
  const [lang, setLang] = useState<"uz" | "ru">("uz");

  const t = translations[lang];

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeHint, setOtpCodeHint] = useState("");

  // Edit State
  const [editForm, setEditForm] = useState<ToyxonaType | null>(null);

  // Tab states for image uploads (file vs url)
  const [regMainImageTab, setRegMainImageTab] = useState<"file" | "url">("file");
  const [editMainImageTab, setEditMainImageTab] = useState<"file" | "url">("file");

  // Register state
  const [regToyxona, setRegToyxona] = useState({
    title: "",
    tuman: "Bektemir",
    price: "",
    capacity: "",
    location: "",
    description: "",
    phoneNumber: "",
    image: "",
    images: [] as string[],
    karnaySurnay: { mavjud: false, narx: "" },
    xonandalar: [] as Array<{ ism: string; narx: string; rasm?: string }>,
    mashinalar: [] as Array<{ brand: string; price: string; image?: string }>,
    menu: { suyuq: ["Sho'rva", "Mastava", "Chuchvara"], quyuq: ["Palov", "Somsa", "Qozon Kabob"], images: [] as string[] },
    currency: "UZS" as "UZS" | "USD"
  });

  const calculateBookingPrices = useCallback((booking: BookingType) => {
    if (booking.grandTotal && booking.prepayAmount) {
      return { grandTotal: booking.grandTotal, prepayAmount: booking.prepayAmount };
    }
    if (!toyxona) return { grandTotal: 0, prepayAmount: 0 };

    const mainPriceTotal = booking.odamSoni * toyxona.price;

    let extraServicesTotal = 0;
    if (booking.xizmatlar && booking.xizmatlar.length > 0) {
      booking.xizmatlar.forEach((serviceName) => {
        if (serviceName === "Karnay-surnay xizmati" && toyxona.karnaySurnay) {
          extraServicesTotal += Number(toyxona.karnaySurnay.narx.replace(/,/g, "")) || 0;
        }
        const matchingXonanda = toyxona.xonandalar?.find(x => x.ism === serviceName);
        if (matchingXonanda) {
          extraServicesTotal += Number(matchingXonanda.narx.replace(/,/g, "")) || 0;
        }
        const matchingMashina = toyxona.mashinalar?.find(m => m.brand === serviceName);
        if (matchingMashina) {
          extraServicesTotal += Number(matchingMashina.price.replace(/,/g, "")) || 0;
        }
      });
    }

    const grandTotal = mainPriceTotal + extraServicesTotal;
    const prepayAmount = grandTotal * 0.2; // 20% avans

    return { grandTotal, prepayAmount };
  }, [toyxona]);

  const tumanlar = ["Bektemir", "Mirobod", "Mirzo Ulug'bek", "Olmazor", "Sergeli", "Uchtepa", "Yakkasaroy", "Yangihayot", "Yashnobod", "Yunusobod", "Shayxontohur", "Chilonzor"];

  const loadData = useCallback(async (ownerId: number) => {
    setLoading(true);
    try {
      // Load Toyxona
      const res = await fetch(`/api/toyxonalar?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const t = data[0];
          const formattedT: ToyxonaType = {
            ...t,
            images: t.images || [],
            menu: {
              suyuq: t.menu?.suyuq || ["Sho'rva", "Mastava", "Chuchvara"],
              quyuq: t.menu?.quyuq || ["Palov", "Somsa", "Qozon Kabob"],
              images: t.menu?.images || []
            },
            xonandalar: t.xonandalar || [],
            karnaySurnay: t.karnaySurnay || { mavjud: false, narx: "" },
            mashinalar: t.mashinalar || []
          };
          setToyxona(formattedT);
          setEditForm(formattedT);
          // Load Bookings for this toyxona
          const bRes = await fetch(`/api/bookings?toyxonaId=${t.id}`);
          if (bRes.ok) {
            const bData = await bRes.json();
            setBookings(bData);
          }
        } else {
          setToyxona(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

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

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/account");
      return;
    }
    const parsedUser = JSON.parse(userStr) as UserType;
    if (parsedUser.role !== "owner") {
      router.replace("/account");
      return;
    }
    setUser(parsedUser);

    // Check verification status
    const checkUserFresh = async () => {
      setLoading(true);
      const res = await fetch(`/api/owners`);
      if (res.ok) {
        const owners = await res.json();
        const me = owners.find((o: any) => o.id === parsedUser.id);
        if (me && !me.verified) {
          setOtpSent(true);
          if (me.otp) {
            setOtpCodeHint(me.otp);
          }
          setLoading(false);
        } else {
          setOtpSent(false);
          loadData(parsedUser.id);
        }
      } else {
        setLoading(false);
      }
    };
    checkUserFresh();
  }, [router, loadData]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !user) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          userId: user.id,
          otp: otpCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(lang === "uz" ? "Akkauntingiz faollashtirildi!" : "Ваш аккаунт активирован!");
        setOtpSent(false);
        const updatedUser = { ...user, verified: true };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        loadData(user.id);
      } else {
        alert(data.error || (lang === "uz" ? "Kod noto'g'ri" : "Код неверный"));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regToyxona.title || !regToyxona.price || !regToyxona.capacity || !regToyxona.location || !regToyxona.phoneNumber) {
      alert(lang === "uz" ? "Majburiy maydonlarni to'ldiring" : "Заполните обязательные поля");
      return;
    }

    if (!isValidPhoneNumber(regToyxona.phoneNumber)) {
      alert(lang === "uz" ? "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" : "Неверный формат телефона. Пример: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(regToyxona.phoneNumber);

    const res = await fetch("/api/toyxonalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...regToyxona,
        phoneNumber: cleanPhone,
        ownerId: user?.id
      })
    });

    if (res.ok) {
      alert(lang === "uz" ? "To'yxona ro'yxatdan o'tkazildi! Admin tasdiqlashini kuting." : "Зал зарегистрирован! Ожидайте подтверждения администратора.");
      if (user?.id) loadData(user.id);
    } else {
      alert(lang === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка");
    }
  };

  const handleUpdateToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!isValidPhoneNumber(editForm.phoneNumber)) {
      alert(lang === "uz" ? "Telefon raqami noto'g'ri formatda. Namuna: +998901234567" : "Неверный формат телефона. Пример: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(editForm.phoneNumber);

    const res = await fetch("/api/toyxonalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        phoneNumber: cleanPhone
      })
    });

    if (res.ok) {
      alert(lang === "uz" ? "Ma'lumotlar saqlandi!" : "Данные сохранены!");
      if (user?.id) loadData(user.id);
    } else {
      alert(lang === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка");
    }
  };

  const handleCancelBooking = async (id: number) => {
    const confirmMsg = lang === "uz" ? "Ushbu bronni bekor qilmoqchimisiz?" : "Вы действительно хотите отменить бронирование?";
    const successMsg = lang === "uz" ? "Bron bekor qilindi!" : "Бронирование отменено!";
    if (!confirm(confirmMsg)) return;
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert(successMsg);
      if (toyxona) {
        const bRes = await fetch(`/api/bookings?toyxonaId=${toyxona.id}`);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookings(bData);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Rasm yuklashda xatolik");
    }

    const data = await res.json();
    return data.url;
  };

  const handleRegMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setRegToyxona(prev => ({ ...prev, image: url }));
      alert(lang === "uz" ? "Asosiy rasm yuklandi!" : "Основное изображение загружено!");
    } catch (err) {
      alert(lang === "uz" ? "Yuklashda xatolik yuz berdi" : "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const handleEditMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setEditForm({ ...editForm, image: url });
      alert(lang === "uz" ? "Asosiy rasm yuklandi!" : "Основное изображение загружено!");
    } catch (err) {
      alert(lang === "uz" ? "Yuklashda xatolik yuz berdi" : "Ошибка при загрузке");
    } finally {
      setUploading(false);
    }
  };

  const addEditImage = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, images: [...(editForm.images || []), ""] });
  };

  const changeEditImage = (index: number, val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.images || [])];
    copy[index] = val;
    setEditForm({ ...editForm, images: copy });
  };

  const removeEditImage = (index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, images: (editForm.images || []).filter((_, i) => i !== index) });
  };

  const addEditSinger = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, xonandalar: [...(editForm.xonandalar || []), { ism: "", narx: "" }] });
  };

  const changeEditSinger = (index: number, field: "ism" | "narx" | "rasm", val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.xonandalar || [])];
    copy[index] = { ...copy[index], [field]: val };
    setEditForm({ ...editForm, xonandalar: copy });
  };

  const removeEditSinger = (index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, xonandalar: (editForm.xonandalar || []).filter((_, i) => i !== index) });
  };

  const addEditCar = () => {
    if (!editForm) return;
    setEditForm({ ...editForm, mashinalar: [...(editForm.mashinalar || []), { brand: "", price: "" }] });
  };

  const changeEditCar = (index: number, field: "brand" | "price" | "image", val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.mashinalar || [])];
    copy[index] = { ...copy[index], [field]: val };
    setEditForm({ ...editForm, mashinalar: copy });
  };

  const removeEditCar = (index: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, mashinalar: (editForm.mashinalar || []).filter((_, i) => i !== index) });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-400 font-bold animate-pulse text-lg">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 pt-28 md:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {otpSent ? (
          /* OTP VERIFICATION VIEW */
          <div className="max-w-md mx-auto w-full bg-white p-8 rounded-3xl shadow-sm text-center border border-gray-150">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 select-none shadow-3xs">
              <svg className="w-8 h-8 text-emerald-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 mb-2">{t.otpTitle}</h3>
            <p className="text-xs text-gray-500 mb-6">
              {t.otpSubtitle.replace("{email}", user?.email || "")}
            </p>
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                placeholder={t.otpPlaceholder}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-white rounded-xl outline-none text-center font-bold tracking-widest text-lg focus:border-green-800"
              />
              {otpCodeHint && (
                <div className="p-3 bg-emerald-50/50 border border-emerald-100/30 rounded-xl text-center">
                  <p className="text-[10px] text-emerald-800 font-mono">
                    {t.testCode} <strong className="text-xs select-all">{otpCodeHint}</strong>
                  </p>
                </div>
              )}
              <button type="submit" className="w-full py-3 bg-green-900 text-white font-bold rounded-xl shadow-xs hover:bg-green-850 transition cursor-pointer">
                {t.confirmBtn}
              </button>
            </form>
          </div>
        ) : !toyxona ? (
          /* TOYXONA RO'YXATDAN O'TKAZISH FORM */
          <div className="bg-white p-8 rounded-3xl max-w-2xl mx-auto w-full shadow-sm border border-gray-150">
            <div className="text-center mb-8">
              <h3 className="font-extrabold text-2xl text-green-950">{t.regTitle}</h3>
              <p className="text-xs text-gray-500 mt-1">{t.regSubtitle}</p>
            </div>
            <form onSubmit={handleRegisterToyxona} className="space-y-5 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="..."
                    value={regToyxona.title}
                    onChange={e => setRegToyxona({ ...regToyxona, title: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.tumanLabel}</label>
                  <select
                    value={regToyxona.tuman}
                    onChange={e => setRegToyxona({ ...regToyxona, tuman: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800 cursor-pointer"
                  >
                    {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.priceLabel}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      required
                      placeholder="..."
                      value={regToyxona.price}
                      onChange={e => setRegToyxona({ ...regToyxona, price: e.target.value })}
                      className="flex-1 p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800"
                    />
                    <select
                      value={regToyxona.currency || "UZS"}
                      onChange={e => setRegToyxona({ ...regToyxona, currency: e.target.value as "UZS" | "USD" })}
                      className="p-3 border border-gray-200 rounded-xl outline-none bg-white font-bold text-gray-700 cursor-pointer"
                    >
                      <option value="UZS">{t.som}</option>
                      <option value="USD">{t.usd}</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.capacityLabel}</label>
                  <input
                    type="number"
                    required
                    placeholder="..."
                    value={regToyxona.capacity}
                    onChange={e => setRegToyxona({ ...regToyxona, capacity: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.phoneLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="+998..."
                    value={regToyxona.phoneNumber}
                    onChange={e => setRegToyxona({ ...regToyxona, phoneNumber: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">{t.addressLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="..."
                    value={regToyxona.location}
                    onChange={e => setRegToyxona({ ...regToyxona, location: e.target.value })}
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none bg-white focus:border-green-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">{t.mainImageLabel}</label>
                <div className="flex gap-2 mb-2 p-1 bg-slate-100/50 border border-slate-200/50 rounded-xl max-w-xs select-none">
                  <button
                    type="button"
                    onClick={() => setRegMainImageTab("file")}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regMainImageTab === "file" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    {t.fromComputer}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegMainImageTab("url")}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                      regMainImageTab === "url" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                    }`}
                  >
                    {t.fromUrl}
                  </button>
                </div>

                {regMainImageTab === "file" ? (
                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex flex-col items-center justify-center p-5 border border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl cursor-pointer bg-white transition hover:bg-slate-50">
                      <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span className="text-xs font-bold text-gray-500">{t.chooseFile}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleRegMainImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                    {regToyxona.image && (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 shrink-0">
                        <Image src={regToyxona.image} alt="Preview" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder={t.urlPlaceholder}
                    value={regToyxona.image}
                    onChange={e => setRegToyxona({ ...regToyxona, image: e.target.value })}
                    className="w-full p-3 border border-gray-200 bg-white rounded-xl outline-none focus:border-green-800"
                  />
                )}
              </div>
              <button type="submit" className="w-full py-3 bg-green-900 hover:bg-green-800 text-white font-bold rounded-xl transition shadow-md cursor-pointer mt-4">
                {t.registerBtn}
              </button>
            </form>
          </div>
        ) : (
          /* MAIN OWNER DASHBOARD WITH TABBED PANELS */
          <div>
            {/* Header and Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-gray-200 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">{t.ownerPanelTitle}</span>
                <h1 className="text-2xl font-black text-green-950 uppercase tracking-wide leading-tight mt-0.5">
                  {user?.name} {user?.surname}
                </h1>
              </div>
              
              <div className="flex flex-wrap gap-2 bg-white/60 p-1 rounded-2xl border border-gray-200/50 shadow-3xs backdrop-blur-md">
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "bookings" ? "bg-green-900 text-white shadow-xs" : "text-gray-650 hover:bg-emerald-50/50 hover:text-emerald-950"}`}
                >
                  {t.tabBookings} ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("toyxona")}
                  className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "toyxona" ? "bg-green-900 text-white shadow-xs" : "text-gray-650 hover:bg-emerald-50/50 hover:text-emerald-950"}`}
                >
                  {t.tabEdit}
                </button>
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`py-2 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${activeTab === "profile" ? "bg-green-900 text-white shadow-xs" : "text-gray-650 hover:bg-emerald-50/50 hover:text-emerald-950"}`}
                >
                  {t.tabProfile}
                </button>
                <button
                  onClick={handleLogout}
                  className="py-2 px-4 rounded-xl font-bold text-xs text-red-600 hover:bg-red-50 hover:text-red-750 transition-all cursor-pointer"
                >
                  {t.logout}
                </button>
              </div>
            </div>

            {/* TAB PANEL 1: BOOKINGS LIST (SPACIOUS TABLE) */}
            {activeTab === "bookings" && (
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-150 animate-in fade-in duration-300 text-left">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-150">
                  <h3 className="font-extrabold text-lg text-green-950">{t.bookingsTitle}</h3>
                  <span className="text-xs text-slate-400 font-semibold bg-slate-50 border border-slate-200/50 px-3 py-1 rounded-full">
                    {t.bookingsCount} {bookings.length} {t.ta}
                  </span>
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-16 text-gray-400 font-bold text-sm bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-400 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {t.noBookings}
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs font-bold text-gray-400 uppercase bg-slate-50/50">
                          <th className="p-4">{t.thId}</th>
                          <th className="p-4">{t.thClient}</th>
                          <th className="p-4">{t.thDate}</th>
                          <th className="p-4">{t.thGuests}</th>
                          <th className="p-4">{t.thServices}</th>
                          <th className="p-4">{t.thTotal}</th>
                          <th className="p-4">{t.thPrepay}</th>
                          <th className="p-4 text-center">{t.thStatus}</th>
                          <th className="p-4 text-right">{t.thActions}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((b) => {
                          const { grandTotal, prepayAmount } = calculateBookingPrices(b);
                          const currencySymbol = toyxona?.currency === "USD" ? "$" : (lang === "uz" ? "so'm" : "сум");
                          return (
                            <tr key={b.id} className="border-b border-slate-50 last:border-none hover:bg-slate-50/30">
                              <td className="p-4 font-extrabold text-green-950 text-base">#{b.id}</td>
                              <td className="p-4">
                                <div className="font-extrabold text-slate-900 text-sm">{b.user.ism} {b.user.familiya}</div>
                                <div className="text-xs text-slate-500 font-bold mt-0.5 select-all">{b.user.raqam}</div>
                              </td>
                              <td className="p-4 font-bold text-slate-800">{formatDateStr(b.sana, lang)}</td>
                              <td className="p-4 font-semibold text-slate-700">{b.odamSoni} {lang === "uz" ? "kishi" : "чел."}</td>
                              <td className="p-4 text-xs text-gray-500">
                                {b.xizmatlar && b.xizmatlar.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {b.xizmatlar.map((x, index) => (
                                      <span key={index} className="inline-block bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-200/40">
                                        {x}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  lang === "uz" ? "Mavjud emas" : "Нет"
                                )}
                              </td>
                              <td className="p-4 font-bold text-slate-800">
                                {grandTotal.toLocaleString()} {currencySymbol}
                              </td>
                              <td className="p-4 font-bold text-emerald-800 bg-emerald-50/20">
                                {prepayAmount.toLocaleString()} {currencySymbol}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                                  b.status === "bo'lib o'tgan" ? "bg-slate-50 text-slate-400 border-slate-200/50" : "bg-emerald-50 text-emerald-800 border-emerald-100"
                                }`}>
                                  {b.status === "bo'lib o'tgan" ? (lang === "uz" ? "o'tgan" : "прошедший") : (lang === "uz" ? "faol" : "активен")}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {b.status !== "bo'lib o'tgan" && (
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="text-xs font-black uppercase text-red-600 hover:text-red-800 transition px-3 py-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                  >
                                    {t.cancelBtn}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB PANEL 2: EDIT TOYXONA */}
            {activeTab === "toyxona" && editForm && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-150 animate-in fade-in duration-300 text-left">
                <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-150">
                  <h3 className="font-extrabold text-lg text-green-950">{t.editTitle}</h3>
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${
                    toyxona.status === "tasdiqlangan" ? "bg-emerald-50 text-emerald-800 border-emerald-100" : "bg-amber-50 text-amber-800 border-amber-100"
                  }`}>
                    {t.platformStatus} {toyxona.status === "tasdiqlangan" ? (lang === "uz" ? "Tasdiqlangan" : "Подтвержден") : (lang === "uz" ? "Tasdiqlanmagan" : "Не подтвержден")}
                  </span>
                </div>

                <form onSubmit={handleUpdateToyxona} className="space-y-6 text-sm">
                  {/* General Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.nameLabel}</label>
                      <input
                        type="text"
                        required
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.tumanLabel}</label>
                      <select
                        value={editForm.tuman}
                        onChange={e => setEditForm({ ...editForm, tuman: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800 cursor-pointer"
                      >
                        {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.editPriceLabel}</label>
                      <input
                        type="number"
                        required
                        value={editForm.price}
                        onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.editCurrencyLabel}</label>
                      <select
                        value={editForm.currency || "UZS"}
                        onChange={e => setEditForm({ ...editForm, currency: e.target.value as "UZS" | "USD" })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800 cursor-pointer"
                      >
                        <option value="UZS">{t.som}</option>
                        <option value="USD">{t.usd}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.editCapacityLabel}</label>
                      <input
                        type="number"
                        required
                        value={editForm.capacity}
                        onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.phoneLabel}</label>
                      <input
                        type="text"
                        required
                        value={editForm.phoneNumber}
                        onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">{t.addressLabel}</label>
                      <input
                        type="text"
                        required
                        value={editForm.location}
                        onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                        className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">{t.editDescLabel}</label>
                    <textarea
                      required
                      value={editForm.description}
                      onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none resize-none focus:border-green-800"
                      rows={4}
                    ></textarea>
                  </div>

                  {/* Image Section */}
                  <div className="border-t border-gray-100 pt-6">
                    <label className="block text-sm font-extrabold text-slate-800 mb-2">{t.editMainImageLabel}</label>
                    <div className="flex gap-2 mb-2 p-1 bg-slate-100/50 border border-slate-200/50 rounded-xl max-w-xs select-none">
                      <button
                        type="button"
                        onClick={() => setEditMainImageTab("file")}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          editMainImageTab === "file" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                        }`}
                      >
                        {t.fromComputer}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMainImageTab("url")}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                          editMainImageTab === "url" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                        }`}
                      >
                        {t.fromUrl}
                      </button>
                    </div>

                    {editMainImageTab === "file" ? (
                      <div className="flex items-center gap-3">
                        <label className="flex-1 flex flex-col items-center justify-center p-5 border border-dashed border-gray-300 hover:border-emerald-600 rounded-2xl cursor-pointer bg-white transition hover:bg-slate-50">
                          <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span className="text-xs font-bold text-gray-500">{t.editChooseFile}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleEditMainImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        {editForm.image && (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-gray-200 shrink-0">
                            <Image src={editForm.image} alt="Main" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                          </div>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder={t.urlPlaceholder}
                        value={editForm.image}
                        onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                        className="w-full p-3 border border-gray-200 bg-white rounded-xl outline-none focus:border-green-800"
                      />
                    )}
                  </div>

                  {/* Menu / Taomlar */}
                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="font-extrabold text-sm text-slate-800 mb-3">{t.menuTitle}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.liquidLabel}</label>
                        <input
                          type="text"
                          value={(editForm.menu?.suyuq || []).join(", ")}
                          onChange={e => setEditForm({
                            ...editForm,
                            menu: { suyuq: e.target.value.split(",").map(x => x.trim()), quyuq: editForm.menu?.quyuq || [], images: editForm.menu?.images || [] }
                          })}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.solidLabel}</label>
                        <input
                          type="text"
                          value={(editForm.menu?.quyuq || []).join(", ")}
                          onChange={e => setEditForm({
                            ...editForm,
                            menu: { suyuq: editForm.menu?.suyuq || [], quyuq: e.target.value.split(",").map(x => x.trim()), images: editForm.menu?.images || [] }
                          })}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Karnay Surnay */}
                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <label className="flex items-center gap-2 font-bold text-xs text-gray-650 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={!!editForm.karnaySurnay?.mavjud}
                        onChange={e => setEditForm({
                          ...editForm,
                          karnaySurnay: { mavjud: e.target.checked, narx: editForm.karnaySurnay?.narx || "" }
                        })}
                        className="accent-green-900 cursor-pointer w-4 h-4 rounded"
                      />
                      <span>{t.karnayCheck}</span>
                    </label>
                    {editForm.karnaySurnay?.mavjud && (
                      <div className="max-w-xs">
                        <label className="block text-xs font-bold text-gray-500 mb-1">{t.karnayPriceLabel}</label>
                        <input
                          type="text"
                          value={editForm.karnaySurnay.narx}
                          onChange={e => setEditForm({
                            ...editForm,
                            karnaySurnay: { mavjud: true, narx: e.target.value }
                          })}
                          className="w-full p-3 border border-gray-200 rounded-xl bg-white outline-none focus:border-green-800"
                        />
                      </div>
                    )}
                  </div>

                  {/* singers section */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-extrabold text-sm text-slate-800">{t.singersTitle}</h4>
                      <button
                        type="button"
                        onClick={addEditSinger}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
                      >
                        {t.addNew}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(editForm.xonandalar || []).map((s, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-50/50 p-3 rounded-2xl border border-gray-200/60">
                          <input
                            type="text"
                            placeholder={t.singerNamePl}
                            value={s.ism}
                            onChange={e => changeEditSinger(index, "ism", e.target.value)}
                            className="flex-2 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <input
                            type="text"
                            placeholder={t.pricePl}
                            value={s.narx}
                            onChange={e => changeEditSinger(index, "narx", e.target.value)}
                            className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <input
                            type="text"
                            placeholder={t.imagePl}
                            value={s.rasm || ""}
                            onChange={e => changeEditSinger(index, "rasm", e.target.value)}
                            className="flex-2 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditSinger(index)}
                            className="px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          >
                            {t.deleteBtn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Luxury Cars */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-extrabold text-sm text-slate-800">{t.carsTitle}</h4>
                      <button
                        type="button"
                        onClick={addEditCar}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
                      >
                        {t.addNew}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(editForm.mashinalar || []).map((c, index) => (
                        <div key={index} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center bg-slate-50/50 p-3 rounded-2xl border border-gray-200/60">
                          <input
                            type="text"
                            placeholder={t.carBrandPl}
                            value={c.brand}
                            onChange={e => changeEditCar(index, "brand", e.target.value)}
                            className="flex-2 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <input
                            type="text"
                            placeholder={t.carPricePl}
                            value={c.price}
                            onChange={e => changeEditCar(index, "price", e.target.value)}
                            className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <input
                            type="text"
                            placeholder={t.imagePl}
                            value={c.image || ""}
                            onChange={e => changeEditCar(index, "image", e.target.value)}
                            className="flex-2 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditCar(index)}
                            className="px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          >
                            {t.deleteBtn}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gallery */}
                  <div className="border-t border-gray-100 pt-6">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-extrabold text-sm text-slate-800">{t.extraImagesTitle}</h4>
                      <button
                        type="button"
                        onClick={addEditImage}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer"
                      >
                        {t.addUrlBtn}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {(editForm.images || []).map((img, index) => (
                        <div key={index} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder={t.imagePl}
                            value={img}
                            onChange={e => changeEditImage(index, e.target.value)}
                            className="flex-1 p-2.5 border border-gray-200 rounded-xl bg-white outline-none text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => removeEditImage(index)}
                            className="px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50 rounded-xl transition cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex gap-4">
                    <button type="submit" className="px-6 py-3 bg-green-900 text-white rounded-xl font-bold shadow-md hover:bg-green-800 transition cursor-pointer text-xs uppercase tracking-wider">
                      {t.saveDataBtn}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB PANEL 3: PROFILE INFO */}
            {activeTab === "profile" && (
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-150 animate-in fade-in duration-300 max-w-xl mx-auto text-left">
                <h3 className="font-extrabold text-lg text-slate-900 mb-6 pb-2 border-b border-gray-150">{t.profileTitle}</h3>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-green-900 text-white flex items-center justify-center font-black text-2xl uppercase">
                    {user?.name[0]}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-lg text-slate-900 leading-tight">{user?.name} {user?.surname}</h4>
                    <span className="inline-block text-[9px] font-black uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md mt-1 border border-emerald-100">
                      {t.profileRoleVal}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.usernameLabel}</span>
                    <span className="font-bold text-slate-800">@{user?.username}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.emailLabel}</span>
                    <span className="font-bold text-slate-800">{user?.email}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">{t.projectRoleLabel}</span>
                    <span className="font-bold text-slate-800">{t.projectRoleVal}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function OwnerPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <p className="text-gray-400 font-bold animate-pulse text-lg">Yuklanmoqda...</p>
      </div>
    }>
      <OwnerDashboardContent />
    </Suspense>
  );
}
