"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, 
  Mail, 
  Lock, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle, 
  LogOut, 
  Loader2, 
  UserCheck, 
  ShieldAlert, 
  Sparkles,
  ChevronRight
} from "lucide-react";

type UserRole = "user" | "owner" | "admin";

type CurrentUser = {
  name: string;
  surname: string;
  role: UserRole;
  email: string;
  username: string;
};

const translations = {
  uz: {
    loading: "Yuklanmoqda...",
    roleLabel: "Rol:",
    roleAdmin: "Administrator",
    roleOwner: "Hamkor / To'yxona egasi",
    roleUser: "Mijoz",
    adminPanelBtn: "Admin Panelga O'tish",
    ownerPanelBtn: "Ega Paneliga O'tish",
    logoutBtn: "Chiqish",
    otpTitle: "Tasdiqlash kodi",
    otpText: "Biz {email} manziliga OTP kod yubordik.",
    otpPlaceholder: "Kodni kiriting",
    testCode: "Test kodi:",
    activateAccountBtn: "Akkauntni faollashtirish",
    backToLogin: "Kirish oynasiga qaytish",
    welcomeTitle: "Xush kelibsiz",
    welcomeText: "Tizimga kirish uchun ma'lumotlaringizni kiriting",
    usernameLabel: "Foydalanuvchi nomi",
    usernamePlaceholder: "Masalan: anor_user",
    passwordLabel: "Parol",
    loginBtn: "Tizimga kirish",
    quickAccountsTitle: "Tezkor test hisoblari (Bosib sinab ko'ring):",
    adminRole: "Admin",
    ownerRole: "Ega (Faol)",
    unverifiedOwnerRole: "Ega (Tasdiqlanmagan)",
    clientRole: "Mijoz",
    newToSystem: "Tizimda yangimisiz?",
    registerLink: "Ro'yxatdan o'tish",
    registerTitle: "Ro'yxatdan o'tish",
    registerSubtitle: "Yangi hisob yaratish uchun formani to'ldiring",
    nameLabel: "Ism *",
    namePlaceholder: "Ismingiz",
    surnameLabel: "Familiya *",
    surnamePlaceholder: "Familiyangiz",
    emailLabel: "Email *",
    emailPlaceholder: "Masalan: email@anor.uz",
    roleSelectionLabel: "Tizimdagi rolingiz *",
    roleClientOption: "Oddiy foydalanuvchi (Mijoz)",
    roleOwnerOption: "To'yxona egasi (Hamkor)",
    alreadyHaveAccount: "Akkauntingiz bormi?",
    loginLink: "Kirish",
    errUsernamePassword: "Foydalanuvchi nomi va parolni kiriting",
    successOtpSent: "Pochtangizga OTP faollashtirish kodi yuborildi",
    successLogin: "Tizimga muvaffaqiyatli kirdingiz!",
    errInvalidLogin: "Foydalanuvchi nomi yoki parol noto'g'ri",
    errConnection: "Ulanishda xatolik yuz berdi",
    errAllFieldsRequired: "Barcha majburiy maydonlarni to'ldiring",
    successRegOwner: "Ro'yxatdan o'tdingiz. Akkauntni faollashtirish uchun OTP kodni kiriting.",
    successRegClient: "Ro'yxatdan muvaffaqiyatli o'tdingiz!",
    errRegFailed: "Ro'yxatdan o'tishda xatolik yuz berdi",
    errEnterOtp: "Tasdiqlash kodini kiriting",
    successActivation: "Akkauntingiz faollashtirildi! Tizimga kirilmoqda...",
    errInvalidOtp: "Kod noto'g'ri kiritildi"
  },
  ru: {
    loading: "Загрузка...",
    roleLabel: "Роль:",
    roleAdmin: "Администратор",
    roleOwner: "Партнер / Владелец зала",
    roleUser: "Клиент",
    adminPanelBtn: "Перейти в админ-панель",
    ownerPanelBtn: "Перейти в панель владельца",
    logoutBtn: "Выйти",
    otpTitle: "Код подтверждения",
    otpText: "Мы отправили OTP-код на адрес {email}.",
    otpPlaceholder: "Введите код",
    testCode: "Тестовый код:",
    activateAccountBtn: "Активировать аккаунт",
    backToLogin: "Вернуться к окну входа",
    welcomeTitle: "Добро пожаловать",
    welcomeText: "Введите свои данные для входа в систему",
    usernameLabel: "Имя пользователя",
    usernamePlaceholder: "Например: anor_user",
    passwordLabel: "Пароль",
    loginBtn: "Войти в систему",
    quickAccountsTitle: "Быстрые тестовые аккаунты (Нажмите, чтобы проверить):",
    adminRole: "Админ",
    ownerRole: "Владелец (Активный)",
    unverifiedOwnerRole: "Владелец (Неактивный)",
    clientRole: "Клиент",
    newToSystem: "Впервые в системе?",
    registerLink: "Зарегистрироваться",
    registerTitle: "Регистрация",
    registerSubtitle: "Заполните форму для создания новой учетной записи",
    nameLabel: "Имя *",
    namePlaceholder: "Ваше имя",
    surnameLabel: "Фамилия *",
    surnamePlaceholder: "Ваша фамилия",
    emailLabel: "Email *",
    emailPlaceholder: "Например: email@anor.uz",
    roleSelectionLabel: "Ваша роль в системе *",
    roleClientOption: "Обычный пользователь (Клиент)",
    roleOwnerOption: "Владелец зала (Партнер)",
    alreadyHaveAccount: "Уже есть аккаунт?",
    loginLink: "Войти",
    errUsernamePassword: "Введите имя пользователя и пароль",
    successOtpSent: "Код активации OTP отправлен на вашу почту",
    successLogin: "Вы успешно вошли в систему!",
    errInvalidLogin: "Неверное имя пользователя или пароль",
    errConnection: "Произошла ошибка подключения",
    errAllFieldsRequired: "Заполните все обязательные поля",
    successRegOwner: "Вы зарегистрировались. Введите OTP-код для активации аккаунта.",
    successRegClient: "Вы успешно зарегистрировались!",
    errRegFailed: "Ошибка при регистрации",
    errEnterOtp: "Введите код подтверждения",
    successActivation: "Ваш аккаунт активирован! Вход в систему...",
    errInvalidOtp: "Неверно введен код"
  }
};

