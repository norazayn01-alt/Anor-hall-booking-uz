"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";

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
  bookedSlots: { date: string; startTime: string; endTime: string }[];
}

const TIME_SLOTS = [
  { start: "09:00", end: "12:00", label: "09:00 – 12:00" },
  { start: "12:00", end: "15:00", label: "12:00 – 15:00" },
  { start: "15:00", end: "18:00", label: "15:00 – 18:00" },
  { start: "18:00", end: "21:00", label: "18:00 – 21:00" },
];

const CATEGORY_NAMES: Record<string, { uz: string; ru: string }> = {
  women: { uz: "Ayollar uchun", ru: "Для женщин" },
  men: { uz: "Erkaklar uchun", ru: "Для мужчин" },
  music: { uz: "Karnay-Surnay va Xonandalar", ru: "Карнай-Сурнай и Певицы" },
  kortej: { uz: "Kortej (Mashinalar)", ru: "Кортеж (Машины)" },
  decor: { uz: "Uy Dekoratsiyasi", ru: "Декор Дома" },
  bouquet: { uz: "Kelin Guldastasi", ru: "Букет Невесты" },
};

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export default function ProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);

  // Booking form
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

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
    fetch(`/api/service-providers/${id}`)
      .then(r => r.json())
      .then(data => { setProvider(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const isSlotBooked = (date: string, start: string) =>
    provider?.bookedSlots.some(s => {
      const d = typeof s.date === "string" ? s.date.split("T")[0] : new Date(s.date).toISOString().split("T")[0];
      return d === date && s.startTime === start;
    });

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !form.name || !form.phone) {
      alert(lang === "uz" ? "Barcha maydonlarni to'ldiring" : "Заполните все поля");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          providerId: Number(id),
          date: selectedDate,
          startTime: selectedSlot.start,
          endTime: selectedSlot.end,
          clientName: form.name,
          clientPhone: form.phone,
          note: form.note,
        }),
      });
      if (res.ok) {
        setBookingSuccess(true);
        // Re-fetch to update booked slots
        const updated = await fetch(`/api/service-providers/${id}`).then(r => r.json());
        setProvider(updated);
        setSelectedDate(null);
        setSelectedSlot(null);
        setForm({ name: "", phone: "", note: "" });
      } else {
        const err = await res.json();
        alert(err.error || (lang === "uz" ? "Xatolik yuz berdi" : "Произошла ошибка"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white pt-28">
        <div className="text-slate-400 font-bold animate-pulse text-lg">
          {lang === "uz" ? "Yuklanmoqda..." : "Загрузка..."}
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white pt-28 gap-4">
        <div className="text-6xl">🔍</div>
        <p className="text-slate-400 font-semibold">{lang === "uz" ? "Topilmadi" : "Не найдено"}</p>
        <Link href="/xizmatlar" className="text-emerald-700 font-bold hover:underline text-sm">← Orqaga</Link>
      </div>
    );
  }

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const monthNames = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
  const monthNamesRu = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/10 pt-28 md:pt-36 pb-24 text-slate-800">
      <div className="max-w-6xl mx-auto px-4 md:px-6">
        {/* Back */}
        <Link href="/xizmatlar" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-700 font-semibold text-sm transition mb-6">
          ← {lang === "uz" ? "Xizmatlar" : "Услуги"}
        </Link>

        {/* Top section: gallery + info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Gallery */}
          <div>
            <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden bg-slate-100 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={provider.images?.[activeImg] || "https://placehold.co/600x400/f1f5f9/94a3b8?text=Rasm+yo%27q"}
                alt={provider.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              {provider.images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImg(i => (i - 1 + provider.images.length) % provider.images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center font-bold transition cursor-pointer text-sm"
                  >‹</button>
                  <button
                    onClick={() => setActiveImg(i => (i + 1) % provider.images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center font-bold transition cursor-pointer text-sm"
                  >›</button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {provider.images.map((_, i) => (
                      <button key={i} onClick={() => setActiveImg(i)}
                        className={`w-2 h-2 rounded-full transition cursor-pointer ${i === activeImg ? "bg-white" : "bg-white/40"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* Thumbnails */}
            {provider.images.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {provider.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition cursor-pointer ${i === activeImg ? "border-emerald-600" : "border-transparent"}`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Provider info */}
          <div className="flex flex-col justify-center gap-4">
            {provider.subCategory && (
              <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-3 py-1 rounded-full w-fit uppercase tracking-widest">
                {provider.subCategory}
              </span>
            )}
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight">
              {provider.name}
            </h1>
            {provider.description && (
              <p className="text-slate-500 text-sm leading-relaxed">{provider.description}</p>
            )}

            <div className="space-y-3 mt-2">
              {provider.pricePerSession && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl p-4">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider">
                      {lang === "uz" ? "3 soatlik narxi" : "Цена за 3 часа"}
                    </p>
                    <p className="font-extrabold text-amber-800 text-lg">{provider.pricePerSession}</p>
                  </div>
                </div>
              )}
              {provider.address && (
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      {lang === "uz" ? "Manzil" : "Адрес"}
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">{provider.address}</p>
                  </div>
                </div>
              )}
              <a
                href={`tel:${provider.phone}`}
                className="flex items-center gap-3 bg-emerald-800 hover:bg-emerald-700 text-white rounded-2xl p-4 transition cursor-pointer group"
              >
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider">
                    {lang === "uz" ? "Qo'ng'iroq qilish" : "Позвонить"}
                  </p>
                  <p className="font-extrabold text-white text-lg tracking-wide">{provider.phone}</p>
                </div>
              </a>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-1">
              <span>📂</span>
              {CATEGORY_NAMES[provider.category]?.[lang] || provider.category}
            </div>
          </div>
        </div>

        {/* Booking section */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-black text-slate-900 mb-1">
            {lang === "uz" ? "Bron Qilish" : "Забронировать"}
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            {lang === "uz"
              ? "Qulay sanani va 3-soatlik vaqt slotini tanlang"
              : "Выберите удобную дату и 3-часовой временной слот"}
          </p>

          {bookingSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl p-4 mb-6 text-sm font-semibold flex items-center gap-2">
              ✅ {lang === "uz" ? "Bron muvaffaqiyatli amalga oshirildi! Tez orada siz bilan bog'lanamiz." : "Бронирование успешно! Мы свяжемся с вами в ближайшее время."}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div>
              <h3 className="font-bold text-slate-700 text-sm mb-3">
                {lang === "uz" ? "Sanani tanlang" : "Выберите дату"}
              </h3>
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); } else setCalMonth(m => m - 1); }}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer font-bold"
                >‹</button>
                <span className="font-extrabold text-slate-800 text-sm">
                  {lang === "uz" ? monthNames[calMonth] : monthNamesRu[calMonth]} {calYear}
                </span>
                <button
                  onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); } else setCalMonth(m => m + 1); }}
                  className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition cursor-pointer font-bold"
                >›</button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {["Du","Se","Ch","Pa","Ju","Sh","Ya"].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-400 uppercase py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* empty cells */}
                {Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 }).map((_, i) => (
                  <div key={`e${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = toDateStr(calYear, calMonth, day);
                  const isPast = new Date(dateStr) < new Date(new Date().toDateString());
                  const isSelected = selectedDate === dateStr;
                  const hasBooking = provider.bookedSlots.some(s => {
                    const d = typeof s.date === "string" ? s.date.split("T")[0] : new Date(s.date).toISOString().split("T")[0];
                    return d === dateStr;
                  });
                  return (
                    <button
                      key={day}
                      disabled={isPast}
                      onClick={() => { setSelectedDate(dateStr); setSelectedSlot(null); setBookingSuccess(false); }}
                      className={`h-9 w-full rounded-xl text-xs font-bold transition cursor-pointer
                        ${isPast ? "text-slate-300 cursor-not-allowed" : ""}
                        ${isSelected ? "bg-emerald-800 text-white shadow-md" : ""}
                        ${!isPast && !isSelected ? "hover:bg-emerald-50 hover:text-emerald-800 text-slate-700" : ""}
                        ${hasBooking && !isSelected ? "ring-1 ring-amber-400 text-amber-700" : ""}
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-400">
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded ring-1 ring-amber-400 inline-block" /> {lang === "uz" ? "Qisman band" : "Частично занято"}</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-800 inline-block" /> {lang === "uz" ? "Tanlangan" : "Выбрано"}</span>
              </div>
            </div>

            {/* Time slots + form */}
            <div>
              {selectedDate ? (
                <div>
                  <h3 className="font-bold text-slate-700 text-sm mb-3">
                    {lang === "uz" ? "Vaqt slotini tanlang (3 soat)" : "Выберите временной слот (3 часа)"}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {TIME_SLOTS.map(slot => {
                      const booked = isSlotBooked(selectedDate, slot.start);
                      const isChosen = selectedSlot?.start === slot.start;
                      return (
                        <button
                          key={slot.start}
                          disabled={!!booked}
                          onClick={() => setSelectedSlot({ start: slot.start, end: slot.end })}
                          className={`py-3 px-4 rounded-xl text-sm font-bold border transition cursor-pointer
                            ${booked ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed line-through" : ""}
                            ${isChosen ? "bg-emerald-800 border-emerald-800 text-white shadow-md" : ""}
                            ${!booked && !isChosen ? "bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-800" : ""}
                          `}
                        >
                          {slot.label}
                          {booked && <span className="block text-[10px] font-normal mt-0.5">{lang === "uz" ? "Band" : "Занято"}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSlot && (
                    <form onSubmit={handleBooking} className="space-y-3">
                      <h3 className="font-bold text-slate-700 text-sm">
                        {lang === "uz" ? "Ma'lumotlaringiz" : "Ваши данные"}
                      </h3>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          {lang === "uz" ? "Ism Familiya *" : "Имя и Фамилия *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={form.name}
                          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-emerald-600 text-sm"
                          placeholder={lang === "uz" ? "Abdullayev Jasur" : "Иванов Иван"}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          {lang === "uz" ? "Telefon *" : "Телефон *"}
                        </label>
                        <input
                          type="tel"
                          required
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-emerald-600 text-sm"
                          placeholder="+998 90 123 45 67"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider">
                          {lang === "uz" ? "Izoh (ixtiyoriy)" : "Примечание (необязательно)"}
                        </label>
                        <textarea
                          value={form.note}
                          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                          className="w-full p-3 border border-slate-200 rounded-xl bg-white outline-none focus:border-emerald-600 text-sm resize-none"
                          rows={2}
                          placeholder={lang === "uz" ? "Qo'shimcha talablar..." : "Дополнительные пожелания..."}
                        />
                      </div>

                      {/* Summary */}
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 text-xs text-emerald-800 space-y-1">
                        <p><strong>{lang === "uz" ? "Sana:" : "Дата:"}</strong> {selectedDate}</p>
                        <p><strong>{lang === "uz" ? "Vaqt:" : "Время:"}</strong> {selectedSlot.start} – {selectedSlot.end}</p>
                        {provider.pricePerSession && (
                          <p><strong>{lang === "uz" ? "Narxi:" : "Цена:"}</strong> {provider.pricePerSession}</p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold rounded-2xl transition text-sm cursor-pointer shadow-sm hover:shadow-md"
                      >
                        {submitting
                          ? (lang === "uz" ? "Yuklanmoqda..." : "Загрузка...")
                          : (lang === "uz" ? "✓ Bron Qilish" : "✓ Забронировать")}
                      </button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                  <div className="text-5xl mb-3">📅</div>
                  <p className="font-semibold text-sm">
                    {lang === "uz" ? "Avval sanani tanlang" : "Сначала выберите дату"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
