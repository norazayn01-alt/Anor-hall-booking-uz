"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Logo from "./logo";
import { DISTRICTS, getDistrictSlug } from "@/lib/districts";
import type { UserType, BookingType } from "@/lib/db";
import OwnerSidebar from "./OwnerSidebar";
import { formatDateStr } from "@/lib/utils";

const AnimatedNavLink = ({ href, onClick, children }: { href: string; onClick?: React.MouseEventHandler<HTMLAnchorElement>; children: React.ReactNode }) => {
  const defaultTextColor = 'text-slate-650 hover:text-emerald-850';
  const hoverTextColor = 'text-emerald-850';
  const textSizeClass = 'text-xs font-bold uppercase tracking-widest';

  const content = (
    <div className="flex flex-col transition-transform duration-400 ease-out transform group-hover:-translate-y-1/2">
      <span className={`${defaultTextColor} leading-6 select-none`}>{children}</span>
      <span className={`${hoverTextColor} leading-6 select-none`}>{children}</span>
    </div>
  );

  if (href.startsWith('#') || onClick) {
    return (
      <a href={href} onClick={onClick} className={`group relative inline-block overflow-hidden h-6 flex items-center ${textSizeClass} cursor-pointer`}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={`group relative inline-block overflow-hidden h-6 flex items-center ${textSizeClass}`}>
      {content}
    </Link>
  );
};

const translations = {
  uz: {
    title: "Shaxsiy Kabinet",
    profile: "Mening profilim",
    bookings: "Mening bronlarim",
    language: "Til",
    client: "Mijoz (Client)",
    owner: "To'yxona egasi",
    admin: "Administrator",
    username: "Foydalanuvchi nomi",
    email: "Elektron pochta",
    phone: "Telefon raqami",
    notSpecified: "Ko'rsatilmagan",
    noBookings: "Bron qilingan zallar yo'q",
    viewHalls: "TO'YXONALARNI KO'RISH",
    active: "faol",
    past: "o'tgan",
    bookingId: "Bron",
    date: "Sana",
    district: "Tuman",
    guests: "Mehmonlar",
    cancelBooking: "Bronni bekor qilish",
    logout: "Chiqish (Logout)",
    selectLanguage: "Tilni tanlang",
    confirmCancel: "Ushbu broningizni bekor qilishni xohlaysizmi?",
    cancelSuccess: "Bron muvaffaqiyatli bekor qilindi!",
    errorOccurred: "Xatolik yuz berdi",
    tumanlar: "TUMANLAR",
    xizmatlar: "XIZMATLAR",
    boglanish: "BOG'LANISH",
    kirish: "KIRISH",
    adminPanel: "ADMIN PANEL",
    egaPanel: "EGA PANEL",
    bronlarimNavbar: "BRONLARIM",
    cart: "SAVATCHA",
    myVenue: "Mening to'yxonam",
    noVenue: "To'yxona ro'yxatdan o'tkazilmagan",
    registerVenueBtn: "RO'YXATDAN O'TKAZISH",
    capacity: "Sig'imi",
    price: "Narxi",
    venueStatus: "Status",
    adminActions: "Admin paneli boshqaruvi",
    ownerActions: "Ega paneli boshqaruvi",
    manageVenues: "To'yxonalar boshqaruvi",
    manageOwners: "To'yxona egalari",
    allBookings: "Barcha bronlar",
    addNewVenue: "+ Yangi To'yxona",
    addNewOwner: "+ Yangi Ega Qo'shish",
    venueBookings: "Kelgan bronlar",
    noVenueBookings: "Kelgan bronlar yo'q",
    verified: "Tasdiqlangan",
    unverified: "Tasdiqlanmagan",
    som: "so'm",
    kishi: "kishi"
  },
  ru: {
    title: "Личный Кабинет",
    profile: "Мой профиль",
    bookings: "Мои брони",
    language: "Язык",
    client: "Клиент",
    owner: "Владелец зала",
    admin: "Администратор",
    username: "Имя пользователя",
    email: "Электронная почта",
    phone: "Номер телефона",
    notSpecified: "Не указан",
    noBookings: "Нет забронированных залов",
    viewHalls: "ПОСМОТРЕТЬ ЗАЛЫ",
    active: "активен",
    past: "прошедший",
    bookingId: "Бронь",
    date: "Дата",
    district: "Район",
    guests: "Гости",
    cancelBooking: "Отменить бронь",
    logout: "Выйти (Logout)",
    selectLanguage: "Выберите язык",
    confirmCancel: "Вы действительно хотите отменить бронь?",
    cancelSuccess: "Бронь успешно отменена!",
    errorOccurred: "Произошла ошибка",
    tumanlar: "РАЙОНЫ",
    xizmatlar: "УСЛУГИ",
    boglanish: "КОНТАКТЫ",
    kirish: "ВОЙТИ",
    adminPanel: "АДМИН ПАНЕЛЬ",
    egaPanel: "ПАНЕЛЬ ВЛАДЕЛЬЦА",
    bronlarimNavbar: "МОИ БРОНИ",
    cart: "КОРЗИНА",
    myVenue: "Мой зал",
    noVenue: "Зал не зарегистрирован",
    registerVenueBtn: "ЗАРЕГИСТРИРОВАТЬ ЗАЛ",
    capacity: "Вместимость",
    price: "Цена",
    venueStatus: "Статус",
    adminActions: "Управление админ-панели",
    ownerActions: "Управление панелью владельца",
    manageVenues: "Управление залами",
    manageOwners: "Владельцы залов",
    allBookings: "Все брони",
    addNewVenue: "+ Новый Зал",
    addNewOwner: "+ Добавить Владельца",
    sidebarVerified: "Подтвержден",
    sidebarUnverified: "Не подтвержден",
    venueBookings: "Полученные брони",
    noVenueBookings: "Нет полученных броней",
    verified: "Подтвержден",
    unverified: "Не подтвержден",
    som: "сум",
    kishi: "чел."
  }
};

function Navbar() {
  const [open, setOpen] = useState(false); // Dropdown for districts
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [user, setUser] = useState<UserType | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "bookings" | "toyxona" | "admin_links" | "xabarlar" | null>("profile");
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [clientNewMessage, setClientNewMessage] = useState("");
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [ownerToyxona, setOwnerToyxona] = useState<any | null>(null);
  const [loadingOwnerToyxona, setLoadingOwnerToyxona] = useState(false);
  const [isOwnerSidebarOpen, setIsOwnerSidebarOpen] = useState(false);

  const t = translations[lang];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isMobileMenuOpen) {
      setHeaderShapeClass('rounded-2xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isMobileMenuOpen]);

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

  const handleLangChange = (newLang: "uz" | "ru") => {
    setLang(newLang);
    localStorage.setItem("lang", newLang);
    window.dispatchEvent(new Event("languageChange"));
  };

  const loadUserBookings = async (userId: number, role: string) => {
    setLoadingBookings(true);
    try {
      let url = `/api/bookings?userId=${userId}`;
      if (role === "owner") {
        url = `/api/bookings?ownerId=${userId}`;
      } else if (role === "admin") {
        url = `/api/bookings`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const loadOwnerToyxona = async (ownerId: number) => {
    setLoadingOwnerToyxona(true);
    try {
      const res = await fetch(`/api/toyxonalar?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          setOwnerToyxona(data[0]);
        } else {
          setOwnerToyxona(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOwnerToyxona(false);
    }
  };

  const loadUserMessages = async (userId: number) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/contact?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUserMessages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendUserMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientNewMessage.trim() || !user) return;

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${user.name} ${user.surname}`,
          phone: "+998901234567",
          message: clientNewMessage.trim(),
          senderId: user.id,
          isAdminMessage: false
        })
      });

      if (res.ok) {
        setClientNewMessage("");
        loadUserMessages(user.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (sidebarOpen && user && user.id) {
      loadUserBookings(user.id, user.role);
      if (user.role === "owner") {
        loadOwnerToyxona(user.id);
      }
      if (activeTab === "xabarlar") {
        loadUserMessages(user.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sidebarOpen, user?.id, user?.role, activeTab]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm(t.confirmCancel)) return;
    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert(t.cancelSuccess);
        if (user) loadUserBookings(user.id, user.role);
      } else {
        alert(t.errorOccurred);
      }
    } catch (err) {
      console.error(err);
      alert(t.errorOccurred);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setSidebarOpen(false);
    window.location.href = "/";
  };

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    };

    checkUser();
    
    // Listen for storage change to sync login state
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  useEffect(() => {
      const params = new URLSearchParams(window.location.search);
      if (params.get("ownerSidebar") === "true") {
        setIsOwnerSidebarOpen(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, "", newUrl);
      }
  }, []);

  return (
    <>
      <header className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50
                         flex flex-col items-center
                         px-6 md:px-8 py-2.5 md:py-3.5 backdrop-blur-md
                         ${headerShapeClass}
                         border border-slate-200 bg-white/90 shadow-md
                         w-[calc(100%-2rem)] md:w-[92%] max-w-6xl
                         transition-[border-radius] duration-0 ease-in-out`}>

        <div className="flex items-center justify-between w-full gap-x-6 md:gap-x-8">
          <div className="flex items-center md:flex-1 md:justify-start">
            <Link
              href={"/"}
              className="flex items-center gap-1 group transition-all duration-300"
            >
              <Logo />
              <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-emerald-800 to-green-700 bg-clip-text text-transparent group-hover:from-emerald-700 group-hover:to-green-600 transition-colors">
                Anor
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8 lg:space-x-10 text-sm">
            <div className="relative flex items-center h-full">
              <AnimatedNavLink href="#" onClick={(e) => { e.preventDefault(); setOpen(!open); }}>
                {t.tumanlar}
              </AnimatedNavLink>

              {/* Dropdown Menu for Districts */}
              {open && (
                <>
                  <div className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
                  <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl w-60 z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto custom-scrollbar">
                      {DISTRICTS.map((tuman) => {
                        const slug = getDistrictSlug(tuman);
                        return (
                          <Link
                            key={tuman}
                            href={`/tumanlar/${slug}`}
                            className="block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-emerald-850 hover:bg-emerald-50/50 rounded-xl transition-all duration-300 cursor-pointer text-left"
                            onClick={() => setOpen(false)}
                          >
                            {tuman}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            <AnimatedNavLink href="/xizmatlar">
              {t.xizmatlar}
            </AnimatedNavLink>

            <AnimatedNavLink href="/boglanish">
              {t.boglanish}
            </AnimatedNavLink>
          </nav>

          <div className="hidden md:flex items-center justify-end gap-4 md:flex-1">
            {/* Language switch */}
            <div className="flex bg-slate-100/85 p-0.5 rounded-full border border-slate-200/50 select-none">
              <button
                onClick={() => handleLangChange("uz")}
                className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "uz"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => handleLangChange("ru")}
                className={`px-2 py-0.5 text-[9px] font-black rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "ru"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                RU
              </button>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <div className="absolute inset-0 -m-1.5 rounded-full bg-emerald-500 opacity-20 filter blur-md pointer-events-none group-hover:opacity-40 group-hover:blur-lg transition-all duration-300"></div>
                  <button
                    onClick={() => {
                      if (user.role === "owner") {
                        window.location.href = "/owner";
                      } else if (user.role === "admin") {
                        window.location.href = "/admin";
                      } else {
                        setSidebarOpen(true);
                        setActiveTab("profile");
                      }
                    }}
                    className="relative z-10 px-4 py-1.5 text-xs font-black text-white bg-gradient-to-br from-emerald-800 to-green-700 rounded-full hover:from-emerald-700 hover:to-green-600 transition-all duration-200 cursor-pointer uppercase tracking-wider"
                  >
                    {user.name.toUpperCase()}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/account"
                  className="px-4 py-1.5 text-xs border border-slate-200 bg-slate-50/50 text-slate-700 rounded-full hover:border-slate-300 hover:bg-slate-100 transition-colors duration-200 cursor-pointer font-bold uppercase tracking-wider"
                >
                  {t.kirish}
                </Link>
              </div>
            )}
          </div>

          <button className="md:hidden flex items-center justify-center w-8 h-8 text-slate-650 focus:outline-none cursor-pointer" onClick={toggleMobileMenu} aria-label={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}>
            {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path></svg>
            ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path></svg>
            )}
          </button>
        </div>

        <div className={`md:hidden flex flex-col items-center w-full transition-all ease-in-out duration-300 overflow-hidden
                         ${isMobileMenuOpen ? 'max-h-[1000px] opacity-100 pt-4' : 'max-h-0 opacity-0 pt-0 pointer-events-none'}`}>
          <nav className="flex flex-col items-center space-y-4 text-base w-full pb-4 border-b border-slate-200">
            
            <button
              onClick={() => setOpen(!open)}
              className="text-slate-650 hover:text-slate-900 transition-colors w-full text-center font-semibold flex items-center justify-center gap-1 cursor-pointer"
            >
              {t.tumanlar}
              <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {open && (
              <div className="w-full grid grid-cols-2 gap-2 p-2 bg-slate-100/50 rounded-xl max-h-48 overflow-y-auto">
                {DISTRICTS.map((tuman) => {
                  const slug = getDistrictSlug(tuman);
                  return (
                    <Link
                      key={tuman}
                      href={`/tumanlar/${slug}`}
                      className="text-xs font-semibold text-slate-650 hover:text-emerald-850 text-center py-1.5"
                      onClick={() => { setOpen(false); setIsMobileMenuOpen(false); }}
                    >
                      {tuman}
                    </Link>
                  );
                })}
              </div>
            )}

            <Link href="/xizmatlar" className="text-slate-650 hover:text-emerald-850 transition-colors w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
              {t.xizmatlar}
            </Link>
            <Link href="/boglanish" className="text-slate-650 hover:text-emerald-850 transition-colors w-full text-center" onClick={() => setIsMobileMenuOpen(false)}>
              {t.boglanish}
            </Link>
          </nav>

          <div className="flex flex-col items-center space-y-4 mt-4 w-full">
            <div className="flex bg-slate-100/85 p-0.5 rounded-full border border-slate-200/50 select-none w-32 justify-center">
              <button
                onClick={() => handleLangChange("uz")}
                className={`flex-1 py-1 text-[10px] font-black rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "uz"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                UZ
              </button>
              <button
                onClick={() => handleLangChange("ru")}
                className={`flex-1 py-1 text-[10px] font-black rounded-full transition-all duration-200 cursor-pointer ${
                  lang === "ru"
                    ? "bg-emerald-800 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                RU
              </button>
            </div>

            {user ? (
              <div className="flex flex-col items-center gap-3 w-full">
                 <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    if (user.role === "owner") {
                      window.location.href = "/owner";
                    } else if (user.role === "admin") {
                      window.location.href = "/admin";
                    } else {
                      setSidebarOpen(true);
                      setActiveTab("profile");
                    }
                  }}
                  className="px-4 py-2 text-xs font-black text-white bg-emerald-800 rounded-full hover:bg-emerald-700 transition-all duration-200 w-full uppercase tracking-wider"
                >
                  {user.name.toUpperCase()}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 w-full">
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-2 text-xs text-center border border-slate-200 bg-slate-50/50 text-slate-700 rounded-full hover:border-slate-300 hover:bg-slate-100 transition-colors duration-200 w-full"
                >
                  {t.kirish}
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Sidebar for all authenticated users */}

      {/* Sidebar for all authenticated users */}
      {sidebarOpen && user && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 cursor-default transition-all duration-300 animate-in fade-in animate-duration-300"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar container */}
          <div className="fixed top-0 right-0 h-full w-96 bg-white/95 backdrop-blur-2xl border-l border-slate-200/50 shadow-2xl z-55 flex flex-col justify-between p-6 animate-in slide-in-from-right duration-300 ease-out text-slate-800">
            {/* Header (Title & Close Button) */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-5 shrink-0">
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-wide">
                {t.title}
              </h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-850 flex items-center justify-center transition border border-slate-100 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content area (scrollable) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar text-left">
              {/* Card 1: Mening profilim */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab(activeTab === "profile" ? null : "profile")}
                  className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                    activeTab === "profile"
                      ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                      : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-800 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span>{t.profile}</span>
                  </div>
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${activeTab === "profile" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeTab === "profile" && (
                  <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* Decorative glow */}
                    <div className="absolute -right-8 -top-8 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-emerald-800 text-white flex items-center justify-center font-extrabold text-xl shadow-inner uppercase shrink-0">
                        {user.name[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-tight">
                          {user.name} {user.surname}
                        </h3>
                        <span className="inline-block text-[9px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md mt-1.5 border border-emerald-200/50">
                          {user.role === "admin" ? t.admin : user.role === "owner" ? t.owner : t.client}
                        </span>
                      </div>
                    </div>

                    {/* Personal Information Fields */}
                    <div className="space-y-2.5 text-xs border-t border-slate-200/40 pt-4 mt-3">
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t.username}</span>
                        <span className="font-bold text-slate-800">@{user.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t.email}</span>
                        <span className="font-bold text-slate-850 select-all">{user.email}</span>
                      </div>
                      {user.role === "user" && (
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">{t.phone}</span>
                          <span className="font-bold text-slate-800">
                            {bookings.find((b) => b.user && b.user.userId === user.id)?.user?.raqam || 
                             bookings[0]?.user?.raqam || 
                             t.notSpecified}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Client Cards */}
              {user.role === "user" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab(activeTab === "bookings" ? null : "bookings")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                      activeTab === "bookings"
                        ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                        : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-850 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <span>{t.bookings}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${activeTab === "bookings" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeTab === "bookings" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      {loadingBookings ? (
                        <div className="text-center py-8 text-xs text-slate-400 font-bold animate-pulse uppercase tracking-wider">
                          ...
                        </div>
                      ) : bookings.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                          <svg className="w-8 h-8 mx-auto mb-2 text-slate-400 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          <p className="text-xs font-bold text-slate-500">{t.noBookings}</p>
                          <Link
                            href="/"
                            onClick={() => setSidebarOpen(false)}
                            className="inline-block mt-3 text-[10px] font-black uppercase text-emerald-850 hover:text-emerald-950 transition tracking-wider underline text-center w-full"
                          >
                            {t.viewHalls}
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {bookings.map((b) => (
                            <div
                              key={b.id}
                              className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between gap-3 relative overflow-hidden text-left"
                            >
                              <div className="absolute right-3 top-3">
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${b.status === "bo'lib o'tgan" ? "bg-slate-50 text-slate-400 border-slate-200/50" : "bg-emerald-50 text-emerald-800 border-emerald-100"}`}>
                                  {b.status === "bo'lib o'tgan" ? t.past : t.active}
                                </span>
                              </div>

                              <div>
                                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">
                                  {t.bookingId} #{b.id}
                                </span>
                                <h5 className="font-extrabold text-sm text-slate-900 leading-snug pr-12">
                                  {b.toyxonaTitle}
                                </h5>
                                
                                <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-semibold mt-2.5">
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.date}:</span>
                                    <span className="text-slate-800 font-bold">{formatDateStr(b.sana, lang)}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.district}:</span>
                                    <span className="text-slate-700 font-bold">{b.tuman}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.guests}:</span>
                                    <span className="text-slate-700 font-bold">{b.odamSoni} {lang === "uz" ? "kishi" : "чел."}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Umumiy summa" : "Общая сумма"}:</span>
                                    <span className="text-slate-700 font-bold">{(b.grandTotal || 0).toLocaleString()} {b.currency === "USD" ? "$" : (lang === "uz" ? "so'm" : "сум")}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Avans (20%)" : "Аванс (20%)"}:</span>
                                    <span className="text-emerald-800 font-bold bg-emerald-50/50 px-1 rounded">{(b.prepayAmount || 0).toLocaleString()} {b.currency === "USD" ? "$" : (lang === "uz" ? "so'm" : "сум")}</span>
                                  </div>
                                </div>
                              </div>

                              {b.status !== "bo'lib o'tgan" && (
                                <div className="border-t border-slate-100 pt-2 flex justify-end">
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    className="text-[10px] font-black uppercase text-red-600 hover:text-red-800 hover:bg-red-50/50 px-2 py-1 rounded-md transition-all cursor-pointer"
                                  >
                                    {t.cancelBooking}
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Card: Mening xabarlarim */}
                  <button
                    onClick={() => {
                      setActiveTab(activeTab === "xabarlar" ? null : "xabarlar");
                      if (activeTab !== "xabarlar") {
                        loadUserMessages(user.id);
                      }
                    }}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                      activeTab === "xabarlar"
                        ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                        : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-850 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                      <span>{lang === "uz" ? "Mening xabarlarim" : "Мои сообщения"}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${activeTab === "xabarlar" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeTab === "xabarlar" && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl space-y-4">
                      {loadingMessages ? (
                        <div className="text-center py-4 text-xs text-slate-400 font-bold animate-pulse">
                          ...
                        </div>
                      ) : userMessages.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">
                          {lang === "uz" ? "Sizda xabarlar yo'q" : "У вас нет сообщений"}
                        </p>
                      ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                          {userMessages.map(m => {
                            const isMe = !m.isAdminMessage;
                            return (
                              <div key={m.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs text-left ${isMe ? 'bg-emerald-800 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                                  <p>{m.message}</p>
                                </div>
                                <span className="text-[8px] text-gray-400 mt-1 uppercase">
                                  {isMe ? (lang === "uz" ? "Siz" : "Вы") : "Admin"}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <form onSubmit={handleSendUserMessage} className="pt-2 border-t border-slate-200/50 flex gap-2">
                        <input
                          type="text"
                          value={clientNewMessage}
                          onChange={e => setClientNewMessage(e.target.value)}
                          placeholder={lang === "uz" ? "Xabar yozing..." : "Напишите сообщение..."}
                          className="flex-1 p-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-green-800 text-slate-850"
                        />
                        <button
                          type="submit"
                          className="px-3 py-2 bg-green-800 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                        >
                          {lang === "uz" ? "Yuborish" : "Отправить"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* Owner Cards */}
              {user.role === "owner" && (
                <>
                  {/* Card 2: Mening to'yxonam */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab(activeTab === "toyxona" ? null : "toyxona")}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                        activeTab === "toyxona"
                          ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                          : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-850 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <span>{t.myVenue}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${activeTab === "toyxona" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeTab === "toyxona" && (
                      <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-5 relative overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
                        {loadingOwnerToyxona ? (
                          <div className="text-center py-4 text-xs text-slate-400 font-bold animate-pulse uppercase tracking-wider">
                            ...
                          </div>
                        ) : !ownerToyxona ? (
                          <div className="text-center py-4 text-xs font-bold text-slate-500">
                            <p className="mb-3">{t.noVenue}</p>
                            <button
                              onClick={() => {
                                setIsOwnerSidebarOpen(true);
                                setSidebarOpen(false);
                              }}
                              className="inline-block px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl shadow-xs transition uppercase font-black tracking-widest text-[9px] cursor-pointer"
                            >
                              {t.registerVenueBtn}
                            </button>
                          </div>
                        ) : (
                          <div className="text-left space-y-3">
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                              {ownerToyxona.title}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.venueStatus}:</span>
                              <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${ownerToyxona.status === "tasdiqlangan" ? "bg-emerald-100 text-emerald-800 border-emerald-200/50" : "bg-amber-100 text-amber-800 border-amber-200/50"}`}>
                                {ownerToyxona.status === "tasdiqlangan" ? t.verified : t.unverified}
                              </span>
                            </div>
                            <div className="space-y-1.5 text-xs border-t border-slate-200/40 pt-3 mt-2">
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.district}:</span>
                                <span className="font-bold text-slate-700">{ownerToyxona.tuman}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.capacity}:</span>
                                <span className="font-bold text-slate-750">{ownerToyxona.capacity} {t.kishi}</span>
                              </div>
                              <div className="flex justify-between">
                                 <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.price}:</span>
                                 <span className="font-bold text-slate-750">{ownerToyxona.price.toLocaleString()} {ownerToyxona.currency === "USD" ? "$" : t.som}</span>
                              </div>
                            </div>
                            <div className="pt-2 flex justify-end">
                              <button
                                onClick={() => {
                                  setIsOwnerSidebarOpen(true);
                                  setSidebarOpen(false);
                                }}
                                className="text-[10px] font-black uppercase text-emerald-800 hover:text-emerald-950 underline transition cursor-pointer"
                              >
                                {lang === "uz" ? "Tahrirlash" : "Редактировать"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card 3: Kelgan bronlar */}
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab(activeTab === "bookings" ? null : "bookings")}
                      className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                        activeTab === "bookings"
                          ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                          : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-850 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span>{t.venueBookings}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform duration-300 ${activeTab === "bookings" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {activeTab === "bookings" && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        {loadingBookings ? (
                          <div className="text-center py-8 text-xs text-slate-400 font-bold animate-pulse uppercase tracking-wider">
                            ...
                          </div>
                        ) : bookings.length === 0 ? (
                          <div className="text-center py-10 bg-slate-50/50 border border-dashed border-slate-200 rounded-2xl">
                            <svg className="w-8 h-8 mx-auto mb-2 text-slate-400 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-xs font-bold text-slate-500">{t.noVenueBookings}</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {bookings.map((b) => (
                              <div
                                key={b.id}
                                className="bg-white border border-slate-100 hover:border-slate-200 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition duration-200 flex flex-col justify-between gap-3 relative overflow-hidden text-left"
                              >
                                <div className="absolute right-3 top-3">
                                  <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${b.status === "bo'lib o'tgan" ? "bg-slate-50 text-slate-400 border-slate-200/50" : "bg-emerald-50 text-emerald-800 border-emerald-100"}`}>
                                    {b.status === "bo'lib o'tgan" ? t.past : t.active}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-[10px] font-black text-emerald-800 uppercase tracking-widest block mb-1">
                                    {t.bookingId} #{b.id}
                                  </span>
                                  <h5 className="font-extrabold text-sm text-slate-900 leading-snug pr-12">
                                    {b.toyxonaTitle}
                                  </h5>
                                  
                                  <div className="flex flex-col gap-1 text-[11px] text-slate-500 font-semibold mt-2.5">
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Mijoz" : "Клиент"}:</span>
                                      <span className="text-slate-800 font-bold">{b.user.ism} {b.user.familiya}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.phone}:</span>
                                      <span className="text-slate-700 font-bold select-all">{b.user.raqam}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.date}:</span>
                                      <span className="text-slate-700 font-bold">{formatDateStr(b.sana, lang)}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{t.guests}:</span>
                                      <span className="text-slate-700 font-bold">{b.odamSoni} {lang === "uz" ? "kishi" : "чел."}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Umumiy summa" : "Общая сумма"}:</span>
                                      <span className="text-slate-750 font-bold">{(b.grandTotal || 0).toLocaleString()} {b.currency === "USD" ? "$" : (lang === "uz" ? "so'm" : "сум")}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Avans (20%)" : "Аванс (20%)"}:</span>
                                      <span className="text-emerald-800 font-bold bg-emerald-50/50 px-1 rounded">{(b.prepayAmount || 0).toLocaleString()} {b.currency === "USD" ? "$" : (lang === "uz" ? "so'm" : "сум")}</span>
                                    </div>
                                    {b.xizmatlar && b.xizmatlar.length > 0 && (
                                      <div className="flex flex-col gap-0.5 mt-1">
                                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">{lang === "uz" ? "Qo'shimcha xizmatlar" : "Доп. услуги"}:</span>
                                        <span className="text-slate-705 font-bold">{b.xizmatlar.join(", ")}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {b.status !== "bo'lib o'tgan" && (
                                  <div className="border-t border-slate-100 pt-2 flex justify-end">
                                    <button
                                      onClick={() => handleCancelBooking(b.id)}
                                      className="text-[10px] font-black uppercase text-red-600 hover:text-red-800 hover:bg-red-50/50 px-2 py-1 rounded-md transition-all cursor-pointer"
                                    >
                                      {t.cancelBooking}
                                    </button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </>
              )}

              {/* Admin Cards */}
              {user.role === "admin" && (
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveTab(activeTab === "admin_links" ? null : "admin_links")}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border text-sm font-bold transition-all duration-305 cursor-pointer ${
                      activeTab === "admin_links"
                        ? "bg-white border-emerald-500 text-emerald-800 shadow-md scale-[1.01]"
                        : "bg-white/50 border-slate-100 text-slate-700 hover:bg-white hover:text-emerald-800 hover:border-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-850 select-none shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      <span>{t.adminActions}</span>
                    </div>
                    <svg
                      className={`w-4 h-4 transition-transform duration-300 ${activeTab === "admin_links" ? "rotate-180 text-emerald-800" : "text-slate-400"}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {activeTab === "admin_links" && (
                    <div className="bg-emerald-50/40 border border-emerald-100/50 rounded-2xl p-4 flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <Link
                        href="/admin?tab=toyxonalar"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:text-emerald-800 shadow-3xs hover:shadow-2xs transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-800 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                          {t.manageVenues}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      <Link
                        href="/admin?tab=egalar"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:text-emerald-800 shadow-3xs hover:shadow-2xs transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-800 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          {t.manageOwners}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      <Link
                        href="/admin?tab=bronlar"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl font-bold text-xs text-slate-700 hover:text-emerald-800 shadow-3xs hover:shadow-2xs transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-800 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                          {t.allBookings}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      <div className="border-t border-slate-200/40 my-1"></div>

                      <Link
                        href="/admin?tab=add_toyxona"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl font-bold text-xs text-emerald-800 hover:bg-emerald-50/50 shadow-3xs hover:shadow-2xs transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-800 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          {t.addNewVenue}
                        </span>
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>

                      <Link
                        href="/admin?tab=add_owner"
                        onClick={() => setSidebarOpen(false)}
                        className="flex items-center justify-between px-4 py-3 bg-white border border-slate-100 hover:border-slate-200 rounded-xl font-bold text-xs text-emerald-800 hover:bg-emerald-50/50 shadow-3xs hover:shadow-2xs transition-all duration-200 cursor-pointer w-full text-left"
                      >
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-emerald-800 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                          {t.addNewOwner}
                        </span>
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions (Logout) */}
            <div className="border-t border-slate-100 pt-4 mt-6 shrink-0">
              <button
                onClick={handleLogout}
                className="w-full py-3 border border-red-200 hover:bg-red-50/30 hover:border-red-300 text-red-600 hover:text-red-700 font-black uppercase tracking-wider text-xs rounded-2xl transition duration-200 shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                {t.logout}
              </button>
            </div>
          </div>
        </>
      )}
      <OwnerSidebar
        isOpen={isOwnerSidebarOpen}
        onClose={() => {
          setIsOwnerSidebarOpen(false);
          setSidebarOpen(true);
        }}
      />
    </>
  );
}

export default Navbar;
