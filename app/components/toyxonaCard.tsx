import React from "react";
import Link from "next/link";
import type { ToyxonaType } from "@/lib/db";
import { getDistrictSlug } from "@/lib/districts";
import { translateToyxona } from "@/lib/toyxonaTranslations";

const cardTranslations = {
  uz: {
    startingPrice: "Boshlang'ich Narx",
    moreInfo: "Batafsil ma'lumot",
    som: "so'm"
  },
  ru: {
    startingPrice: "Начальная цена",
    moreInfo: "Подробнее",
    som: "сум"
  }
};

export function ToyxonaCard({ data, lang = "uz" }: { data: ToyxonaType; lang?: "uz" | "ru" }) {
  const t = cardTranslations[lang];
  const translatedData = translateToyxona(data, lang);

  return (
    <div className="w-full max-w-96 bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between group">
      <div>
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <img
            src={translatedData.image}
            alt={translatedData.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Tuman belgisi */}
          <div className="absolute top-3 right-3 bg-emerald-800/90 backdrop-blur-xs text-white text-[9px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase shadow-xs">
            {translatedData.tuman}
          </div>
        </div>
        <div className="p-5">
          <h3 className="font-extrabold text-lg text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-1 mb-1.5">
            {translatedData.title}
          </h3>
          <p className="text-xs text-slate-500 font-medium mb-4 line-clamp-3 leading-relaxed">
            {translatedData.description}
          </p>
          <div className="flex items-center justify-between border-t border-slate-50 pt-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {t.startingPrice}
            </div>
            <div className="text-sm font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md">
              {Number(translatedData.price).toLocaleString()} {translatedData.currency === "USD" ? "$" : t.som}
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-semibold mt-2.5 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <span className="line-clamp-1">{translatedData.location}</span>
          </div>
        </div>
      </div>
      <div className="p-5 pt-0">
        <Link
          href={`/tumanlar/${getDistrictSlug(data.tuman)}/${data.id}`}
          className="block text-center bg-emerald-800 hover:bg-emerald-700 text-white py-2.5 rounded-xl transition duration-200 font-bold text-xs uppercase tracking-wider shadow-xs hover:shadow-md cursor-pointer"
        >
          {t.moreInfo}
        </Link>
      </div>
    </div>
  );
}
