"use client";

import React, { useState, useEffect } from "react";

interface PackageItem {
  name: string;
  price: string;
  description: string;
  features: string[];
  badge?: string;
}

const translations = {
  uz: {
    title: "Xizmatlar Narxlari",
    subtitle: "Har xil turdagi tantanalar uchun maxsus takliflarimiz va narxlarimiz (dinamik)",
    loading: "Yuklanmoqda...",
    selectBtn: "Tanlash va buyurtma berish"
  },
  ru: {
    title: "Цены на Услуги",
    subtitle: "Наши специальные предложения и цены для различных видов торжеств (динамически)",
    loading: "Загрузка...",
    selectBtn: "Выбрать и заказать"
  }
};

export default function NarxlarPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
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
    async function loadPackages() {
      try {
        const res = await fetch("/api/packages");
        if (res.ok) {
          const data = await res.json();
          setPackages(data);
        }
      } catch (err) {
        console.error("Paketlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {packages.map((pkg, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-150 flex flex-col justify-between hover:shadow-md transition-shadow relative"
            >
              {pkg.badge && (
                <span className="absolute top-4 right-4 bg-green-100 text-green-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {pkg.badge}
                </span>
              )}
              <div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">{pkg.name}</h3>
                <p className="text-sm text-gray-500 mb-6">{pkg.description}</p>
                <div className="text-2xl font-black text-green-900 mb-6">{pkg.price}</div>
                <ul className="space-y-3 text-sm text-gray-600 mb-8">
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <span className="text-green-700">✓</span> {feat}
                    </li>
                  ))}
                </ul>
              </div>
              <button className="w-full py-3 bg-green-900 hover:bg-green-800 text-white rounded-xl font-bold transition cursor-pointer">
                {t.selectBtn}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}