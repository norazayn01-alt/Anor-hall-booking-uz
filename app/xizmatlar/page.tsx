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

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconDress = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M12 2L8 7l-4 2 2 13h12l2-13-4-2-4-5z" strokeLinejoin="round"/>
    <path d="M8 7c0 2.2 1.8 4 4 4s4-1.8 4-4" />
  </svg>
);
const IconSuit = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M8 2L5 6l3 2v14h8V8l3-2-3-4" strokeLinejoin="round"/>
    <path d="M8 2l4 5 4-5" />
    <path d="M10 8l2 3 2-3" />
  </svg>
);
const IconMusic = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M9 18V5l12-2v13" strokeLinejoin="round"/>
    <circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
  </svg>
);
const IconCar = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M5 17H3v-5l2-5h14l2 5v5h-2" strokeLinejoin="round"/>
    <circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>
    <path d="M5 12h14" />
  </svg>
);
const IconFlower = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <circle cx="12" cy="12" r="2"/>
    <path d="M12 2a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
    <path d="M12 16a3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3z"/>
    <path d="M2 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/>
    <path d="M16 12a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z"/>
  </svg>
);
const IconBouquet = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
    <path d="M12 22V12" strokeLinecap="round"/>
    <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
    <circle cx="12" cy="7" r="2"/>
    <circle cx="7" cy="10" r="2"/>
    <circle cx="17" cy="10" r="2"/>
  </svg>
);
const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-12 h-12 text-slate-300">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
  </svg>
);
const IconImages = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3.5 h-3.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
    <path d="m21 15-5-5L5 21"/>
  </svg>
);
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-3 h-3 shrink-0">
    <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

// ── Category config ───────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    id: "women",
    Icon: IconDress,
    color: "from-rose-400 to-pink-600",
    badge: "bg-rose-100 text-rose-700",
    image: "https://i.pinimg.com/736x/35/6b/ea/356beaf1c02ab84d4daff1dcdaebfc64.jpg",
    uz: "Ayollar uchun",
    ru: "Для женщин",
    desc: { uz: "Kelin ko'ylak salonlari, stilist, vizajist va dugonalar uchun kiyimlar", ru: "Свадебные платья, стилисты, визажисты и платья для подружек" },
  },
  {
    id: "men",
    Icon: IconSuit,
    color: "from-slate-600 to-slate-800",
    badge: "bg-slate-100 text-slate-700",
    image: "https://i.pinimg.com/736x/2b/9b/77/2b9b7759d57a911a3df3ecba25838cf3.jpg",
    uz: "Erkaklar uchun",
    ru: "Для мужчин",
    desc: { uz: "Kuyovlar uchun kostyum-shim ijarasi va barber xizmatlari", ru: "Прокат костюмов для жениха и услуги барбера" },
  },
  {
    id: "music",
    Icon: IconMusic,
    color: "from-amber-400 to-orange-600",
    badge: "bg-amber-100 text-amber-700",
    image: "https://frankfurt.apollo.olxcdn.com/v1/files/6bgrbdxoih3o2-UZ/image;s=1080x1080",
    uz: "Karnay-Surnay va Xonandalar",
    ru: "Карнай-Сурнай и Певицы",
    desc: { uz: "Milliy karnay-surnay guruhlari va kelin salom xonandalari", ru: "Национальные группы карная-сурная и певицы для келин салом" },
  },
  {
    id: "kortej",
    Icon: IconCar,
    color: "from-emerald-500 to-green-700",
    badge: "bg-emerald-100 text-emerald-700",
    image: "https://seo-cms.autoscout24.ch/wp-content/uploads/2025/03/611871B.jpg",
    uz: "Kortej (Mashinalar)",
    ru: "Кортеж (Машины)",
    desc: { uz: "To'y uchun kortej mashinalar — ekonomdan premium lyuksga qadar", ru: "Свадебные кортежи — от эконом до премиум люкс" },
  },
  {
    id: "decor",
    Icon: IconFlower,
    color: "from-purple-400 to-violet-600",
    badge: "bg-purple-100 text-purple-700",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEikzAmL-XNhkHCmU90q2ao45YPS0Cx49yHuCeS7cdchtHC0IaC1SSk3ST&s=10",
    uz: "Uy Dekoratsiyasi",
    ru: "Декор Дома",
    desc: { uz: "Kelin va kuyov uylarini to'y ruhida bezatish xizmatlari", ru: "Украшение домов невесты и жениха в свадебном стиле" },
  },
  {
    id: "bouquet",
    Icon: IconBouquet,
    color: "from-pink-400 to-rose-600",
    badge: "bg-pink-100 text-pink-700",
    image: "https://i.pinimg.com/webp/1200x/9b/26/a8/9b26a8fd94a9b30eb87031982ce259bd.webp",
    uz: "Kelin Guldastasi",
    ru: "Букет Невесты",
    desc: { uz: "Klassikdan qirollik guldastalarigacha — premium gullar", ru: "От классических до королевских букетов из премиальных цветов" },
  },
];

