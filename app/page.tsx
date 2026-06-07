"use client";

import React, { useState, useEffect } from "react";
import { ToyxonaCard } from "@/app/components/toyxonaCard";
import { ToyxonaType } from "@/lib/db";
import { SearchBar } from "@/app/components/searchBar";

const translations = {
  uz: {
    heroBadge: "TOSHKENT SHAHAR TO'YXONALARI",
    heroTitlePart1: "Quvonchli kun uchun",
    heroTitleHighlight: "ideal to'yxonani",
    heroTitlePart2: "toping",
    heroSubtitle: "Toshkent shahridagi eng hashamatli va shinam to'yxonalarni solishtiring, xonandalar, mashinalar va menyu narxlari bilan tanishing hamda onlayn bron qiling.",
    searchPlaceholder: "To'yxona nomi yoki manzil...",
    searchButton: "Qidirish",
    searchResults: "Qidiruv natijalari",
    recommendedHalls: "Tavsiya etilgan to'yxonalar",
    hallsFoundCount: "{count} ta marosim zallari topildi",
    clearFilters: "Filtrlarni tozalash",
    notFoundTitle: "Mos keladigan to'yxona topilmadi",
    notFoundDesc: "Qidiruv so'zlarini tekshiring yoki boshqa tumanlarni tanlab ko'ring.",
    viewAllHalls: "Barcha to'yxonalarni ko'rish",
    loading: "To'yxonalar qidirilmoqda..."
  },
  ru: {
    heroBadge: "СВАДЕБНЫЕ ЗАЛЫ ТАШКЕНТА",
    heroTitlePart1: "Найдите",
    heroTitleHighlight: "идеальный свадебный зал",
    heroTitlePart2: "для счастливого дня",
    heroSubtitle: "Сравнивайте самые роскошные и уютные залы Ташкента, знакомьтесь с певцами, машинами, ценами меню и бронируйте онлайн.",
    searchPlaceholder: "Название зала или адрес...",
    searchButton: "Найти",
    searchResults: "Результаты поиска",
    recommendedHalls: "Рекомендуемые залы",
    hallsFoundCount: "Найдено {count} банкетных залов",
    clearFilters: "Очистить фильтры",
    notFoundTitle: "Свадебный зал не найден",
    notFoundDesc: "Проверьте поисковый запрос или попробуйте выбрать другие районы.",
    viewAllHalls: "Посмотреть все залы",
    loading: "Поиск залов..."
  }
};

