"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DISTRICTS, getDistrictSlug } from "@/lib/districts";
import type { ToyxonaType } from "@/lib/db";

const DISTRICT_THEMES: Record<string, { bg: string; text: string; border: string; glow: string; badge: string; desc: { uz: string; ru: string } }> = {
  "Bektemir": {
    bg: "from-emerald-50/60 to-teal-50/30 hover:bg-emerald-50/90",
    text: "text-emerald-950",
    border: "border-emerald-100 hover:border-emerald-400",
    glow: "hover:shadow-emerald-500/10",
    badge: "bg-emerald-100/80 text-emerald-800 border-emerald-200/50",
    desc: {
      uz: "Shinam marosim zallari va yashil tabiat manzaralari bilan mashhur hudud.",
      ru: "Район, известный уютными свадебными залами и зелеными пейзажами."
    }
  },
  "Mirobod": {
    bg: "from-rose-50/60 to-pink-50/30 hover:bg-rose-50/90",
    text: "text-rose-950",
    border: "border-rose-100 hover:border-rose-400",
    glow: "hover:shadow-rose-500/10",
    badge: "bg-rose-100/80 text-rose-800 border-rose-200/50",
    desc: {
      uz: "Shahar markazidagi zamonaviy va hashamatli to'yxonalar joylashgan hudud.",
      ru: "Район с современными и роскошными свадебными залами в центре города."
    }
  },
  "Mirzo Ulug'bek": {
    bg: "from-indigo-50/60 to-blue-50/30 hover:bg-indigo-50/90",
    text: "text-indigo-950",
    border: "border-indigo-100 hover:border-indigo-400",
    glow: "hover:shadow-indigo-500/10",
    badge: "bg-indigo-100/80 text-indigo-800 border-indigo-200/50",
    desc: {
      uz: "Keng zallar va yuqori darajadagi servis xizmatlari bilan ajralib turadi.",
      ru: "Отличается просторными залами и первоклассным сервисом."
    }
  },
  "Olmazor": {
    bg: "from-amber-50/60 to-orange-50/30 hover:bg-amber-50/90",
    text: "text-amber-950",
    border: "border-amber-100 hover:border-amber-400",
    glow: "hover:shadow-amber-500/10",
    badge: "bg-amber-100/80 text-amber-800 border-amber-200/50",
    desc: {
      uz: "Tarixiy va fayzli, milliy qadriyatlarga mos an'anaviy marosim maskanlari.",
      ru: "Историческое и уютное место с традиционными свадебными залами."
    }
  },
  "Sergeli": {
    bg: "from-violet-50/60 to-purple-50/30 hover:bg-violet-50/90",
    text: "text-violet-950",
    border: "border-violet-100 hover:border-violet-400",
    glow: "hover:shadow-violet-500/10",
    badge: "bg-violet-100/80 text-violet-800 border-violet-200/50",
    desc: {
      uz: "Tez rivojlanayotgan, zamonaviy dizayn va keng imkoniyatli zallar maskani.",
      ru: "Быстрорастущий район с современными залами большой вместимости."
    }
  },
  "Uchtepa": {
    bg: "from-sky-50/60 to-cyan-50/30 hover:bg-sky-50/90",
    text: "text-sky-950",
    border: "border-sky-100 hover:border-sky-400",
    glow: "hover:shadow-sky-500/10",
    badge: "bg-sky-100/80 text-sky-800 border-sky-200/50",
    desc: {
      uz: "Aholiga qulay va shinam, oilaviy marosimlar uchun mos keluvchi joylar.",
      ru: "Удобные и уютные залы, подходящие для семейных торжеств."
    }
  },
  "Yakkasaroy": {
    bg: "from-fuchsia-50/60 to-pink-50/30 hover:bg-fuchsia-50/90",
    text: "text-fuchsia-950",
    border: "border-fuchsia-100 hover:border-fuchsia-400",
    glow: "hover:shadow-fuchsia-500/10",
    badge: "bg-fuchsia-100/80 text-fuchsia-800 border-fuchsia-200/50",
    desc: {
      uz: "Hashamatli arxitektura va yuqori darajadagi tantanalar o'tkazish zallari.",
      ru: "Залы с роскошной архитектурой и высочайшим уровнем проведения торжеств."
    }
  },
  "Yangihayot": {
    bg: "from-lime-50/60 to-emerald-50/30 hover:bg-lime-50/90",
    text: "text-lime-950",
    border: "border-lime-100 hover:border-lime-400",
    glow: "hover:shadow-lime-500/10",
    badge: "bg-lime-100/80 text-lime-800 border-lime-200/50",
    desc: {
      uz: "Yangi barpo etilgan, yorug' va shinam tantanalar maskanlari.",
      ru: "Недавно построенные, светлые и уютные свадебные залы."
    }
  },
  "Yashnobod": {
    bg: "from-orange-50/60 to-red-50/30 hover:bg-orange-50/90",
    text: "text-orange-950",
    border: "border-orange-100 hover:border-orange-400",
    glow: "hover:shadow-orange-500/10",
    badge: "bg-orange-100/80 text-orange-800 border-orange-200/50",
    desc: {
      uz: "Keng sig'imli va ajoyib akustika tizimiga ega to'yxonalar maskani.",
      ru: "Свадебные залы большой вместимости с отличной акустикой."
    }
  },
  "Yunusobod": {
    bg: "from-cyan-50/60 to-teal-50/30 hover:bg-cyan-50/90",
    text: "text-cyan-950",
    border: "border-cyan-100 hover:border-cyan-400",
    glow: "hover:shadow-cyan-500/10",
    badge: "bg-cyan-100/80 text-cyan-800 border-cyan-200/50",
    desc: {
      uz: "Nufuzli va yirik tantanalar saroylari bilan mashhur bo'lgan hudud.",
      ru: "Район, славящийся престижными и грандиозными дворцами торжеств."
    }
  },
  "Shayxontohur": {
    bg: "from-amber-50/60 to-yellow-50/30 hover:bg-amber-50/90",
    text: "text-amber-950",
    border: "border-amber-100 hover:border-amber-400",
    glow: "hover:shadow-amber-500/10",
    badge: "bg-amber-100/80 text-amber-800 border-amber-200/50",
    desc: {
      uz: "Markaziy va qadimiy hududdagi eng ko'zga ko'ringan muhtasham saroylar.",
      ru: "Великолепные дворцы в одном из центральных и древних районов."
    }
  },
  "Chilonzor": {
    bg: "from-green-50/60 to-emerald-50/30 hover:bg-green-50/90",
    text: "text-green-950",
    border: "border-green-100 hover:border-green-400",
    glow: "hover:shadow-green-500/10",
    badge: "bg-green-100/80 text-green-800 border-green-200/50",
    desc: {
      uz: "Eng yirik va mashhur, barcha turdagi tadbirlarga mos keng zallar.",
      ru: "Крупные и известные залы, подходящие для любых мероприятий."
    }
  }
};

