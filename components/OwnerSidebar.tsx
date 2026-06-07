"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { isValidPhoneNumber, formatPhoneNumber, formatDateStr } from "@/lib/utils";

interface OwnerSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

type UserType = {
  id: number;
  name: string;
  surname: string;
  role: string;
  email: string;
  username: string;
};

type ToyxonaType = {
  id: number;
  title: string;
  tuman: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  image: string;
  description: string;
  phoneNumber: string;
  ownerId: number;
  images?: string[];
  menu?: { suyuq: string[]; quyuq: string[]; images?: string[] };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
  karnaySurnay?: { mavjud: boolean; narx: string };
  mashinalar?: Array<{ brand: string; price: string; image?: string }>;
  currency?: "UZS" | "USD";
};

type BookingType = {
  id: number;
  toyxonaTitle: string;
  sana: string;
  odamSoni: number;
  status: string;
  user: { ism: string; familiya: string; raqam: string };
  xizmatlar: string[];
};

export default function OwnerSidebar({ isOpen, onClose }: OwnerSidebarProps) {
  const [user, setUser] = useState<UserType | null>(null);
  const [toyxona, setToyxona] = useState<ToyxonaType | null>(null);
  const [bookings, setBookings] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpCodeHint, setOtpCodeHint] = useState("");

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<ToyxonaType | null>(null);

  // Tab states for image uploads (file vs url)
  const [regMainImageTab, setRegMainImageTab] = useState<"file" | "url">("file");
  const [editMainImageTab, setEditMainImageTab] = useState<"file" | "url">("file");

  // Register state
  const [regToyxona, setRegToyxona] = useState({
    title: "",
    tuman: "Bektemir",
    price: "",
    capacity: "",
    location: "",
    description: "",
    phoneNumber: "",
    image: "",
    images: [] as string[],
    karnaySurnay: { mavjud: false, narx: "" },
    xonandalar: [] as Array<{ ism: string; narx: string; rasm?: string }>,
    mashinalar: [] as Array<{ brand: string; price: string; image?: string }>,
    menu: { suyuq: ["Sho'rva", "Mastava", "Chuchvara"], quyuq: ["Palov", "Somsa", "Qozon Kabob"], images: [] as string[] },
    currency: "UZS" as "UZS" | "USD"
  });

  const tumanlar = ["Bektemir", "Mirobod", "Mirzo Ulug'bek", "Olmazor", "Sergeli", "Uchtepa", "Yakkasaroy", "Yangihayot", "Yashnobod", "Yunusobod", "Shayxontohur", "Chilonzor"];

  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    };
    checkUser();
    window.addEventListener("storage", checkUser);
    return () => window.removeEventListener("storage", checkUser);
  }, []);

  const loadData = async (ownerId: number) => {
    setLoading(true);
    try {
      // Load Toyxona
      const res = await fetch(`/api/toyxonalar?ownerId=${ownerId}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const t = data[0];
          // Ensure all fields have fallback initial values for state
          const formattedT: ToyxonaType = {
            ...t,
            images: t.images || [],
            menu: {
              suyuq: t.menu?.suyuq || ["Sho'rva", "Mastava", "Chuchvara"],
              quyuq: t.menu?.quyuq || ["Palov", "Somsa", "Qozon Kabob"],
              images: t.menu?.images || []
            },
            xonandalar: t.xonandalar || [],
            karnaySurnay: t.karnaySurnay || { mavjud: false, narx: "" },
            mashinalar: t.mashinalar || []
          };
          setToyxona(formattedT);
          setEditForm(formattedT);
          // Load Bookings for this toyxona
          const bRes = await fetch(`/api/bookings?toyxonaId=${t.id}`);
          if (bRes.ok) {
            const bData = await bRes.json();
            setBookings(bData);
          }
        } else {
          setToyxona(null);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user?.id) {
      // Check verification status
      const checkUserFresh = async () => {
        setLoading(true);
        const res = await fetch(`/api/owners`);
        if (res.ok) {
          const owners = await res.json();
          const me = owners.find((o: any) => o.id === user.id);
          if (me && !me.verified) {
            setOtpSent(true);
            if (me.otp) {
              setOtpCodeHint(me.otp);
            }
            setLoading(false);
          } else {
            setOtpSent(false);
            loadData(user.id);
          }
        } else {
          setLoading(false);
        }
      };
      checkUserFresh();
    }
  }, [isOpen, user?.id]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) return;

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify-otp",
          userId: user?.id,
          otp: otpCode
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Akkauntingiz faollashtirildi!");
        setOtpSent(false);
        // Update user state
        const updatedUser = { ...user, verified: true } as UserType;
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        loadData(user!.id);
      } else {
        alert(data.error || "Kod noto'g'ri");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegisterToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regToyxona.title || !regToyxona.price || !regToyxona.capacity || !regToyxona.location || !regToyxona.phoneNumber) {
      alert("Majburiy maydonlarni to'ldiring");
      return;
    }

    if (!isValidPhoneNumber(regToyxona.phoneNumber)) {
      alert("Telefon raqami noto'g'ri formatda. Namuna: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(regToyxona.phoneNumber);

    const res = await fetch("/api/toyxonalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...regToyxona,
        phoneNumber: cleanPhone,
        ownerId: user?.id
      })
    });

    if (res.ok) {
      alert("To'yxona ro'yxatdan o'tkazildi! Admin tasdiqlashini kuting.");
      if (user?.id) loadData(user.id);
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const handleUpdateToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm) return;

    if (!isValidPhoneNumber(editForm.phoneNumber)) {
      alert("Telefon raqami noto'g'ri formatda. Namuna: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(editForm.phoneNumber);

    const res = await fetch("/api/toyxonalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        phoneNumber: cleanPhone
      })
    });

    if (res.ok) {
      alert("Ma'lumotlar saqlandi!");
      setIsEditing(false);
      if (user?.id) loadData(user.id);
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Ushbu bronni bekor qilmoqchimisiz?")) return;
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Bron bekor qilindi!");
      if (toyxona) {
        const bRes = await fetch(`/api/bookings?toyxonaId=${toyxona.id}`);
        if (bRes.ok) {
          const bData = await bRes.json();
          setBookings(bData);
        }
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    onClose();
    window.location.href = "/";
  };

  const addRegImage = () => {
    setRegToyxona(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }));
  };

  const changeRegImage = (index: number, val: string) => {
    setRegToyxona(prev => {
      const copy = [...prev.images];
      copy[index] = val;
      return { ...prev, images: copy };
    });
  };

  const removeRegImage = (index: number) => {
    setRegToyxona(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addRegSinger = () => {
    setRegToyxona(prev => ({
      ...prev,
      xonandalar: [...prev.xonandalar, { ism: "", narx: "" }]
    }));
  };

  const changeRegSinger = (index: number, field: "ism" | "narx" | "rasm", val: string) => {
    setRegToyxona(prev => {
      const copy = [...prev.xonandalar];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, xonandalar: copy };
    });
  };

  const removeRegSinger = (index: number) => {
    setRegToyxona(prev => ({
      ...prev,
      xonandalar: prev.xonandalar.filter((_, i) => i !== index)
    }));
  };

  const addRegCar = () => {
    setRegToyxona(prev => ({
      ...prev,
      mashinalar: [...prev.mashinalar, { brand: "", price: "" }]
    }));
  };

  const changeRegCar = (index: number, field: "brand" | "price" | "image", val: string) => {
    setRegToyxona(prev => {
      const copy = [...prev.mashinalar];
      copy[index] = { ...copy[index], [field]: val };
      return { ...prev, mashinalar: copy };
    });
  };

  const removeRegCar = (index: number) => {
    setRegToyxona(prev => ({
      ...prev,
      mashinalar: prev.mashinalar.filter((_, i) => i !== index)
    }));
  };

  const addEditImage = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      images: [...(editForm.images || []), ""]
    });
  };

  const changeEditImage = (index: number, val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.images || [])];
    copy[index] = val;
    setEditForm({ ...editForm, images: copy });
  };

  const removeEditImage = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      images: (editForm.images || []).filter((_, i) => i !== index)
    });
  };

  const addEditSinger = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      xonandalar: [...(editForm.xonandalar || []), { ism: "", narx: "" }]
    });
  };

  const changeEditSinger = (index: number, field: "ism" | "narx" | "rasm", val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.xonandalar || [])];
    copy[index] = { ...copy[index], [field]: val };
    setEditForm({ ...editForm, xonandalar: copy });
  };

  const removeEditSinger = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      xonandalar: (editForm.xonandalar || []).filter((_, i) => i !== index)
    });
  };

  const addEditCar = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      mashinalar: [...(editForm.mashinalar || []), { brand: "", price: "" }]
    });
  };

  const changeEditCar = (index: number, field: "brand" | "price" | "image", val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.mashinalar || [])];
    copy[index] = { ...copy[index], [field]: val };
    setEditForm({ ...editForm, mashinalar: copy });
  };

  const removeEditCar = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      mashinalar: (editForm.mashinalar || []).filter((_, i) => i !== index)
    });
  };

  // Menu Image Helpers for Register
  const addRegMenuImage = () => {
    setRegToyxona(prev => ({
      ...prev,
      menu: { ...prev.menu, images: [...(prev.menu.images || []), ""] }
    }));
  };

  const changeRegMenuImage = (index: number, val: string) => {
    setRegToyxona(prev => {
      const copy = [...(prev.menu.images || [])];
      copy[index] = val;
      return { ...prev, menu: { ...prev.menu, images: copy } };
    });
  };

  const removeRegMenuImage = (index: number) => {
    setRegToyxona(prev => ({
      ...prev,
      menu: { ...prev.menu, images: (prev.menu.images || []).filter((_, i) => i !== index) }
    }));
  };

  // Menu Image Helpers for Edit
  const addEditMenuImage = () => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      menu: { ...editForm.menu!, images: [...(editForm.menu?.images || []), ""] }
    });
  };

  const changeEditMenuImage = (index: number, val: string) => {
    if (!editForm) return;
    const copy = [...(editForm.menu?.images || [])];
    copy[index] = val;
    setEditForm({ ...editForm, menu: { ...editForm.menu!, images: copy } });
  };

  const removeEditMenuImage = (index: number) => {
    if (!editForm) return;
    setEditForm({
      ...editForm,
      menu: { ...editForm.menu!, images: (editForm.menu?.images || []).filter((_, i) => i !== index) }
    });
  };

  const handleRegMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setRegToyxona(prev => ({
        ...prev,
        menu: { ...prev.menu, images: [...(prev.menu.images || []), url] }
      }));
      alert("Menyu rasmi yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleEditMenuImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;
    setUploading(true);
    try {
      const url = await uploadFile(file);
      setEditForm({
        ...editForm,
        menu: { ...editForm.menu!, images: [...(editForm.menu?.images || []), url] }
      });
      alert("Menyu rasmi yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      throw new Error("Rasm yuklashda xatolik");
    }

    const data = await res.json();
    return data.url;
  };

  const handleRegMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setRegToyxona(prev => ({ ...prev, image: url }));
      alert("Asosiy rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const handleRegGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setRegToyxona(prev => ({
        ...prev,
        images: [...prev.images, url]
      }));
      alert("Galereya uchun rasm yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleEditMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setEditForm({ ...editForm, image: url });
      alert("Asosiy rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const handleEditGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editForm) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      setEditForm({
        ...editForm,
        images: [...(editForm.images || []), url]
      });
      alert("Galereya uchun rasm yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleBackButtonClick = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditForm(toyxona);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-50 cursor-default transition-all duration-300 animate-in fade-in"
        onClick={onClose}
      />

      {/* Sidebar container */}
      <div className="fixed top-0 right-0 h-full w-full bg-white border-l border-white shadow-2xl z-55 flex flex-col animate-in slide-in-from-right duration-350 ease-out text-slate-800" style={{ backgroundColor: "#ffffff" }}>
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackButtonClick}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-650 hover:text-emerald-850 hover:bg-slate-50 rounded-xl border border-slate-200 bg-white transition cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>ORQAGA QAYTISH</span>
            </button>
            <div className="border-l border-slate-200 h-6 mx-1"></div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">To'yxona Egasi Paneli</span>
              <h2 className="text-sm md:text-lg font-black text-green-950 uppercase tracking-wide leading-tight">
                {user?.name} {user?.surname}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-850 flex items-center justify-center transition border border-white cursor-pointer"
            title="Yopish"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-white" style={{ backgroundColor: "#ffffff" }}>
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold animate-pulse">
              Yuklanmoqda...
            </div>
          ) : otpSent ? (
            /* OTP VERIFICATION VIEW */
            <div className="max-w-md mx-auto w-full bg-white p-6 rounded-2xl border border-white text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-white select-none shadow-2xs">
                <svg className="w-8 h-8 text-emerald-850" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="font-bold text-lg text-green-950 mb-2">Akkauntni faollashtirish</h3>
              <p className="text-xs text-gray-500 mb-6">
                Elektron pochtangizga ({user?.email}) yuborilgan 6 xonali OTP kodingizni kiriting.
              </p>
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <input
                  type="text"
                  placeholder="OTP Kod (masalan: 123456)"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full p-3 border border-white bg-white rounded-xl outline-none text-center font-bold tracking-widest text-lg"
                />
                {otpCodeHint && (
                  <div className="p-3 bg-emerald-50/50 border border-emerald-100/30 rounded-xl text-center">
                    <p className="text-[10px] text-emerald-800 font-mono">
                      Test kodi: <strong className="text-xs select-all">{otpCodeHint}</strong>
                    </p>
                  </div>
                )}
                <button type="submit" className="w-full py-3 bg-green-950 text-white font-bold rounded-xl shadow-xs hover:bg-green-900 transition cursor-pointer">
                  Tasdiqlash
                </button>
              </form>
            </div>
          ) : !toyxona ? (
            /* TOYXONA RO'YXATDAN O'TKAZISH FORM */
            <div className="bg-white p-6 rounded-2xl border border-white max-w-2xl mx-auto w-full">
              <div className="text-center mb-8">
                <h3 className="font-bold text-xl text-green-950">To'yxonangizni ro'yxatdan o'tkazing</h3>
                <p className="text-xs text-gray-500 mt-1">Platformada to'yxonangizni ko'rsatish uchun quyidagi ma'lumotlarni to'ldiring</p>
              </div>
              <form onSubmit={handleRegisterToyxona} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">To'yxona nomi *</label>
                    <input
                      type="text"
                      placeholder="Nomi..."
                      value={regToyxona.title}
                      onChange={e => setRegToyxona({ ...regToyxona, title: e.target.value })}
                      className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Tuman (Rayon) *</label>
                    <select
                      value={regToyxona.tuman}
                      onChange={e => setRegToyxona({ ...regToyxona, tuman: e.target.value })}
                      className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                    >
                      {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">1 o'rindiq narxi *</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Narxi..."
                        value={regToyxona.price}
                        onChange={e => setRegToyxona({ ...regToyxona, price: e.target.value })}
                        className="flex-1 p-2.5 border border-slate-200 bg-white rounded-xl outline-none text-xs text-slate-800"
                      />
                      <select
                        value={regToyxona.currency || "UZS"}
                        onChange={e => setRegToyxona({ ...regToyxona, currency: e.target.value as "UZS" | "USD" })}
                        className="p-2.5 border border-slate-200 bg-white rounded-xl outline-none text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        <option value="UZS">UZS (so'm)</option>
                        <option value="USD">USD ($)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Zal sig'imi (kishi) *</label>
                    <input
                      type="number"
                      placeholder="Sig'im..."
                      value={regToyxona.capacity}
                      onChange={e => setRegToyxona({ ...regToyxona, capacity: e.target.value })}
                      className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Telefon raqam *</label>
                  <input
                    type="text"
                    placeholder="+998..."
                    value={regToyxona.phoneNumber}
                    onChange={e => setRegToyxona({ ...regToyxona, phoneNumber: e.target.value })}
                    className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Batafsil manzil *</label>
                  <input
                    type="text"
                    placeholder="Manzil..."
                    value={regToyxona.location}
                    onChange={e => setRegToyxona({ ...regToyxona, location: e.target.value })}
                    className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5">Asosiy rasm *</label>
                  <div className="flex gap-2 mb-2 p-1 bg-slate-50 border border-slate-200 rounded-xl max-w-xs">
                    <button
                      type="button"
                      onClick={() => setRegMainImageTab("file")}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        regMainImageTab === "file" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                      }`}
                    >
                      Kompyuterdan
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegMainImageTab("url")}
                      className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                        regMainImageTab === "url" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                      }`}
                    >
                      URL orqali
                    </button>
                  </div>

                  {regMainImageTab === "file" ? (
                    <div className="flex items-center gap-3">
                      <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-slate-350 hover:border-emerald-600 rounded-2xl cursor-pointer bg-white transition hover:bg-slate-50">
                        <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span className="text-xs font-bold text-gray-500">Rasm faylini tanlang</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRegMainImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      {regToyxona.image && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                          <Image src={regToyxona.image} alt="Preview" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                          <button
                            type="button"
                            onClick={() => setRegToyxona(prev => ({ ...prev, image: "" }))}
                            className="absolute top-0.5 right-0.5 bg-red-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] hover:bg-red-750 transition"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Rasm URL manzili (https://...)"
                      value={regToyxona.image}
                      onChange={e => setRegToyxona({ ...regToyxona, image: e.target.value })}
                      className="w-full p-2.5 border border-slate-250 bg-white rounded-xl outline-none text-xs text-slate-800"
                    />
                  )}
                  {uploading && regMainImageTab === "file" && (
                    <p className="text-[10px] text-emerald-800 font-bold mt-1 animate-pulse">Yuklanmoqda, iltimos kuting...</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tavsif</label>
                  <textarea
                    placeholder="Tafsilotlar yozing..."
                    value={regToyxona.description}
                    onChange={e => setRegToyxona({ ...regToyxona, description: e.target.value })}
                    className="w-full p-2.5 border border-white bg-white rounded-xl outline-none resize-none"
                    rows={3}
                  ></textarea>
                </div>

                {/* Taomlar Menyusi */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                  <label className="block text-xs font-bold text-gray-500">Taomlar Menyusi</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Suyuq taomlar (vergul bilan ajrating)</label>
                      <input
                        type="text"
                        placeholder="Mastava, Sho'rva..."
                        value={regToyxona.menu.suyuq.join(", ")}
                        onChange={e => setRegToyxona({
                          ...regToyxona,
                          menu: { ...regToyxona.menu, suyuq: e.target.value.split(",").map(x => x.trim()) }
                        })}
                        className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Quyuq taomlar (vergul bilan ajrating)</label>
                      <input
                        type="text"
                        placeholder="Palov, Somsa..."
                        value={regToyxona.menu.quyuq.join(", ")}
                        onChange={e => setRegToyxona({
                          ...regToyxona,
                          menu: { ...regToyxona.menu, quyuq: e.target.value.split(",").map(x => x.trim()) }
                        })}
                        className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  {/* Menyu rasmlari galereyasi */}
                  <div className="border-t border-slate-50 pt-3 space-y-3">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] font-bold text-gray-400">Menyu rasmlari (2 xil usulda yuklash)</label>
                      <div className="flex gap-2">
                        <label className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Kompyuterdan</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleRegMenuImageUpload}
                            className="hidden"
                            disabled={uploading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={addRegMenuImage}
                          className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer border border-emerald-100 px-2 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50"
                        >
                          + URL qo'shish
                        </button>
                      </div>
                    </div>
                    {(regToyxona.menu.images || []).map((img, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                          {img ? (
                            <Image src={img} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-gray-400">Yo'q</div>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Rasm URL (https://...)"
                          value={img}
                          onChange={e => changeRegMenuImage(index, e.target.value)}
                          className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                        />
                        <button type="button" onClick={() => removeRegMenuImage(index)} className="text-red-650 hover:text-red-750 font-bold text-xs p-1 cursor-pointer">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Karnay-Surnay */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 font-semibold text-xs text-gray-650 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={regToyxona.karnaySurnay.mavjud}
                      onChange={e => setRegToyxona({
                        ...regToyxona,
                        karnaySurnay: { ...regToyxona.karnaySurnay, mavjud: e.target.checked }
                      })}
                      className="accent-green-950 cursor-pointer"
                    />
                    <span>Karnay-surnay xizmati mavjud</span>
                  </label>
                  {regToyxona.karnaySurnay.mavjud && (
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 mb-1">Karnay-surnay narxi (so'm) *</label>
                      <input
                        type="text"
                        placeholder="Masalan: 2,000,000"
                        value={regToyxona.karnaySurnay.narx}
                        onChange={e => setRegToyxona({
                          ...regToyxona,
                          karnaySurnay: { ...regToyxona.karnaySurnay, narx: e.target.value }
                        })}
                        className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                      />
                    </div>
                  )}
                </div>

                {/* Qo'shimcha rasmlar (Galereya) */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-500">Qo'shimcha rasmlar (Galereya)</label>
                    <div className="flex gap-2">
                      <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2.5 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Kompyuterdan rasm yuklash</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleRegGalleryImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={addRegImage}
                        className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer border border-emerald-100 px-2.5 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50"
                      >
                        + URL qo'shish
                      </button>
                    </div>
                  </div>
                  {regToyxona.images.map((img, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                        {img ? (
                          <Image src={img} alt="Preview" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-gray-400">Yo'q</div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Rasm URL (https://...)"
                        value={img}
                        onChange={e => changeRegImage(index, e.target.value)}
                        className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                      />
                      <button type="button" onClick={() => removeRegImage(index)} className="text-red-650 hover:text-red-750 font-bold text-xs p-2 cursor-pointer">
                        O'chirish
                      </button>
                    </div>
                  ))}
                  {uploading && (
                    <p className="text-[10px] text-emerald-850 font-bold animate-pulse">Kompyuterdan rasm yuklanmoqda...</p>
                  )}
                </div>

                {/* San'atkorlar (Xonandalar) */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-500">Taklif etiladigan san'atkorlar (Xonandalar)</label>
                    <button type="button" onClick={addRegSinger} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                      + San'atkor qo'shish
                    </button>
                  </div>
                  {regToyxona.xonandalar.map((s, index) => (
                    <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Ism..."
                          value={s.ism}
                          onChange={e => changeRegSinger(index, "ism", e.target.value)}
                          className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Narx..."
                            value={s.narx}
                            onChange={e => changeRegSinger(index, "narx", e.target.value)}
                            className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                          />
                          <button type="button" onClick={() => removeRegSinger(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {/* Rasm yuklash (URL + Fayl) */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          {s.rasm ? (
                            <Image src={s.rasm} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">Rasm</div>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Rasm URL (https://...)"
                          value={s.rasm || ""}
                          onChange={e => changeRegSinger(index, "rasm", e.target.value)}
                          className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                        />
                        <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-2 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              try {
                                const url = await uploadFile(file);
                                changeRegSinger(index, "rasm", url);
                              } catch (err) {
                                alert("Yuklashda xatolik yuz berdi");
                              } finally {
                                setUploading(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hashamatli Mashinalar */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-500">Kortej xizmati uchun mashinalar</label>
                    <button type="button" onClick={addRegCar} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                      + Mashina qo'shish
                    </button>
                  </div>
                  {regToyxona.mashinalar.map((c, index) => (
                    <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Mashina rusumi..."
                          value={c.brand}
                          onChange={e => changeRegCar(index, "brand", e.target.value)}
                          className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Narx..."
                            value={c.price}
                            onChange={e => changeRegCar(index, "price", e.target.value)}
                            className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                          />
                          <button type="button" onClick={() => removeRegCar(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Rasm yuklash (URL + Fayl) */}
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          {c.image ? (
                            <Image src={c.image} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">Rasm</div>
                          )}
                        </div>
                        <input
                          type="text"
                          placeholder="Rasm URL (https://...)"
                          value={c.image || ""}
                          onChange={e => changeRegCar(index, "image", e.target.value)}
                          className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                        />
                        <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-2 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              setUploading(true);
                              try {
                                const url = await uploadFile(file);
                                changeRegCar(index, "image", url);
                              } catch (err) {
                                alert("Yuklashda xatolik yuz berdi");
                              } finally {
                                setUploading(false);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="submit" className="w-full py-3 bg-green-950 text-white font-bold rounded-xl shadow-xs hover:bg-green-900 transition cursor-pointer">
                  Ro'yxatdan o'tkazish
                </button>
              </form>
            </div>
          ) : (
            /* MAIN DASHBOARD (EDIT TOYXONA AND LIST BOOKINGS) */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1 & 2: Edit Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-white shadow-xs">
                  <div className="flex justify-between items-center mb-6 border-b border-white pb-3">
                    <h3 className="font-bold text-lg text-green-950">To'yxona ma'lumotlari</h3>
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${toyxona.status === "tasdiqlangan" ? "bg-white text-green-800 border border-white" : "bg-white text-yellow-800 border border-white"}`}>
                      Status: {toyxona.status}
                    </span>
                  </div>

                  {isEditing && editForm ? (
                    <form onSubmit={handleUpdateToyxona} className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">To'yxona nomi</label>
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full p-2 border border-white bg-white rounded-xl outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Rayon</label>
                          <select
                            value={editForm.tuman}
                            onChange={e => setEditForm({ ...editForm, tuman: e.target.value })}
                            className="w-full p-2 border border-white bg-white rounded-xl outline-none"
                          >
                            {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Narx (1 o'rindiq) *</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={editForm.price}
                              onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                              className="flex-1 p-2.5 border border-slate-200 bg-white rounded-xl outline-none text-xs text-slate-800"
                            />
                            <select
                              value={editForm.currency || "UZS"}
                              onChange={e => setEditForm({ ...editForm, currency: e.target.value as "UZS" | "USD" })}
                              className="p-2.5 border border-slate-200 bg-white rounded-xl outline-none text-xs font-bold text-slate-700 cursor-pointer"
                            >
                              <option value="UZS">UZS (so'm)</option>
                              <option value="USD">USD ($)</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Sig'im (kishi)</label>
                          <input
                            type="number"
                            value={editForm.capacity}
                            onChange={e => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
                            className="w-full p-2 border border-white bg-white rounded-xl outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Telefon raqam</label>
                        <input
                          type="text"
                          value={editForm.phoneNumber}
                          onChange={e => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                          className="w-full p-2 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Manzil</label>
                        <input
                          type="text"
                          value={editForm.location}
                          onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                          className="w-full p-2 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Tavsif</label>
                        <textarea
                          value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full p-2 border border-white bg-white rounded-xl outline-none resize-none"
                          rows={3}
                        ></textarea>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Asosiy rasm *</label>
                        <div className="flex gap-2 mb-2 p-1 bg-slate-50 border border-slate-200 rounded-xl max-w-xs">
                          <button
                            type="button"
                            onClick={() => setEditMainImageTab("file")}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              editMainImageTab === "file" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                            }`}
                          >
                            Kompyuterdan
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditMainImageTab("url")}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                              editMainImageTab === "url" ? "bg-white text-green-950 shadow-2xs" : "text-gray-500 hover:text-slate-800"
                            }`}
                          >
                            URL orqali
                          </button>
                        </div>

                        {editMainImageTab === "file" ? (
                          <div className="flex items-center gap-3">
                            <label className="flex-1 flex flex-col items-center justify-center p-4 border border-dashed border-slate-350 hover:border-emerald-600 rounded-2xl cursor-pointer bg-white transition hover:bg-slate-50">
                              <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span className="text-xs font-bold text-gray-500">Rasm faylini tanlang</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditMainImageUpload}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                            {editForm.image && (
                              <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shrink-0">
                                <Image src={editForm.image} alt="Preview" width={64} height={64} className="w-full h-full object-cover" unoptimized />
                                <button
                                  type="button"
                                  onClick={() => setEditForm(prev => prev ? ({ ...prev, image: "" }) : null)}
                                  className="absolute top-0.5 right-0.5 bg-red-650 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] hover:bg-red-750 transition"
                                >
                                  ✕
                                </button>
                              </div>
                            )}
                          </div>
                        ) : (
                          <input
                            type="text"
                            placeholder="Rasm URL manzili (https://...)"
                            value={editForm.image}
                            onChange={e => setEditForm({ ...editForm, image: e.target.value })}
                            className="w-full p-2 border border-slate-250 bg-white rounded-xl outline-none text-xs text-slate-800"
                          />
                        )}
                        {uploading && editMainImageTab === "file" && (
                          <p className="text-[10px] text-emerald-800 font-bold mt-1 animate-pulse">Yuklanmoqda, iltimos kuting...</p>
                        )}
                      </div>

                      {/* Taomlar Menyusi */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                        <label className="block text-xs font-bold text-gray-500">Taomlar Menyusi</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Suyuq taomlar (vergul bilan ajrating)</label>
                            <input
                              type="text"
                              placeholder="Mastava, Sho'rva..."
                              value={(editForm.menu?.suyuq || []).join(", ")}
                              onChange={e => setEditForm({
                                ...editForm,
                                menu: { suyuq: e.target.value.split(",").map(x => x.trim()), quyuq: editForm.menu?.quyuq || [], images: editForm.menu?.images || [] }
                              })}
                              className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Quyuq taomlar (vergul bilan ajrating)</label>
                            <input
                              type="text"
                              placeholder="Palov, Somsa..."
                              value={(editForm.menu?.quyuq || []).join(", ")}
                              onChange={e => setEditForm({
                                ...editForm,
                                menu: { suyuq: editForm.menu?.suyuq || [], quyuq: e.target.value.split(",").map(x => x.trim()), images: editForm.menu?.images || [] }
                              })}
                              className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                          </div>
                        </div>

                        {/* Menyu rasmlari galereyasi */}
                        <div className="border-t border-slate-50 pt-3 space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="block text-[10px] font-bold text-gray-400">Menyu rasmlari (2 xil usulda yuklash)</label>
                            <div className="flex gap-2">
                              <label className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <span>Kompyuterdan</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleEditMenuImageUpload}
                                  className="hidden"
                                  disabled={uploading}
                                />
                              </label>
                              <button
                                type="button"
                                onClick={addEditMenuImage}
                                className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer border border-emerald-100 px-2 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50"
                              >
                                + URL qo'shish
                              </button>
                            </div>
                          </div>
                          {(editForm.menu?.images || []).map((img, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                {img ? (
                                  <Image src={img} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                  <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[8px] text-gray-400">Yo'q</div>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Rasm URL (https://...)"
                                value={img}
                                onChange={e => changeEditMenuImage(index, e.target.value)}
                                className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <button type="button" onClick={() => removeEditMenuImage(index)} className="text-red-650 hover:text-red-750 font-bold text-xs p-1 cursor-pointer">
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Karnay-Surnay */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                        <label className="flex items-center gap-2 font-semibold text-xs text-gray-650 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!editForm.karnaySurnay?.mavjud}
                            onChange={e => setEditForm({
                              ...editForm,
                              karnaySurnay: { mavjud: e.target.checked, narx: editForm.karnaySurnay?.narx || "" }
                            })}
                            className="accent-green-950 cursor-pointer"
                          />
                          <span>Karnay-surnay xizmati mavjud</span>
                        </label>
                        {editForm.karnaySurnay?.mavjud && (
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 mb-1">Karnay-surnay narxi (so'm) *</label>
                            <input
                              type="text"
                              placeholder="Masalan: 2,000,000"
                              value={editForm.karnaySurnay.narx}
                              onChange={e => setEditForm({
                                ...editForm,
                                karnaySurnay: { mavjud: editForm.karnaySurnay?.mavjud ?? false, narx: e.target.value }
                              })}
                              className="w-full p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                          </div>
                        )}
                      </div>

                      {/* Qo'shimcha rasmlar (Galereya) */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-gray-500">Qo'shimcha rasmlar (Galereya)</label>
                          <div className="flex gap-2">
                            <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2.5 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                              <span>Kompyuterdan rasm yuklash</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleEditGalleryImageUpload}
                                className="hidden"
                                disabled={uploading}
                              />
                            </label>
                            <button
                              type="button"
                              onClick={addEditImage}
                              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer border border-emerald-100 px-2.5 py-1 rounded-lg bg-emerald-50/20 hover:bg-emerald-50"
                            >
                              + URL qo'shish
                            </button>
                          </div>
                        </div>
                        {(editForm.images || []).map((img, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                              {img ? (
                                <Image src={img} alt="Preview" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                              ) : (
                                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-[10px] text-gray-400">Yo'q</div>
                              )}
                            </div>
                            <input
                              type="text"
                              placeholder="Rasm URL (https://...)"
                              value={img}
                              onChange={e => changeEditImage(index, e.target.value)}
                              className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                            <button type="button" onClick={() => removeEditImage(index)} className="text-red-650 hover:text-red-750 font-bold text-xs p-2 cursor-pointer">
                              O'chirish
                            </button>
                          </div>
                        ))}
                        {uploading && (
                          <p className="text-[10px] text-emerald-850 font-bold animate-pulse">Kompyuterdan rasm yuklanmoqda...</p>
                        )}
                      </div>

                      {/* San'atkorlar (Xonandalar) */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-gray-500">Taklif etiladigan san'atkorlar (Xonandalar)</label>
                          <button type="button" onClick={addEditSinger} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                            + San'atkor qo'shish
                          </button>
                        </div>
                        {(editForm.xonandalar || []).map((s, index) => (
                          <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Ism..."
                                value={s.ism}
                                onChange={e => changeEditSinger(index, "ism", e.target.value)}
                                className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Narx..."
                                  value={s.narx}
                                  onChange={e => changeEditSinger(index, "narx", e.target.value)}
                                  className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                                />
                                <button type="button" onClick={() => removeEditSinger(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                                  ✕
                                </button>
                              </div>
                            </div>
                            
                            {/* Rasm yuklash (URL + Fayl) */}
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                                {s.rasm ? (
                                  <Image src={s.rasm} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">Rasm</div>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Rasm URL (https://...)"
                                value={s.rasm || ""}
                                onChange={e => changeEditSinger(index, "rasm", e.target.value)}
                                className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-2 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading(true);
                                    try {
                                      const url = await uploadFile(file);
                                      changeEditSinger(index, "rasm", url);
                                    } catch (err) {
                                      alert("Yuklashda xatolik yuz berdi");
                                    } finally {
                                      setUploading(false);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Hashamatli Mashinalar */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-gray-500">Kortej xizmati uchun mashinalar</label>
                          <button type="button" onClick={addEditCar} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                            + Mashina qo'shish
                          </button>
                        </div>
                        {(editForm.mashinalar || []).map((c, index) => (
                          <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                            <div className="grid grid-cols-2 gap-2">
                              <input
                                type="text"
                                placeholder="Mashina rusumi..."
                                value={c.brand}
                                onChange={e => changeEditCar(index, "brand", e.target.value)}
                                className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Narx..."
                                  value={c.price}
                                  onChange={e => changeEditCar(index, "price", e.target.value)}
                                  className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                                />
                                <button type="button" onClick={() => removeEditCar(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                                  ✕
                                </button>
                              </div>
                            </div>

                            {/* Rasm yuklash (URL + Fayl) */}
                            <div className="flex items-center gap-2">
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                                {c.image ? (
                                  <Image src={c.image} alt="Preview" width={32} height={32} className="w-full h-full object-cover" unoptimized />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">Rasm</div>
                                )}
                              </div>
                              <input
                                type="text"
                                placeholder="Rasm URL (https://...)"
                                value={c.image || ""}
                                onChange={e => changeEditCar(index, "image", e.target.value)}
                                className="flex-1 p-1.5 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <label className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer flex items-center gap-1 border border-emerald-100 px-2 py-2 rounded-lg bg-emerald-50/20 hover:bg-emerald-50">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                </svg>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading(true);
                                    try {
                                      const url = await uploadFile(file);
                                      changeEditCar(index, "image", url);
                                    } catch (err) {
                                      alert("Yuklashda xatolik yuz berdi");
                                    } finally {
                                      setUploading(false);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-4 pt-2">
                        <button type="submit" className="px-6 py-2 bg-green-950 text-white rounded-xl font-bold shadow-xs cursor-pointer">
                          Saqlash
                        </button>
                        <button type="button" onClick={() => { setIsEditing(false); setEditForm(toyxona); }} className="px-6 py-2 border border-white text-gray-600 rounded-xl font-bold cursor-pointer">
                          Bekor qilish
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-4 text-sm">
                      <div className="flex flex-col md:flex-row gap-4">
                        <Image src={toyxona.image} alt={toyxona.title} width={96} height={96} className="w-24 h-24 object-cover rounded-xl border border-white" unoptimized />
                        <div>
                          <h4 className="font-bold text-base text-green-950">{toyxona.title}</h4>
                          <p className="text-xs text-gray-500">{toyxona.location}</p>
                          <div className="flex gap-4 text-xs font-semibold text-gray-700 mt-2">
                            <span>Sig'im: {toyxona.capacity} kishi</span>
                            <span>Narxi: {toyxona.price.toLocaleString()} {toyxona.currency === "USD" ? "$" : "so'm"}</span>
                          </div>
                          <p className="text-xs text-gray-600 mt-3">{toyxona.description}</p>
                        </div>
                      </div>
                      <button onClick={() => setIsEditing(true)} className="px-6 py-2.5 bg-green-950 text-white rounded-xl font-semibold hover:bg-green-900 transition shadow-xs w-full mt-4 cursor-pointer">
                        Ma'lumotlarni o'zgartirish
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3: Bookings list */}
              <div>
                <div className="bg-white p-6 rounded-2xl border border-white shadow-xs">
                  <h3 className="font-bold text-lg text-green-950 mb-4 border-b border-white pb-2">Bronlar ro'yxati</h3>
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {bookings.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">Sizning to'yxonangizda bronlar yo'q</div>
                    ) : (
                      bookings.map(b => (
                        <div key={b.id} className="p-4 border border-white rounded-xl bg-white flex flex-col justify-between gap-3 text-[11px]">
                          <div className="flex justify-between items-center border-b border-white pb-2">
                            <span className="font-bold text-green-950 text-xs">{formatDateStr(b.sana, "uz")}</span>
                            <span className={`font-bold px-2 py-0.5 rounded-full ${b.status === "bo'lib o'tgan" ? "bg-white text-gray-500 border border-white" : "bg-white text-green-800 border border-white"}`}>
                              {b.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="font-semibold">Mijoz: {b.user.ism} {b.user.familiya}</p>
                            <p className="text-gray-500">Tel: {b.user.raqam}</p>
                            <p className="text-gray-500">Odam soni: <span className="font-bold text-gray-800">{b.odamSoni} kishi</span></p>
                            {b.xizmatlar.length > 0 && (
                              <p className="text-gray-550">Qo'shimcha: {b.xizmatlar.join(", ")}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="w-full py-1.5 bg-white text-red-600 font-bold border border-white hover:bg-slate-50 transition rounded-lg cursor-pointer"
                          >
                            Bekor qilish
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* Footer Actions (Logout) */}
        <div className="border-t border-slate-100 p-6 shrink-0 bg-white flex justify-end">
          <button
            onClick={handleLogout}
            className="w-full md:w-auto px-6 py-3 border border-red-200 hover:bg-red-50/30 hover:border-red-300 text-red-600 hover:text-red-700 font-black uppercase tracking-wider text-xs rounded-2xl transition duration-200 shadow-2xs hover:shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Chiqish (Logout)
          </button>
        </div>
      </div>
    </>
  );
}
