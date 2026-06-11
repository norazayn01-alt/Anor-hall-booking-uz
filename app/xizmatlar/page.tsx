"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Provider {
  id: number;
  name: string;
  category: string;
  subCategory?: string;
  description?: string;
  phone: string;
  address?: string;
  images: string[];
  pricePerSession?: string;
}

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "women",
    icon: "👗",
    color: "from-rose-400 to-pink-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    image: "https://i.pinimg.com/736x/35/6b/ea/356beaf1c02ab84d4daff1dcdaebfc64.jpg",
    uz: "Ayollar uchun",
    ru: "Для женщин",
    desc: { uz: "Kelin ko'ylak salonlari, stilist, vizajist va dugonalar uchun kiyimlar", ru: "Свадебные платья, стилисты, визажисты и платья для подружек" },
  },
  {
    id: "men",
    icon: "🤵",
    color: "from-slate-600 to-slate-800",
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-700",
    image: "https://i.pinimg.com/736x/2b/9b/77/2b9b7759d57a911a3df3ecba25838cf3.jpg",
    uz: "Erkaklar uchun",
    ru: "Для мужчин",
    desc: { uz: "Kuyovlar uchun kostyum-shim ijarasi va barber xizmatlari", ru: "Прокат костюмов для жениха и услуги барбера" },
  },
  {
    id: "music",
    icon: "🎺",
    color: "from-amber-400 to-orange-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    image: "https://frankfurt.apollo.olxcdn.com/v1/files/6bgrbdxoih3o2-UZ/image;s=1080x1080",
    uz: "Karnay-Surnay va Xonandalar",
    ru: "Карнай-Сурнай и Певицы",
    desc: { uz: "Milliy karnay-surnay guruhlari va kelin salom xonandalari", ru: "Национальные группы карная-сурная и певицы для келин салом" },
  },
  {
    id: "kortej",
    icon: "🚗",
    color: "from-emerald-500 to-green-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    image: "https://seo-cms.autoscout24.ch/wp-content/uploads/2025/03/611871B.jpg",
    uz: "Kortej (Mashinalar)",
    ru: "Кортеж (Машины)",
    desc: { uz: "To'y uchun kortej mashinalar — ekonomdan premium lyuksga qadar", ru: "Свадебные кортежи — от эконом до премиум люкс" },
  },
  {
    id: "decor",
    icon: "🌸",
    color: "from-purple-400 to-violet-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEikzAmL-XNhkHCmU90q2ao45YPS0Cx49yHuCeS7cdchtHC0IaC1SSk3ST&s=10",
    uz: "Uy Dekoratsiyasi",
    ru: "Декор Дома",
    desc: { uz: "Kelin va kuyov uylarini to'y ruhida bezatish xizmatlari", ru: "Украшение домов невесты и жениха в свадебном стиле" },
  },
  {
    id: "bouquet",
    icon: "💐",
    color: "from-pink-400 to-rose-600",
    bg: "bg-pink-50",
    border: "border-pink-200",
    badge: "bg-pink-100 text-pink-700",
    image: "https://i.pinimg.com/webp/1200x/9b/26/a8/9b26a8fd94a9b30eb87031982ce259bd.webp",
    uz: "Kelin Guldastasi",
    ru: "Букет Невесты",
    desc: { uz: "Klassikdan qirollik guldastalarigacha — premium gullar", ru: "От классических до королевских букетов из премиальных цветов" },
  },
];

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(false);

  useEffect(() => {
    const handleLang = () => {
      const savedLang = localStorage.getItem("lang") as "uz" | "ru";
      if (savedLang === "uz" || savedLang === "ru") setLang(savedLang);
    };
    handleLang();
    window.addEventListener("languageChange", handleLang);
    return () => window.removeEventListener("languageChange", handleLang);
  }, []);

  // Load providers when category selected
  useEffect(() => {
    if (!selectedCategory) return;
    setLoadingProviders(true);
    fetch(`/api/service-providers?category=${selectedCategory}`)
      .then(r => r.json())
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]))
      .finally(() => setLoadingProviders(false));
  }, [selectedCategory]);

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory);

  // ── Providers list view ───────────────────────────────────────────────────
  if (selectedCategory && activeCat) {
    return (
      <div className="flex-1 pt-28 md:pt-36 bg-gradient-to-br from-slate-50 via-white to-rose-50/20 text-slate-800 pb-24 min-h-screen">
        {/* Back header */}
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer mb-6"
          >
            ← {lang === "uz" ? "Orqaga" : "Назад"}
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-2xl shadow-md`}>
              {activeCat.icon}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                {activeCat[lang]}
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">{activeCat.desc[lang]}</p>
            </div>
          </div>
        </div>

        {/* Providers grid */}
        <div className="max-w-7xl mx-auto px-6">
          {loadingProviders ? (
            <div className="text-center py-24 text-slate-400 font-bold animate-pulse text-lg">
              {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
            </div>
          ) : providers.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-slate-400 font-semibold text-lg">
                {lang === "uz" ? "Hozircha bu bo'limda xizmatchilar yo'q" : "В этой категории пока нет исполнителей"}
              </p>
              <p className="text-slate-400 text-sm mt-2">
                {lang === "uz" ? "Tez orada qo'shiladi" : "Скоро будут добавлены"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {providers.map(p => (
                <Link
                  key={p.id}
                  href={`/xizmatlar/${p.id}`}
                  className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-52 overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.images?.[0] || "https://placehold.co/400x300/f1f5f9/94a3b8?text=Rasm+yo%27q"}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    {p.images && p.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        📷 {p.images.length}
                      </div>
                    )}
                    {p.subCategory && (
                      <div className={`absolute top-3 left-3 ${activeCat.badge} text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                        {p.subCategory}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-extrabold text-slate-800 group-hover:text-emerald-800 transition-colors text-base mb-1 line-clamp-1">
                      {p.name}
                    </h3>
                    {p.address && (
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                        📍 {p.address}
                      </p>
                    )}
                    {p.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
                        {p.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-auto">
                      <div>
                        {p.pricePerSession && (
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                            {p.pricePerSession}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                        {lang === "uz" ? "Ko'rish →" : "Смотреть →"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Category cards view ───────────────────────────────────────────────────
  return (
    <div className="flex-1 pt-28 md:pt-36 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 text-slate-800 pb-24 min-h-screen">
      {/* Header */}
      <section className="text-center pb-10 px-6 max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
          {lang === "uz" ? "Qo'shimcha Xizmatlar" : "Дополнительные услуги"}
        </h1>
        <p className="text-slate-500 text-sm md:text-base leading-relaxed">
          {lang === "uz"
            ? "To'yingiz uchun kerakli barcha xizmatlarni bir joyda toping — salonlar, ustalar, kortejlar va boshqalar."
            : "Найдите все необходимые услуги для вашей свадьбы в одном месте — салоны, мастера, кортежи и многое другое."}
        </p>
      </section>

      {/* Category cards grid */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left cursor-pointer border border-white/50 h-64"
            >
              {/* Background image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={cat.image}
                alt={cat.uz}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-300`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-20 group-hover:opacity-30 transition-opacity duration-300`} />

              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{cat.icon}</span>
                  <h2 className="text-xl font-black text-white leading-tight">
                    {cat[lang]}
                  </h2>
                </div>
                <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3">
                  {cat.desc[lang]}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
                    {lang === "uz" ? "Ko'rish →" : "Смотреть →"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
