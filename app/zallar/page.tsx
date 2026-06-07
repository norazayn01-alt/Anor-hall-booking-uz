"use client";

import React, { useState, useEffect } from "react";

interface HallCategory {
  title: string;
  capacity: string;
  description: string;
  features: string[];
  image: string;
}

const translations = {
  uz: {
    title: "Marosim Zallari",
    subtitle: "Har qanday o'lchamdagi va turdagi tadbirlaringiz uchun mukammal zallar to'plami (dinamik)",
    loading: "Yuklanmoqda...",
    capacity: "Sig'imi:",
    featuresTitle: "Qulayliklari:"
  },
  ru: {
    title: "Банкетные Залы",
    subtitle: "Прекрасный выбор залов для проведения мероприятий любого масштаба и формата (динамически)",
    loading: "Загрузка...",
    capacity: "Вместимость:",
    featuresTitle: "Удобства:"
  }
};

export default function ZallarPage() {
  const [zallarCategories, setZallarCategories] = useState<HallCategory[]>([]);
  const [loading, setLoading] = useState(true);
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
    async function loadHalls() {
      try {
        const res = await fetch("/api/halls");
        if (res.ok) {
          const data = await res.json();
          setZallarCategories(data);
        }
      } catch (err) {
        console.error("Zallarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadHalls();
  }, []);

  return (
    <div className="pt-28 md:pt-36 px-6 pb-24 w-full max-w-7xl mx-auto min-h-screen bg-white">
      <div className="text-center mb-10 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400 font-bold animate-pulse text-lg">
          {t.loading}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {zallarCategories.map((zal, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 flex flex-col justify-between">
              <div>
                <div className="h-56 relative overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={zal.image}
                    alt={zal.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-left">
                  <h3 className="font-bold text-xl text-green-900 mb-2">{zal.title}</h3>
                  <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full mb-4">
                    {t.capacity} {zal.capacity}
                  </span>
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">{zal.description}</p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-gray-800 text-xs uppercase tracking-wider">{t.featuresTitle}</h4>
                    <ul className="text-sm text-gray-500 list-disc pl-4 space-y-1">
                      {zal.features.map((feat, fIdx) => (
                        <li key={fIdx}>{feat}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}