export default function IndexPage() {
  const [toyxonalar, setToyxonalar] = useState<ToyxonaType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [sortBy, setSortBy] = useState<string>("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  // API orqali to'yxonalarni yuklash
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        let url = `/api/toyxonalar?status=tasdiqlangan&sortBy=${sortBy}&order=${sortOrder}`;
        if (searchQuery.trim()) {
          url += `&search=${encodeURIComponent(searchQuery.trim())}`;
        }
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setToyxonalar(data);
        }
      } catch (err) {
        console.error("To'yxonalarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    };

    // Live search - yozilganda yuklash (debounce bilan)
    const delayDebounceFn = setTimeout(() => {
      fetchData();
    }, 200);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, sortBy, sortOrder]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-linear-to-tr from-slate-50 via-emerald-50/20 to-rose-50/15 text-slate-800">
      {/* 1. HERO QISMI */}
      <section className="relative flex flex-col items-center justify-center py-12 px-6 overflow-hidden min-h-screen">
        {/* Hero matnlari va qidiruv */}
        <div className="relative z-10 flex flex-col items-center max-w-4xl w-full text-center mt-24 md:mt-36">
          {/* Orqadagi sekin aylanuvchi barg foni - matnlar markaziga moslangan */}
          <div className="absolute inset-0 flex justify-center items-center pointer-events-none -z-10">
            <div
              className="animate-spin bg-[url('/barg.png')] bg-cover bg-center w-[340px] h-[340px] md:w-[680px] md:h-[680px] opacity-20"
              style={{ animationDuration: "75s" }}
            />
          </div>

          {/* Sarlavha (Header) */}
          <h1 className="text-4xl md:text-7xl lg:text-6xl font-script font-bold text-slate-950 tracking-normal leading-[1.3] mb-6 animate-fade-in">
            {t.heroTitlePart1} <br className="hidden md:inline" />
            <span className="bg-linear-to-r from-emerald-900 via-emerald-800 to-green-700 bg-clip-text text-transparent">
              {t.heroTitleHighlight}
            </span>{" "}
            {t.heroTitlePart2}
          </h1>

          {/* Subtitr (Sub-header) */}
          <p className="text-sm md:text-lg text-slate-500 font-medium max-w-3xl leading-relaxed mb-10 px-4">
            {t.heroSubtitle}
          </p>

          {/* Premium Animated Search Bar */}
          <div className="w-full max-w-xl mx-auto">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t.searchPlaceholder}
            />
          </div>
        </div>
      </section>

      {/* 2. TO'YXONALAR GRIDI */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24 w-full">
        {/* Natija sarlavhasi */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200/60 pb-5 mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {searchQuery
                ? t.searchResults
                : t.recommendedHalls}
            </h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
              {t.hallsFoundCount.replace("{count}", String(toyxonalar.length))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-3 md:mt-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <span className="uppercase tracking-wider">{lang === "uz" ? "Saralash:" : "Сортировка:"}</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="outline-none text-emerald-800 bg-transparent font-bold cursor-pointer"
              >
                <option value="id">{lang === "uz" ? "Standart" : "По умолчанию"}</option>
                <option value="price">{lang === "uz" ? "Narxi" : "Цена"}</option>
                <option value="capacity">{lang === "uz" ? "Sig'imi" : "Вместимость"}</option>
              </select>
            </div>
            {sortBy !== "id" && (
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as "asc" | "desc")}
                className="text-xs font-bold text-emerald-800 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs outline-none cursor-pointer"
              >
                <option value="asc">↑ {lang === "uz" ? "O'sish" : "Возрастание"}</option>
                <option value="desc">↓ {lang === "uz" ? "Kamayish" : "Убывание"}</option>
              </select>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs hover:shadow-xs transition uppercase tracking-wider cursor-pointer"
              >
                {t.clearFilters}
              </button>
            )}
          </div>
        </div>

        {/* Yuklanish (Loading) holati */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 justify-items-center w-full">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-full max-w-96 h-112 bg-white rounded-2xl border border-slate-100 shadow-xs animate-pulse flex flex-col justify-between p-5"
              >
                <div className="w-full h-56 bg-slate-200 rounded-xl mb-4" />
                <div className="flex-1">
                  <div className="w-2/3 h-5 bg-slate-200 rounded mb-3" />
                  <div className="w-full h-3.5 bg-slate-200 rounded mb-2" />
                  <div className="w-4/5 h-3.5 bg-slate-200 rounded mb-4" />
                  <div className="w-1/2 h-4.5 bg-slate-200 rounded" />
                </div>
                <div className="w-full h-11 bg-slate-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        ) : toyxonalar.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center text-center bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-3xl py-20 px-6 shadow-sm max-w-xl mx-auto mt-6">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mb-5 text-rose-700">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="font-extrabold text-xl text-slate-800 mb-2">
              {t.notFoundTitle}
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-sm mb-6 leading-relaxed">
              {t.notFoundDesc}
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-sm hover:shadow transition cursor-pointer"
            >
              {t.viewAllHalls}
            </button>
          </div>
        ) : (
          /* Natijalar */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 justify-items-center w-full animate-fade-in">
            {toyxonalar.map((toyxona) => (
              <ToyxonaCard key={toyxona.id} data={toyxona} lang={lang} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
