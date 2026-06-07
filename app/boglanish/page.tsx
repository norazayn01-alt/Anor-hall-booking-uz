"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const translations = {
  uz: {
    title: "Biz bilan bog'lanish",
    subtitle: "Savollaringiz yoki takliflaringiz bormi? Bizga xabar yuboring yoki quyidagi raqamlar orqali bog'laning.",
    infoTitle: "Aloqa Ma'lumotlari",
    infoDesc: "Bizning jamoamiz sizga eng munosib tantanalar zali va to'y tashkilotchilarini tanlashda yordam berishga tayyor.",
    phoneLabel: "Telefon raqamimiz",
    emailLabel: "Elektron pochta",
    addressLabel: "Manzilimiz",
    addressVal: "Toshkent shahri, Bektemir tumani, Husayn Boyqaro ko'chasi",
    formTitle: "Murojaat yuborish",
    nameInputLabel: "Ismingiz",
    nameInputPlaceholder: "Ismingizni kiriting",
    phoneInputLabel: "Telefon raqamingiz",
    messageInputLabel: "Xabaringiz",
    messageInputPlaceholder: "Murojaat matnini kiriting",
    submitBtn: "Xabarni yuborish",
    sending: "Yuborilmoqda...",
    successTitle: "Xabar yuborildi!",
    successMsg: "Tez orada siz bilan bog'lanamiz.",
    sendAnother: "Yangi xabar yuborish",
    errorRequired: "Iltimos, barcha maydonlarni to'ldiring.",
    errorPhone: "Telefon raqam noto'g'ri formatda.",
  },
  ru: {
    title: "Связаться с нами",
    subtitle: "У вас есть вопросы или предложения? Отправьте нам сообщение или свяжитесь по указанным номерам.",
    infoTitle: "Контактная информация",
    infoDesc: "Наша команда готова помочь вам выбрать наиболее подходящий зал торжеств и организаторов свадьбы.",
    phoneLabel: "Наш телефон",
    emailLabel: "Электронная почта",
    addressLabel: "Наш адрес",
    addressVal: "город Ташкент, Бектемирский район, улица Хусайна Байкаро",
    formTitle: "Отправить обращение",
    nameInputLabel: "Ваше имя",
    nameInputPlaceholder: "Введите ваше имя",
    phoneInputLabel: "Ваш номер телефона",
    messageInputLabel: "Ваше сообщение",
    messageInputPlaceholder: "Введите текст обращения",
    submitBtn: "Отправить сообщение",
    sending: "Отправка...",
    successTitle: "Сообщение отправлено!",
    successMsg: "Мы свяжемся с вами в ближайшее время.",
    sendAnother: "Отправить новое сообщение",
    errorRequired: "Пожалуйста, заполните все поля.",
    errorPhone: "Неверный формат номера телефона.",
  }
};

function BoglanishPageContent() {
  const [lang, setLang] = useState<"uz" | "ru">("uz");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const serviceParam = searchParams.get("service") || "";

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
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setUserId(u.id);
      setName(`${u.name} ${u.surname}`);
    }
  }, []);

  useEffect(() => {
    if (serviceParam) {
      if (lang === "ru") {
        setMessage(`Здравствуйте, я бы хотел заказать услугу "${serviceParam}".`);
      } else {
        setMessage(`Salom, men "${serviceParam}" xizmatini buyurtma bermoqchiman.`);
      }
    }
  }, [serviceParam, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError(t.errorRequired);
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, message, senderId: userId, subject: serviceParam || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Xatolik yuz berdi");
        return;
      }
      setSent(true);
      setMessage("");
    } catch {
      setError("Aloqa o'rnatib bo'lmadi");
    } finally {
      setSending(false);
    }
  };

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
        {/* Contact info details */}
        <div className="bg-white p-8 rounded-2xl shadow-sm space-y-8">
          <div>
            <h2 className="text-xl font-bold text-green-900 mb-4">{t.infoTitle}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {t.infoDesc}
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 select-none">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.phoneLabel}</p>
                <p className="font-semibold text-gray-800">+998 71 200 44 44</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 select-none">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.emailLabel}</p>
                <p className="font-semibold text-gray-800">info@anor-tantana.uz</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-gray-700">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 shrink-0 select-none">
                <svg className="w-5 h-5 text-emerald-800" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <div>
                <p className="text-xs text-gray-400">{t.addressLabel}</p>
                <p className="font-semibold text-gray-800">{t.addressVal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm">
          <h2 className="text-xl font-bold text-green-900 mb-6">{t.formTitle}</h2>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 bg-green-50 border border-green-150 rounded-full flex items-center justify-center select-none">
                <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="font-extrabold text-lg text-green-900">{t.successTitle}</h3>
              <p className="text-sm text-gray-500">{t.successMsg}</p>
              <button
                onClick={() => setSent(false)}
                className="mt-4 px-6 py-2.5 border border-green-800 text-green-800 font-bold rounded-xl text-sm hover:bg-green-50 transition"
              >
                {t.sendAnother}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {t.nameInputLabel}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.nameInputPlaceholder}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-green-800 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {t.phoneInputLabel}
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998"
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-green-800 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  {t.messageInputLabel}
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t.messageInputPlaceholder}
                  className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-green-800 transition resize-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 font-semibold bg-red-50 border border-red-200 rounded-xl px-4 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-green-900 hover:bg-green-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold transition cursor-pointer"
              >
                {sending ? t.sending : t.submitBtn}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BoglanishPage() {
  return (
    <Suspense fallback={
      <div className="pt-28 md:pt-36 px-6 pb-24 w-full max-w-7xl mx-auto min-h-screen bg-white flex items-center justify-center">
        <p className="text-gray-400 font-bold animate-pulse">Yuklanmoqda...</p>
      </div>
    }>
      <BoglanishPageContent />
    </Suspense>
  );
}