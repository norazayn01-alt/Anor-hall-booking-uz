"use client";

import React, { useState, useEffect } from "react";
import { ToyxonaCard } from "@/components/ToyxonaCard";
import { ToyxonaType } from "@/lib/db";
import { use } from "react";
import { motion } from "framer-motion";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const pageTranslations = {
  uz: {
    title: "{slug} tumanidagi to'yxonalar",
    subtitle: "O'zingizga ma'qul keladigan mukammal variantni saralab oling",
    capacity: "Mehmonlar sig'imi:",
    all: "Barchasi",
    small: "Kichik (~250)",
    medium: "O'rtacha (~400)",
    large: "Katta (400+)",
    loading: "To'yxonalar qidirilmoqda...",
    notFound: "Mos variantlar topilmadi",
    notFoundDesc: "Kiritilgan qidiruv mezonlarini o'zgartirib qayta urinib ko'ring."
  },
  ru: {
    title: "Свадебные залы в районе {slug}",
    subtitle: "Выберите идеальный вариант, соответствующий вашим предпочтениям",
    capacity: "Вместимость гостей:",
    all: "Все",
    small: "Малый (~250)",
    medium: "Средний (~405)",
    large: "Большой (400+)",
    loading: "Поиск залов...",
    notFound: "Соответствующие варианты не найдены",
    notFoundDesc: "Попробуйте изменить параметры поиска."
  }
};

export default function TumanPage({ params }: PageProps) {
  const { slug } = use(params);

  // Ma'lumotlar state'i
  const [toyxonalar, setToyxonalar] = useState<ToyxonaType[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter State'lari
  const [selectedCapacity, setSelectedCapacity] = useState<string>("all");
  const [lang, setLang] = useState<"uz" | "ru">("uz");

  const t = pageTranslations[lang];

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
    async function fetchFilteredData() {
      setLoading(true);
      try {
        // Yangi tez endpoint: bitta SQL so'rov, faqat kerakli maydonlar
        const url = `/api/venues-by-tuman?tuman=${slug}&capacity=${selectedCapacity}`;
        const res = await fetch(url);
        const data: ToyxonaType[] = await res.json();
        setToyxonalar(data);
      } catch (error) {
        console.error("Xatolik yuz berdi:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredData();
  }, [slug, selectedCapacity]);

  return (
    <div className="pt-28 md:pt-36 px-6 pb-24 max-w-7xl mx-auto min-h-screen">
      {/* 1. SAHIFA SARLAVHASI */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-green-950 uppercase tracking-wide">
          {t.title.replace("{slug}", slug)}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.subtitle}
        </p>
      </div>

      {/* 2. FILTER PANELI - Premium Floating Glassmorphic Selector */}
      <div className="flex flex-col items-center justify-center mb-12 w-full">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 select-none">
          {t.capacity}
        </label>
        <div className="relative flex items-center bg-white/70 backdrop-blur-md p-1 rounded-full border border-slate-200/50 shadow-md max-w-2xl w-full">
          {[
            { id: "all", label: t.all },
            { id: "small", label: t.small },
            { id: "medium", label: t.medium },
            { id: "large", label: t.large },
          ].map((tab) => {
            const isActive = selectedCapacity === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedCapacity(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold rounded-full transition-all duration-300 z-10 cursor-pointer ${
                  isActive ? "text-white" : "text-slate-600 hover:text-emerald-800"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCapacityTab"
                    className="absolute inset-0 bg-gradient-to-br from-emerald-800 to-green-700 rounded-full shadow-sm -z-10"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. TUZATILGAN SIMMETRIK TO'YXONALAR GRIDI */}
      {loading ? (
        <div className="text-center text-gray-500 gap-5 font-medium py-20 text-lg animate-pulse">
          {t.loading}
        </div>
      ) : toyxonalar.length === 0 ? (
        <div className="text-center bg-white border border-dashed rounded-2xl py-16 px-4 shadow-sm max-w-md mx-auto mt-10">
          <p className="text-gray-400 font-bold text-lg mb-1">
            {t.notFound}
          </p>
          <p className="text-gray-500 text-sm">
            {t.notFoundDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 justify-items-center w-full">
          {toyxonalar.map((toyxona) => (
            <ToyxonaCard key={toyxona.id} data={toyxona} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
