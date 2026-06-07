"use client";

import React, { useState, useEffect } from "react";

interface MenuItem {
  name: string;
  price: string;
  description: string;
}

interface MenuCategory {
  category: string;
  items: MenuItem[];
}

const translations = {
  uz: {
    title: "Tantanalar Menyusi",
    subtitle: "To'y va marosimlar uchun taqdim etiladigan maxsus taomlarimiz ro'yxati (dinamik)",
    loading: "Yuklanmoqda..."
  },
  ru: {
    title: "Меню Торжеств",
    subtitle: "Список наших специальных праздничных блюд (динамически)",
    loading: "Загрузка..."
  }
};

export default function MenyuPage() {
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
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
    async function loadMenu() {
      try {
        const res = await fetch("/api/menus");
        if (res.ok) {
          const data = await res.json();
          setMenuCategories(data);
        }
      } catch (err) {
        console.error("Menyuni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMenu();
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
        <div className="space-y-12">
          {menuCategories.map((cat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-green-900 border-b pb-3 mb-6">
                {cat.category}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex justify-between items-start border-b border-dashed border-gray-150 pb-4 last:border-none last:pb-0"
                  >
                    <div>
                      <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                    </div>
                    <span className="font-bold text-amber-700 whitespace-nowrap ml-4">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}