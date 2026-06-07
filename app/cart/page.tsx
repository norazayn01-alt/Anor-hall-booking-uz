"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatDateStr } from "@/lib/utils";

type CartUser = { id: number; name: string; surname: string; role: string };

type CartBooking = {
  id: number;
  toyxonaTitle: string;
  tuman: string;
  sana: string;
  odamSoni: number;
  status: string;
  xizmatlar: string[];
  grandTotal?: number;
  prepayAmount?: number;
  currency?: string;
};

const translations = {
  uz: {
    title: "Sizning Bronlaringiz",
    subtitle: "O'zingiz tanlagan va avans to'lovi qilingan to'yxonalar ro'yxati va holati",
    filterDistrict: "Rayon bo'yicha",
    filterStatus: "Status bo'yicha",
    sortTitle: "Tartiblash",
    sortOrder: "Tartib",
    all: "Barchasi",
    past: "bo'lib o'tgan",
    active: "endi bo'ladigan",
    statusPastLabel: "bo'lib o'tgan",
    statusActiveLabel: "endi bo'ladigan",
    sortSana: "Sana bo'yicha",
    sortAsc: "Eski sanalardan (asc)",
    sortDesc: "Yangi sanalardan (desc)",
    noBookingsTitle: "Bronlar topilmadi",
    noBookingsTextFiltered: "Tanlangan filtrlarga mos keladigan bronlar mavjud emas.",
    noBookingsTextAll: "Hozircha siz hech qanday to'yxonani bron qilmadingiz.",
    clearFilters: "Filtrlarni tozalash",
    viewHalls: "Zallarni ko'rish",
    loading: "Yuklanmoqda...",
    notLoggedInTitle: "Tizimga kirmagansiz",
    notLoggedInText: "O'zingiz tanlagan va bron qilgan to'yxonalarni ko'rish uchun avval kabinetingizga kiring.",
    loginBtn: "Kirish sahifasiga o'tish",
    table: {
      id: "Bron ID",
      venue: "To'yxona",
      district: "Rayon",
      date: "Sana",
      guests: "Odam soni",
      services: "Qo'shimcha xizmatlar",
      total: "Umumiy summa",
      prepay: "Avans (20%)",
      status: "Status",
      actions: "Amallar",
    },
    cancelConfirm: "Ushbu broningizni bekor qilishni xohlaysizmi?",
    cancelSuccess: "Bron muvaffaqiyatli bekor qilindi!",
    errorOccurred: "Xatolik yuz berdi",
    kishi: "kishi",
    none: "Mavjud emas",
    cancelBtn: "Bekor qilish",
    som: "so'm",
    usd: "$"
  },
  ru: {
    title: "Ваши Бронирования",
    subtitle: "Список и статус выбранных и частично оплаченных свадебных залов",
    filterDistrict: "По району",
    filterStatus: "По статусу",
    sortTitle: "Сортировка",
    sortOrder: "Порядок",
    all: "Все",
    past: "bo'lib o'tgan", // status in db is in uzbek
    active: "endi bo'ladigan", // status in db is in uzbek
    statusPastLabel: "прошедшие",
    statusActiveLabel: "предстоящие",
    sortSana: "По дате",
    sortAsc: "От старых дат (asc)",
    sortDesc: "От новых дат (desc)",
    noBookingsTitle: "Бронирования не найдены",
    noBookingsTextFiltered: "Бронирования, соответствующие выбранным фильтрам, не найдены.",
    noBookingsTextAll: "Вы еще не забронировали ни одного зала.",
    clearFilters: "Очистить фильтры",
    viewHalls: "Посмотреть залы",
    loading: "Загрузка...",
    notLoggedInTitle: "Вы не вошли в систему",
    notLoggedInText: "Чтобы просмотреть выбранные и забронированные залы, сначала войдите в свой личный кабинет.",
    loginBtn: "Перейти на страницу входа",
    table: {
      id: "ID Брони",
      venue: "Свадебный зал",
      district: "Район",
      date: "Дата",
      guests: "Кол-во гостей",
      services: "Доп. услуги",
      total: "Общая сумма",
      prepay: "Аванс (20%)",
      status: "Статус",
      actions: "Действия",
    },
    cancelConfirm: "Вы действительно хотите отменить бронирование?",
    cancelSuccess: "Бронирование успешно отменено!",
    errorOccurred: "Произошла ошибка",
    kishi: "чел.",
    none: "Нет",
    cancelBtn: "Отменить",
    som: "сум",
    usd: "$"
  }
};