export default function AccountPage() {
  const router = useRouter();

  // State
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [view, setView] = useState<"login" | "register" | "otp">("login");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [lang, setLang] = useState<"uz" | "ru">("uz");

  // OTP data
  const [otpUserId, setOtpUserId] = useState<number | null>(null);
  const [otpSentEmail, setOtpSentEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeHint, setOtpCodeHint] = useState("");

  // Inputs
  const [loginInput, setLoginInput] = useState({ username: "", password: "" });
  const [regInput, setRegInput] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: "",
    role: "user" as "user" | "owner",
  });

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

  // Check login state
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const u = JSON.parse(userStr);
      setCurrentUser(u);
      
      // Auto-redirect for roles
      if (u.role === "admin") router.push("/admin");
      if (u.role === "owner") router.push("/owner");
    }
  }, [router]);

  // Clear messages
  const clearMessages = () => {
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!loginInput.username || !loginInput.password) {
      setErrorMsg(t.errUsernamePassword);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...loginInput, action: "login" }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.requireOtp) {
          setOtpUserId(data.userId);
          setOtpSentEmail(data.email);
          setOtpCodeHint(data.otp || "");
          setView("otp");
          setSuccessMsg(t.successOtpSent);
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          setCurrentUser(data.user);
          setSuccessMsg(t.successLogin);
          
          setTimeout(() => {
            if (data.user.role === "admin") router.push("/admin");
            else if (data.user.role === "owner") router.push("/owner");
            else {
              router.push("/");
              // Sync layout navbar
              window.dispatchEvent(new Event("storage"));
            }
          }, 1000);
        }
      } else {
        setErrorMsg(data.error || t.errInvalidLogin);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    const { name, surname, email, username, password, role } = regInput;
    if (!name || !surname || !email || !username || !password) {
      setErrorMsg(t.errAllFieldsRequired);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...regInput, action: "register" }),
      });
      const data = await res.json();

      if (res.ok) {
        if (role === "owner") {
          setOtpUserId(data.user.id);
          setOtpSentEmail(data.user.email);
          setOtpCodeHint(data.otp || "");
          setView("otp");
          setSuccessMsg(t.successRegOwner);
        } else {
          localStorage.setItem("user", JSON.stringify(data.user));
          setCurrentUser(data.user);
          setSuccessMsg(t.successRegClient);
          
          setTimeout(() => {
            router.push("/");
            // Sync layout navbar
            window.dispatchEvent(new Event("storage"));
          }, 1000);
        }
      } else {
        setErrorMsg(data.error || t.errRegFailed);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!otpCode) {
      setErrorMsg(t.errEnterOtp);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          userId: otpUserId,
          otp: otpCode,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccessMsg(t.successActivation);
        localStorage.setItem("user", JSON.stringify(data.user));
        setCurrentUser(data.user);
        setTimeout(() => {
          router.push("/owner");
          // Sync layout navbar
          window.dispatchEvent(new Event("storage"));
        }, 1500);
      } else {
        setErrorMsg(data.error || t.errInvalidOtp);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(t.errConnection);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    window.dispatchEvent(new Event("storage"));
    router.refresh();
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 bg-white" style={{ backgroundColor: "#ffffff" }}>
      {/* Premium Ambient Background Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-100/70 rounded-full filter blur-3xl opacity-60 mix-blend-multiply animate-pulse duration-[6000ms] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-green-50/90 rounded-full filter blur-3xl opacity-70 mix-blend-multiply animate-pulse duration-[8000ms] pointer-events-none"></div>
      <div className="absolute top-1/3 right-12 w-80 h-80 bg-teal-50/80 rounded-full filter blur-3xl opacity-50 mix-blend-multiply animate-pulse duration-[7000ms] pointer-events-none"></div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0fdf4_1px,transparent_1px),linear-gradient(to_bottom,#f0fdf4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 z-0 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md my-auto">
        <AnimatePresence mode="wait">
          {currentUser ? (
            /* ALREADY LOGGED IN VIEW */
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(4,120,87,0.06)] border border-slate-100 text-center"
            >
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm relative">
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <UserCheck className="w-10 h-10 text-emerald-800" />
              </div>

              <h1 className="text-2xl font-black text-slate-800 mb-1 leading-tight">
                {currentUser.name} {currentUser.surname}
              </h1>
              
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100/50 px-3.5 py-1 rounded-full w-fit mx-auto mb-8 shadow-xs">
                {t.roleLabel} {currentUser.role === "admin" ? t.roleAdmin : currentUser.role === "owner" ? t.roleOwner : t.roleUser}
              </p>

              <div className="space-y-3.5">
                {currentUser.role === "admin" && (
                  <button
                    onClick={() => router.push("/admin")}
                    className="w-full py-3.5 bg-gradient-to-br from-emerald-800 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <span>{t.adminPanelBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {currentUser.role === "owner" && (
                  <button
                    onClick={() => router.push("/owner")}
                    className="w-full py-3.5 bg-gradient-to-br from-emerald-800 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <span>{t.ownerPanelBtn}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 border border-red-100 text-red-500 hover:bg-red-50/50 active:scale-[0.99] font-bold rounded-xl transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t.logoutBtn}</span>
                </button>
              </div>
            </motion.div>
          ) : view === "otp" ? (
            /* OTP VERIFICATION VIEW */
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(4,120,87,0.06)] border border-slate-100"
            >
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100 shadow-sm">
                <Mail className="w-8 h-8 text-emerald-800" />
              </div>

              <h1 className="text-2xl font-black text-slate-800 text-center mb-2">
                {t.otpTitle}
              </h1>
              <p className="text-xs text-slate-500 text-center mb-6 leading-relaxed">
                {t.otpText.replace("{email}", otpSentEmail)}
              </p>

              {/* Success / Error Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 font-semibold flex items-center gap-2.5 shadow-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-sm">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder={t.otpPlaceholder}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full p-4 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 rounded-xl outline-none text-center font-bold tracking-widest text-xl focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                  />
                </div>

                {otpCodeHint && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100/30 rounded-xl text-center">
                    <p className="text-[10px] text-emerald-800 font-mono">
                      {t.testCode} <strong className="text-xs select-all">{otpCodeHint}</strong>
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-br from-emerald-800 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{t.activateAccountBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-6">
                <button
                  onClick={() => {
                    setView("login");
                    clearMessages();
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-emerald-800 transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t.backToLogin}</span>
                </button>
              </div>
            </motion.div>
          ) : view === "login" ? (
            /* LOGIN VIEW */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(4,120,87,0.06)] border border-slate-100"
            >
              <h1 className="text-2xl font-black text-slate-800 text-center mb-2">
                {t.welcomeTitle}
              </h1>
              <p className="text-xs text-slate-400 text-center mb-8">
                {t.welcomeText}
              </p>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 font-semibold flex items-center gap-2.5 shadow-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-sm">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.usernameLabel}
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t.usernamePlaceholder}
                      value={loginInput.username}
                      onChange={(e) => setLoginInput({ ...loginInput, username: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.passwordLabel}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginInput.password}
                      onChange={(e) => setLoginInput({ ...loginInput, password: e.target.value })}
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-br from-emerald-800 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{t.loginBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Auto-fill for Testing */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 text-center flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600 animate-pulse" />
                  <span>{t.quickAccountsTitle}</span>
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput({ username: "admin", password: "admin123" });
                      clearMessages();
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200/60 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
                  >
                    {t.adminRole}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput({ username: "sardor", password: "sardor123" });
                      clearMessages();
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200/60 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
                  >
                    {t.ownerRole}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput({ username: "shahzoda", password: "shahzoda123" });
                      clearMessages();
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200/60 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
                  >
                    {t.unverifiedOwnerRole}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginInput({ username: "norazayn", password: "norazayn01" });
                      clearMessages();
                    }}
                    className="px-2.5 py-1.5 text-[10px] font-bold text-slate-650 bg-slate-50 border border-slate-200/60 rounded-lg hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 transition cursor-pointer"
                  >
                    {t.clientRole}
                  </button>
                </div>
              </div>

              <div className="text-center mt-6 pt-5 border-t border-slate-100 text-xs text-slate-400">
                {t.newToSystem}{"  "}
                <button
                  onClick={() => {
                    setView("register");
                    clearMessages();
                  }}
                  className="text-emerald-800 font-bold hover:text-emerald-950 transition hover:underline cursor-pointer"
                >
                  {t.registerLink}
                </button>
              </div>
            </motion.div>
          ) : (
            /* REGISTER VIEW */
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-[0_20px_50px_rgba(4,120,87,0.06)] border border-slate-100"
            >
              <h1 className="text-2xl font-black text-slate-800 text-center mb-2">
                {t.registerTitle}
              </h1>
              <p className="text-xs text-slate-400 text-center mb-6">
                {t.registerSubtitle}
              </p>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs text-red-650 font-semibold flex items-center gap-2.5 shadow-sm">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-800 font-semibold flex items-center gap-2.5 shadow-sm">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                      {t.nameLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={regInput.name}
                      onChange={(e) => setRegInput({ ...regInput, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 pl-1">
                      {t.surnameLabel}
                    </label>
                    <input
                      type="text"
                      placeholder={t.surnamePlaceholder}
                      value={regInput.surname}
                      onChange={(e) => setRegInput({ ...regInput, surname: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.emailLabel}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      placeholder={t.emailPlaceholder}
                      value={regInput.email}
                      onChange={(e) => setRegInput({ ...regInput, email: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.usernameLabel} *
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder={t.usernamePlaceholder}
                      value={regInput.username}
                      onChange={(e) => setRegInput({ ...regInput, username: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.passwordLabel} *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regInput.password}
                      onChange={(e) => setRegInput({ ...regInput, password: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 placeholder-slate-400 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 pl-1">
                    {t.roleSelectionLabel}
                  </label>
                  <select
                    value={regInput.role}
                    onChange={(e) => setRegInput({ ...regInput, role: e.target.value as "user" | "owner" })}
                    className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200/80 text-slate-800 text-sm rounded-xl outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all duration-300 shadow-xs cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M7%209l3%203%203-3%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%221.5%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                  >
                    <option value="user">{t.roleClientOption}</option>
                    <option value="owner">{t.roleOwnerOption}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 mt-2 bg-gradient-to-br from-emerald-800 to-green-700 text-white font-bold rounded-xl shadow-lg hover:shadow-emerald-700/20 active:scale-[0.99] transition duration-200 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{t.registerTitle}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-8 pt-6 border-t border-slate-100 text-xs text-slate-400">
                {t.alreadyHaveAccount}{"  "}
                <button
                  onClick={() => {
                    setView("login");
                    clearMessages();
                  }}
                  className="text-emerald-800 font-bold hover:text-emerald-900 transition hover:underline cursor-pointer"
                >
                  {t.loginLink}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
