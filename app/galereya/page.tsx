"use client";

import React, { useState, useEffect } from "react";

interface GalleryItem {
  src: string;
  title: string;
}

const translations = {
  uz: {
    title: "Galereya",
    subtitle: "To'yxonalarimiz va taqdim etiladigan lazzatli taomlarimizdan foto-lavhalar (dinamik)",
    loading: "Yuklanmoqda..."
  },
  ru: {
    title: "Галерея",
    subtitle: "Фотогалерея наших свадебных залов и изысканных блюд (динамически)",
    loading: "Загрузка..."
  }
};

export default function GalereyaPage() {
  const [images, setImages] = useState<GalleryItem[]>([]);
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
    async function loadGallery() {
      try {
        const res = await fetch("/api/gallery");
        if (res.ok) {
          const data = await res.json();
          setImages(data);
        }
      } catch (err) {
        console.error("Galereyani yuklashda xatolik:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGallery();
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images.map((img, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-md bg-white border border-gray-100"
            >
              <div className="h-64 overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white font-bold text-lg">{img.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}