// ── Subcategories config ──────────────────────────────────────────────────────
const SUBCATEGORIES: Record<string, { id: string; uz: string; ru: string; image: string; desc: { uz: string; ru: string } }[]> = {
  women: [
    {
      id: "Kelin ko'ylaklar",
      uz: "Kelin ko'ylaklari",
      ru: "Свадебные платья",
      image: "https://i.pinimg.com/736x/35/6b/ea/356beaf1c02ab84d4daff1dcdaebfc64.jpg",
      desc: { uz: "Nafis va takrorlanmas kelin liboslari ijarasi", ru: "Аренда шикарных и уникальных свадебных платьев" }
    },
    {
      id: "Ansambllar",
      uz: "Ansambllar",
      ru: "Ансамбли",
      image: "https://i.pinimg.com/736x/55/f1/b7/55f1b72eddf2fb2d1e041cd4baeb7a7e.jpg",
      desc: { uz: "Kelin salom va milliy liboslar to'plamlari", ru: "Наборы одежды для келин салом и национальные наряды" }
    },
    {
      id: "Stilist va vizajist",
      uz: "Stilist va vizajist",
      ru: "Стилист и визажист",
      image: "https://i.pinimg.com/736x/6f/30/16/6f30164c0525287f3b89098bc19d36ea.jpg",
      desc: { uz: "Professional kelin makiyaji va soch turmaklari", ru: "Профессиональный макияж и прическа невесты" }
    },
    {
      id: "Dugonalar uchun kiyimlar",
      uz: "Dugonalar uchun kiyimlar",
      ru: "Одежда для подружек",
      image: "https://i.pinimg.com/736x/1a/10/7c/1a107c1b4807a505bdf9ff15edb7d305.jpg",
      desc: { uz: "Kelin dugonalari uchun bir xil oqshom ko'ylaklari", ru: "Одинаковые вечерние платья для подружек невесты" }
    }
  ],
  men: [
    {
      id: "Kuyov liboslari",
      uz: "Kuyov liboslari",
      ru: "Наряды жениха",
      image: "https://i.pinimg.com/736x/2b/9b/77/2b9b7759d57a911a3df3ecba25838cf3.jpg",
      desc: { uz: "Smoking va klassik kostyum-shimlar ijarasi", ru: "Аренда смокингов и классических костюмов" }
    },
    {
      id: "Barber xizmatlari",
      uz: "Barber xizmatlari",
      ru: "Услуги барбера",
      image: "https://i.pinimg.com/736x/14/b4/0b/14b40bd47a7465fbbbe28a6fcf7c7c0b.jpg",
      desc: { uz: "Kuyovlar uchun soch-soqol va yuz parvarishi", ru: "Стрижка, укладка бороды и уход за лицом для жениха" }
    }
  ],
  music: [
    {
      id: "Karnay-Surnay",
      uz: "Karnay-Surnay",
      ru: "Карнай-Сурнай",
      image: "https://frankfurt.apollo.olxcdn.com/v1/files/6bgrbdxoih3o2-UZ/image;s=1080x1080",
      desc: { uz: "Milliy va royal uslubidagi karnay-surnay guruhlari", ru: "Группы карнай-сурнай в национальном и рояль стиле" }
    },
    {
      id: "Xonandalar va guruhlar",
      uz: "Xonandalar va guruhlar",
      ru: "Певицы и группы",
      image: "https://i.pinimg.com/736x/2d/a2/29/2da229a5ec13d80a153be415f3e9365c.jpg",
      desc: { uz: "Kelin salom va marosim xonandalari guruhi", ru: "Группа певиц для проведения келин салом" }
    }
  ],
  kortej: [
    {
      id: "Premium Mashinalar",
      uz: "Premium Mashinalar",
      ru: "Премиум Машины",
      image: "https://seo-cms.autoscout24.ch/wp-content/uploads/2025/03/611871B.jpg",
      desc: { uz: "Mercedes S-class, Rolls-Royce va boshqa VIP avtolar", ru: "Mercedes S-class, Rolls-Royce и другие VIP авто" }
    },
    {
      id: "Komfort & Ekonom",
      uz: "Komfort & Ekonom",
      ru: "Комфорт и Эконом",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEAVYuRkj0S2DLiBYXrKHqzybVLkzJKfDpf17-ZCt4g&s=10",
      desc: { uz: "Kuyov-navkarlar va mehmonlar uchun mashinalar", ru: "Машины для друзей жениха и гостей" }
    }
  ],
  decor: [
    {
      id: "Xonadon bezaklari",
      uz: "Xonadon bezaklari",
      ru: "Украшение дома",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEikzAmL-XNhkHCmU90q2ao45YPS0Cx49yHuCeS7cdchtHC0IaC1SSk3ST&s=10",
      desc: { uz: "Kelin va kuyov uylarini to'yona bezash xizmatlari", ru: "Услуги по украшению домов жениха и невесты" }
    },
    {
      id: "LED va Fotozona",
      uz: "LED va Fotozona",
      ru: "LED и Фотозона",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0sGPc6dDPbbjI8ynhdLIz51LjxBax57sb5DN7SgAXjBZVmanAt5GvbZY&s=10",
      desc: { uz: "Gulli fotozonalar, LED yozuvlar va chiroqlar", ru: "Цветочные фотозоны, LED надписи и иллюминация" }
    }
  ],
  bouquet: [
    {
      id: "Klassik guldastalar",
      uz: "Klassik guldastalar",
      ru: "Классические букеты",
      image: "https://i.pinimg.com/webp/1200x/9b/26/a8/9b26a8fd94a9b30eb87031982ce259bd.webp",
      desc: { uz: "Oq atirgullar va nozik dekorlar uyg'unligi", ru: "Гармония белых роз и нежного декора" }
    },
    {
      id: "Eksklyuziv guldastalar",
      uz: "Eksklyuziv guldastalar",
      ru: "Эксклюзивные букеты",
      image: "https://i.pinimg.com/webp/736x/00/7c/ad/007cad0eb0bb0fbe5681af320e549026.webp",
      desc: { uz: "Import qilingan peonlar va noyob orxideyalar", ru: "Импортные пионы и редкие орхидеи" }
    }
  ]
};

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
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

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedSubCategory(null);
      return;
    }
    setLoadingProviders(true);
    fetch(`/api/service-providers?category=${selectedCategory}`)
      .then(r => r.json())
      .then(data => setProviders(Array.isArray(data) ? data : []))
      .catch(() => setProviders([]))
      .finally(() => setLoadingProviders(false));
  }, [selectedCategory]);

  const activeCat = CATEGORIES.find(c => c.id === selectedCategory);

  // ── Build Subcategories list dynamically ───────────────────────────────────
  let allSubcats: { id: string; uz: string; ru: string; image: string; desc: { uz: string; ru: string } }[] = [];
  if (selectedCategory && activeCat) {
    const catSubcats = SUBCATEGORIES[selectedCategory] || [];
    const existingSubcats = new Set(catSubcats.map(s => s.id.toLowerCase()));

    // Find other unique subcategories from database providers
    const dynamicSubcats: typeof catSubcats = [];
    providers.forEach(p => {
      if (p.subCategory) {
        const val = p.subCategory.trim();
        if (val && !existingSubcats.has(val.toLowerCase())) {
          existingSubcats.add(val.toLowerCase());
          dynamicSubcats.push({
            id: val,
            uz: val,
            ru: val,
            image: p.images?.[0] || activeCat.image,
            desc: {
              uz: `${val} bo'limidagi barcha xizmatchilar`,
              ru: `Все исполнители в разделе ${val}`
            }
          });
        }
      }
    });

    allSubcats = [...catSubcats, ...dynamicSubcats];

    // Check if there are any providers with no subcategory
    const hasNoSubcat = providers.some(p => !p.subCategory || !p.subCategory.trim());
    if (hasNoSubcat) {
      allSubcats.push({
        id: "general",
        uz: "Umumiy xizmatlar",
        ru: "Общие услуги",
        image: activeCat.image,
        desc: {
          uz: "Turli qo'shimcha xizmatlar va takliflar",
          ru: "Различные дополнительные услуги и предложения"
        }
      });
    }
  }

  // ── Render view ────────────────────────────────────────────────────────────
  if (selectedCategory && activeCat) {
    const CatIcon = activeCat.Icon;

    // View: List providers inside selected subcategory
    if (selectedSubCategory) {
      const activeSubcat = allSubcats.find(s => s.id === selectedSubCategory);
      const filteredProviders = providers.filter(p => {
        if (selectedSubCategory === "general") {
          return !p.subCategory || !p.subCategory.trim();
        }
        return p.subCategory?.trim().toLowerCase() === selectedSubCategory.toLowerCase();
      });

      return (
        <div className="flex-1 pt-28 md:pt-36 bg-gradient-to-br from-slate-50 via-white to-rose-50/20 text-slate-800 pb-24 min-h-screen">
          <div className="max-w-7xl mx-auto px-6 mb-8">
            <button
              onClick={() => setSelectedSubCategory(null)}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer mb-6"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="m15 18-6-6 6-6" strokeLinecap="round"/></svg>
              {lang === "uz" ? "Orqaga" : "Назад"}
            </button>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-white shadow-md`}>
                <CatIcon />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">
                  {lang === "uz" ? activeSubcat?.uz : activeSubcat?.ru}
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">
                  {lang === "uz" ? activeSubcat?.desc.uz : activeSubcat?.desc.ru}
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6">
            {loadingProviders ? (
              <div className="text-center py-24 text-slate-400 font-bold animate-pulse text-lg">
                {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
              </div>
            ) : filteredProviders.length === 0 ? (
              <div className="text-center py-24 flex flex-col items-center gap-4">
                <IconSearch />
                <p className="text-slate-400 font-semibold text-lg">
                  {lang === "uz" ? "Hozircha bu bo'limda xizmatchilar yo'q" : "В этой категории пока нет исполнителей"}
                </p>
                <p className="text-slate-400 text-sm">
                  {lang === "uz" ? "Tez orada qo'shiladi" : "Скоро будут добавлены"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProviders.map(p => (
                  <Link
                    key={p.id}
                    href={`/xizmatlar/${p.id}`}
                    className="group bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col"
                  >
                    <div className="relative h-52 overflow-hidden bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images?.[0] || "https://placehold.co/400x300/f1f5f9/94a3b8?text=Rasm+yo%27q"}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                      {p.images && p.images.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                          <IconImages />
                          {p.images.length}
                        </div>
                      )}
                      {p.subCategory && (
                        <div className={`absolute top-3 left-3 ${activeCat.badge} text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider`}>
                          {p.subCategory}
                        </div>
                      )}
                    </div>

                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-extrabold text-slate-800 group-hover:text-emerald-800 transition-colors text-base mb-1 line-clamp-1">
                        {p.name}
                      </h3>
                      {p.address && (
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                          <IconPin />
                          {p.address}
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
                          {lang === "uz" ? "Ko'rish" : "Смотреть"} &rarr;
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

    // View: List subcategories for the selected category
    return (
      <div className="flex-1 pt-28 md:pt-36 bg-gradient-to-br from-slate-50 via-white to-rose-50/20 text-slate-800 pb-24 min-h-screen">
        <div className="max-w-7xl mx-auto px-6 mb-8">
          <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition cursor-pointer mb-6"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="m15 18-6-6 6-6" strokeLinecap="round"/></svg>
            {lang === "uz" ? "Orqaga" : "Назад"}
          </button>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${activeCat.color} flex items-center justify-center text-white shadow-md`}>
              <CatIcon />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900">{activeCat[lang]}</h1>
              <p className="text-slate-500 text-sm mt-0.5">{activeCat.desc[lang]}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {loadingProviders ? (
            <div className="text-center py-24 text-slate-400 font-bold animate-pulse text-lg">
              {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
            </div>
          ) : allSubcats.length === 0 ? (
            <div className="text-center py-24 flex flex-col items-center gap-4">
              <IconSearch />
              <p className="text-slate-400 font-semibold text-lg">
                {lang === "uz" ? "Hozircha bu bo'limda xizmatchilar yo'q" : "В этой категории пока нет исполнителей"}
              </p>
              <p className="text-slate-400 text-sm">
                {lang === "uz" ? "Tez orada qo'shiladi" : "Скоро будут добавлены"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {allSubcats.map(subcat => (
                <button
                  key={subcat.id}
                  onClick={() => setSelectedSubCategory(subcat.id)}
                  className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left cursor-pointer border border-white/50 h-64"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={subcat.image}
                    alt={subcat.uz}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-300" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <h3 className="text-xl font-black text-white leading-tight mb-1">
                      {lang === "uz" ? subcat.uz : subcat.ru}
                    </h3>
                    <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3">
                      {lang === "uz" ? subcat.desc.uz : subcat.desc.ru}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
                        {lang === "uz" ? "Ko'rish" : "Смотреть"} &rarr;
                      </span>
                    </div>
                  </div>
                </button>
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

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map(cat => {
            const CatIcon = cat.Icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="group relative overflow-hidden rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 text-left cursor-pointer border border-white/50 h-64"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.uz}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10 group-hover:from-black/90 transition-all duration-300" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white">
                      <CatIcon />
                    </div>
                    <h2 className="text-xl font-black text-white leading-tight">{cat[lang]}</h2>
                  </div>
                  <p className="text-white/70 text-xs leading-relaxed line-clamp-2 mb-3">
                    {cat.desc[lang]}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/30 group-hover:bg-white/30 transition-colors">
                      {lang === "uz" ? "Ko'rish" : "Смотреть"} &rarr;
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
