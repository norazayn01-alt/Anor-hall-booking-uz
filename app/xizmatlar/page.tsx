"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface ServiceItem {
  id: number;
  name: { uz: string; ru: string };
  category: "kortej" | "music" | "decor" | "bouquet";
  subCategory?: { uz: string; ru: string }; // e.g. "Ekonom", "Komfort", "Lyuks"
  price: { uz: string; ru: string };
  image: string;
  desc: { uz: string; ru: string };
}

const translations = {
  uz: {
    title: "Qo'shimcha Xizmatlar",
    subtitle: "Tantanangizni mukammal tashkil etish uchun kerak bo'ladigan barcha xizmatlar va kortejlarni bir joyda toping.",
    priceLabel: "Narxi",
    orderBtn: "Buyurtma berish",
    tabs: {
      all: "BARCHASI",
      kortej: "KORTEJ (MASHINALAR)",
      music: "KARNAY-SURNAY",
      decor: "UY DEKORATSIYASI",
      bouquet: "KELIN GULDASTASI"
    }
  },
  ru: {
    title: "Дополнительные услуги",
    subtitle: "Найдите все услуги и кортежи, необходимые для идеальной организации вашего торжества, в одном месте.",
    priceLabel: "Цена",
    orderBtn: "Заказать",
    tabs: {
      all: "ВСЕ",
      kortej: "КОРТЕЖ (МАШИНЫ)",
      music: "КАРНАЙ-СУРНАЙ",
      decor: "ДЕКОР ДОМА",
      bouquet: "БУКЕТ НЕВЕСТЫ"
    }
  }
};

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
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
    async function loadServices() {
      try {
        const res = await fetch("/api/additional-services");
        if (res.ok) {
          const data = await res.json();
          setServices(data);
        }
      } catch (err) {
        console.error("Xizmatlarni yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const filteredServices = activeTab === "all" 
    ? services 
    : services.filter(item => item.category === activeTab);

  const tabList = [
    { id: "all", label: t.tabs.all },
    { id: "kortej", label: t.tabs.kortej },
    { id: "music", label: t.tabs.music },
    { id: "decor", label: t.tabs.decor },
    { id: "bouquet", label: t.tabs.bouquet }
  ];

  return (
    <div className="flex-1 pt-28 md:pt-36 bg-linear-to-tr from-slate-50 via-emerald-50/20 to-rose-50/15 text-slate-800 pb-24">
      {/* Sahifa Sarlavhasi */}
      <section className="relative text-center pb-6 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">
          {t.title}
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
          {t.subtitle}
        </p>
      </section>

      {/* Filtrlash Tablari */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="flex flex-wrap justify-center gap-2 bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-slate-100 max-w-3xl mx-auto shadow-xs">
          {tabList.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-[11px] font-bold rounded-xl transition-all duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "text-slate-600 hover:text-emerald-800 hover:bg-emerald-50/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Xizmatlar Gridi */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-bold animate-pulse text-lg">
            Yuklanmoqda...
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12 justify-items-center">
            {filteredServices.map(item => (
              <div
                key={item.id}
                className="w-full max-w-96 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-56 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name[lang]}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {item.subCategory && (
                      <div className="absolute top-3 right-3 bg-emerald-800/90 backdrop-blur-xs text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase shadow-xs">
                        {item.subCategory[lang]}
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-left">
                    <h3 className="font-extrabold text-base text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-2">
                      {item.name[lang]}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed line-clamp-3">
                      {item.desc[lang]}
                    </p>
                    
                    <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.priceLabel}
                      </span>
                      <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
                        {item.price[lang]}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-5 pt-0">
                  <Link
                    href={`/boglanish?service=${encodeURIComponent(item.name[lang])}`}
                    className="block text-center bg-emerald-800 hover:bg-emerald-700 text-white py-2.5 rounded-xl transition duration-200 font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-md cursor-pointer"
                  >
                    {t.orderBtn}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