export default function CartPage() {
  const router = useRouter();

  const [user, setUser] = useState<CartUser | null>(null);
  const [bookings, setBookings] = useState<CartBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"uz" | "ru">("uz");

  // Filter & Sort states
  const [filterTuman, setFilterTuman] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("sana");
  const [sortOrder, setSortOrder] = useState("asc");

  const t = translations[lang];

  const tumanlar = [
    "Bektemir",
    "Mirobod",
    "Mirzo Ulug'bek",
    "Olmazor",
    "Sergeli",
    "Uchtepa",
    "Yakkasaroy",
    "Yangihayot",
    "Yashnobod",
    "Yunusobod",
    "Shayxontohur",
    "Chilonzor"
  ];

  const loadUserBookings = useCallback(async (userId: number, tumanVal: string, statusVal: string, sortByVal: string, orderVal: string) => {
    setLoading(true);
    try {
      const tumanQuery = tumanVal === "all" ? "" : tumanVal;
      const statusQuery = statusVal === "all" ? "" : statusVal;
      const res = await fetch(`/api/bookings?userId=${userId}&tuman=${tumanQuery}&status=${statusQuery}&sortBy=${sortByVal}&order=${orderVal}`);
      const data = await res.json();
      setBookings(data);
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
      setLoading(false);
      return;
    }
    const parsedUser = JSON.parse(userStr) as CartUser;
    setUser(parsedUser);

    if (parsedUser.role === "owner") {
      router.replace("/owner");
      return;
    }
    if (parsedUser.role === "admin") {
      router.replace("/admin");
      return;
    }

    loadUserBookings(parsedUser.id, filterTuman, filterStatus, sortBy, sortOrder);
  }, [loadUserBookings, router, filterTuman, filterStatus, sortBy, sortOrder]);

  const handleCancelBooking = async (id: number) => {
    if (!confirm(t.cancelConfirm)) return;
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert(t.cancelSuccess);
      if (user) loadUserBookings(user.id, filterTuman, filterStatus, sortBy, sortOrder);
    } else {
      alert(t.errorOccurred);
    }
  };

  if (loading) {
    return (
      <div className="p-6 w-full max-w-7xl mx-auto min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-400 font-bold animate-pulse text-lg">
          {t.loading}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 w-full max-w-full mx-auto min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="text-center bg-white p-12 rounded-3xl shadow-sm border border-slate-100 max-w-md w-full">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 select-none">
            <svg className="w-10 h-10 text-emerald-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {t.notLoggedInTitle}
          </h1>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            {t.notLoggedInText}
          </p>
          <button
            onClick={() => router.push("/account")}
            className="inline-block px-6 py-3 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition shadow-sm w-full cursor-pointer"
          >
            {t.loginBtn}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-28 md:pt-36 px-6 pb-24 w-full max-w-7xl mx-auto min-h-screen bg-white">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-green-950 uppercase tracking-wide">
          {t.title}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* Filtrlar va Saralash Paneli */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl text-xs border border-gray-150 mb-6 shadow-xs">
        <div>
          <label className="block font-bold text-gray-500 mb-1">{t.filterDistrict}</label>
          <select value={filterTuman} onChange={e => setFilterTuman(e.target.value)} className="w-full p-2 border border-gray-250 bg-white text-gray-800 rounded-lg outline-none cursor-pointer">
            <option value="all">{t.all}</option>
            {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-500 mb-1">{t.filterStatus}</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 border border-gray-250 bg-white text-gray-800 rounded-lg outline-none cursor-pointer">
            <option value="all">{t.all}</option>
            <option value="bo'lib o'tgan">{lang === "uz" ? t.past : "Прошедшие"}</option>
            <option value="endi bo'ladigan">{lang === "uz" ? t.active : "Предстоящие"}</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-500 mb-1">{t.sortTitle}</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-gray-250 bg-white text-gray-800 rounded-lg outline-none cursor-pointer">
            <option value="sana">{t.sortSana}</option>
          </select>
        </div>
        <div>
          <label className="block font-bold text-gray-500 mb-1">{t.sortOrder}</label>
          <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-2 border border-gray-250 bg-white text-gray-800 rounded-lg outline-none cursor-pointer">
            <option value="asc">{t.sortAsc}</option>
            <option value="desc">{t.sortDesc}</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 border border-slate-150 rounded-full flex items-center justify-center mx-auto mb-4 select-none">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h3 className="font-bold text-lg text-gray-700">
              {t.noBookingsTitle}
            </h3>
            <p className="text-xs text-gray-400 mt-1 mb-6 leading-relaxed">
              {filterTuman !== "all" || filterStatus !== "all"
                ? t.noBookingsTextFiltered
                : t.noBookingsTextAll}
            </p>
            {filterTuman !== "all" || filterStatus !== "all" ? (
              <button
                onClick={() => { setFilterTuman("all"); setFilterStatus("all"); }}
                className="px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                {t.clearFilters}
              </button>
            ) : (
              <button
                onClick={() => router.push("/zallar")}
                className="px-6 py-2.5 bg-green-950 hover:bg-green-900 text-white font-bold rounded-xl transition shadow-sm cursor-pointer"
              >
                {t.viewHalls}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-xs font-bold text-gray-400 uppercase bg-slate-50/50">
                  <th className="p-4">{t.table.id}</th>
                  <th className="p-4">{t.table.venue}</th>
                  <th className="p-4">{t.table.district}</th>
                  <th className="p-4">{t.table.date}</th>
                  <th className="p-4">{t.table.guests}</th>
                  <th className="p-4">{t.table.services}</th>
                  <th className="p-4">{t.table.total}</th>
                  <th className="p-4">{t.table.prepay}</th>
                  <th className="p-4 text-center">{t.table.status}</th>
                  <th className="p-4 text-right">{t.table.actions}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const currencySymbol = b.currency === "USD" ? t.usd : t.som;
                  return (
                    <tr
                      key={b.id}
                      className="border-b last:border-none border-slate-55 hover:bg-slate-50/40"
                    >
                      <td className="p-4 font-extrabold text-green-950 text-base">
                        #{b.id}
                      </td>
                      <td className="p-4 font-bold text-slate-900">{b.toyxonaTitle}</td>
                      <td className="p-4 text-xs text-slate-500 font-bold">{b.tuman}</td>
                      <td className="p-4 font-bold text-slate-700">{formatDateStr(b.sana, lang)}</td>
                      <td className="p-4 font-semibold text-slate-700">{b.odamSoni} {t.kishi}</td>
                      <td className="p-4 text-xs text-slate-500">
                        {b.xizmatlar.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {b.xizmatlar.map((x, idx) => (
                              <span key={idx} className="inline-block bg-slate-100 text-slate-650 px-2 py-0.5 rounded-md text-[10px] font-bold border border-slate-200/40">
                                {x}
                              </span>
                            ))}
                          </div>
                        ) : (
                          t.none
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {b.grandTotal ? `${b.grandTotal.toLocaleString()} ${currencySymbol}` : `0 ${currencySymbol}`}
                      </td>
                      <td className="p-4 font-bold text-emerald-800 bg-emerald-50/20">
                        {b.prepayAmount ? `${b.prepayAmount.toLocaleString()} ${currencySymbol}` : `0 ${currencySymbol}`}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`inline-block text-[9px] font-black uppercase px-2.5 py-1 rounded-full border ${
                            b.status === "bo'lib o'tgan"
                              ? "bg-slate-50 text-slate-400 border-slate-200/50"
                              : "bg-emerald-50 text-emerald-800 border-emerald-100"
                          }`}
                        >
                          {b.status === "bo'lib o'tgan" 
                            ? t.statusPastLabel
                            : t.statusActiveLabel}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {b.status !== "bo'lib o'tgan" && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="text-xs font-black uppercase text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
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
    </div>
  );
}