const translations = {
  uz: {
    heroBadge: "Toshkent Shahri",
    title: "Marosim Hududini Tanlang",
    subtitle: "Toshkent shahrining tumanlari bo'ylab saralangan hashamatli to'yxonalar va tantanalar zallari to'plami.",
    hallsCount: "{count} ta to'yxona",
    noHalls: "Zallar yo'q",
    viewHalls: "Zallarni ko'rish"
  },
  ru: {
    heroBadge: "Город Ташкент",
    title: "Выберите район торжества",
    subtitle: "Коллекция роскошных залов и дворцов торжеств, отсортированных по районам города Ташкента.",
    hallsCount: "{count} свадебных залов",
    noHalls: "Нет залов",
    viewHalls: "Посмотреть залы"
  }
};

export default function TumanlarPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
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

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch("/api/toyxonalar?status=tasdiqlangan");
        if (res.ok) {
          const toyxonalar: ToyxonaType[] = await res.json();
          const counted = DISTRICTS.reduce((acc, tuman) => {
            const count = toyxonalar.filter(
              (item: ToyxonaType) => item.tuman.toLowerCase() === tuman.toLowerCase()
            ).length;
            acc[tuman] = count;
            return acc;
          }, {} as Record<string, number>);
          setCounts(counted);
        }
      } catch (err) {
        console.error("Xatolik counts:", err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-tr from-slate-50 via-emerald-50/10 to-rose-50/10 pt-28 md:pt-36 pb-16 px-6 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-12 right-1/4 w-120 h-120 bg-rose-200/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-xs border border-emerald-100/50 shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-widest">
              {t.heroBadge}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {t.title}
          </h1>
          <p className="text-slate-500 font-medium max-w-xl mx-auto text-sm md:text-base">
            {t.subtitle}
          </p>
        </div>

        {/* Districts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {DISTRICTS.map((tuman) => {
            const count = counts[tuman] || 0;
            const slug = getDistrictSlug(tuman);
            const theme = DISTRICT_THEMES[tuman] || DISTRICT_THEMES["Chilonzor"];

            return (
              <Link
                key={tuman}
                href={`/tumanlar/${slug}`}
                className={`group relative flex flex-col justify-between p-7 rounded-3xl bg-linear-to-br ${theme.bg} border ${theme.border} transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl ${theme.glow} overflow-hidden`}
              >
                {/* Decorative background shape */}
                <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500 pointer-events-none" />

                <div>
                  {/* Badge & Icon */}
                  <div className="flex justify-between items-start mb-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${theme.badge}`}>
                      {count > 0 ? t.hallsCount.replace("{count}", String(count)) : t.noHalls}
                    </span>
                    
                    {/* Location Icon */}
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-2xs text-emerald-750 transition-all duration-300 group-hover:bg-emerald-800 group-hover:text-white group-hover:scale-110">
                      <svg
                        className="w-4.5 h-4.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  {/* Title & Desc */}
                  <h3 className={`text-xl font-bold ${theme.text} mb-2 tracking-tight`}>
                    {tuman}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 group-hover:text-slate-600 transition-colors">
                    {lang === "uz" ? theme.desc.uz : theme.desc.ru}
                  </p>
                </div>

                {/* Footer Action */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 group-hover:text-emerald-950 transition-colors pt-2">
                  <span>{t.viewHalls}</span>
                  <svg
                    className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
