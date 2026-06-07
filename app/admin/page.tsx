"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { isValidPhoneNumber, formatPhoneNumber, formatDateStr } from "@/lib/utils";
import { getDistrictSlug } from "@/lib/districts";

type TabType = "toyxonalar" | "egalar" | "bronlar" | "add_toyxona" | "add_owner" | "xabarlar";

type AdminMessageType = {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  name: string;
  phone: string;
  message: string;
  sentAt: string;
  isAdminMessage: boolean;
  subject?: string;
};

type ToyxonaItem = {
  id: number;
  title: string;
  tuman: string;
  location: string;
  capacity: number;
  price: number;
  status: string;
  image: string;
  images?: string[];
  imagesStr?: string;
  ownerId: number | null;
  phoneNumber: string;
  description: string;
  currency?: "UZS" | "USD";
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
  karnaySurnay?: { mavjud: boolean; narx: string };
  mashinalar?: Array<{ brand: string; price: string; image?: string }>;
  menu?: { suyuq: string[]; quyuq: string[]; images?: string[] };
};

type OwnerItem = {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  verified: boolean;
};

type BookingItem = {
  id: number;
  toyxonaTitle: string;
  sana: string;
  odamSoni: number;
  status: string;
  user: { ism: string; familiya: string; raqam: string };
};

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("toyxonalar");
  const [editingToyxona, setEditingToyxona] = useState<ToyxonaItem | null>(null);

  // Data states
  const [toyxonalar, setToyxonalar] = useState<ToyxonaItem[]>([]);
  const [owners, setOwners] = useState<OwnerItem[]>([]);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [adminMessages, setAdminMessages] = useState<AdminMessageType[]>([]);
  const [replyTexts, setReplyTexts] = useState<Record<number, string>>({});
  const [adminId, setAdminId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTuman, setFilterTuman] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");

  // Booking filters
  const [bookingFilterTuman, setBookingFilterTuman] = useState("all");
  const [bookingFilterStatus, setBookingFilterStatus] = useState("all");
  const [bookingFilterToyxona, setBookingFilterToyxona] = useState("all");
  const [bookingSortBy, setBookingSortBy] = useState("sana");
  const [bookingSortOrder, setBookingSortOrder] = useState("asc");

  // Form states - Add Toyxona
  const [newToyxona, setNewToyxona] = useState({
    title: "",
    tuman: "Bektemir",
    price: "",
    capacity: "",
    location: "",
    description: "",
    phoneNumber: "",
    image: "",
    imagesStr: "", // Comma-separated
    ownerId: "",
    currency: "UZS" as "UZS" | "USD",
    xonandalar: [] as Array<{ ism: string; narx: string; rasm?: string }>,
    karnaySurnay: { mavjud: false, narx: "" },
    mashinalar: [] as Array<{ brand: string; price: string; image?: string }>,
    menu: { suyuq: ["Sho'rva", "Mastava", "Chuchvara"], quyuq: ["Palov", "Somsa", "Qozon Kabob"], images: [] as string[] }
  });

  // Form states - Add Owner
  const [newOwner, setNewOwner] = useState({
    name: "",
    surname: "",
    email: "",
    username: "",
    password: ""
  });

  const tumanlar = [
    "Bektemir",
    "Mirobod",
    "Mirzo Ulug'bek",
    "Olmazor",
    "Sergeli",
    "Uchtepa",
    "Yakkasaroy",
    "Yangihayot",
    "Yashnobod",
    "Yunusobod",
    "Shayxontohur",
    "Chilonzor"
  ];

  // Auth check
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      router.replace("/account");
      return;
    }
    const user = JSON.parse(userStr);
    if (user.role !== "admin") {
      router.replace("/account");
      return;
    }
    setAdminId(user.id);
    setAuthorized(true);
  }, [router]);

  // Read tab parameter from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab") as TabType;
    if (tabParam && ["toyxonalar", "egalar", "bronlar", "add_toyxona", "add_owner", "xabarlar"].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Load functions
  const loadToyxonalar = async () => {
    const url = `/api/toyxonalar?tuman=${filterTuman === "all" ? "" : filterTuman}&status=${filterStatus === "all" ? "" : filterStatus}&search=${searchQuery}&sortBy=${sortBy}&order=${sortOrder}`;
    const res = await fetch(url);
    const data = await res.json();
    setToyxonalar(data);
  };

  const loadOwners = async () => {
    const res = await fetch("/api/owners");
    const data = await res.json();
    setOwners(data);
  };

  const loadBookings = async () => {
    const url = `/api/bookings?tuman=${bookingFilterTuman === "all" ? "" : bookingFilterTuman}&status=${bookingFilterStatus === "all" ? "" : bookingFilterStatus}&toyxonaId=${bookingFilterToyxona === "all" ? "" : bookingFilterToyxona}&sortBy=${bookingSortBy}&order=${bookingSortOrder}`;
    const res = await fetch(url);
    const data = await res.json();
    setBookings(data);
  };

  const loadAdminMessages = async () => {
    try {
      const res = await fetch("/api/contact");
      if (res.ok) {
        const data = await res.json();
        setAdminMessages(data);
      }
    } catch (err) {
      console.error("Xabarlarni yuklashda xatolik:", err);
    }
  };

  const handleSendReply = async (msgId: number, receiverId: number, userName: string) => {
    const text = replyTexts[msgId];
    if (!text || !text.trim()) {
      alert("Javob matnini kiriting");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Administrator",
          phone: "Tizim",
          message: text.trim(),
          senderId: adminId,
          receiverId,
          isAdminMessage: true
        })
      });

      if (res.ok) {
        alert("Javob yuborildi!");
        setReplyTexts(prev => ({ ...prev, [msgId]: "" }));
        loadAdminMessages();
      } else {
        alert("Xatolik yuz berdi");
      }
    } catch (err) {
      alert("Xatolik yuz berdi");
    }
  };

  // Sync data when tab/filters change
  useEffect(() => {
    if (!authorized) return;
    setLoading(true);
    Promise.all([loadToyxonalar(), loadOwners(), loadBookings(), loadAdminMessages()]).then(() => {
      setLoading(false);
    });
  }, [
    authorized,
    activeTab,
    filterTuman,
    filterStatus,
    searchQuery,
    sortBy,
    sortOrder,
    bookingFilterTuman,
    bookingFilterStatus,
    bookingFilterToyxona,
    bookingSortBy,
    bookingSortOrder
  ]);

  const [uploading, setUploading] = useState(false);

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

  const handleMainImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (isEdit && editingToyxona) {
        setEditingToyxona({ ...editingToyxona, image: url });
      } else {
        setNewToyxona(prev => ({ ...prev, image: url }));
      }
      alert("Asosiy rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadFile(file);
      if (isEdit && editingToyxona) {
        const current = editingToyxona.imagesStr ? editingToyxona.imagesStr.trim() : "";
        const updated = current ? `${current}, ${url}` : url;
        setEditingToyxona({ ...editingToyxona, imagesStr: updated });
      } else {
        const current = newToyxona.imagesStr ? newToyxona.imagesStr.trim() : "";
        const updated = current ? `${current}, ${url}` : url;
        setNewToyxona(prev => ({ ...prev, imagesStr: updated }));
      }
      alert("Qo'shimcha rasm muvaffaqiyatli yuklandi!");
    } catch (err) {
      alert("Yuklashda xatolik yuz berdi");
    } finally {
      setUploading(false);
    }
  };

  // Dynamic Singer & Car handlers for newToyxona
  const addNewSinger = () => {
    setNewToyxona(prev => ({
      ...prev,
      xonandalar: [...prev.xonandalar, { ism: "", narx: "", rasm: "" }]
    }));
  };

  const changeNewSinger = (index: number, key: string, value: string) => {
    setNewToyxona(prev => {
      const copy = [...prev.xonandalar];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, xonandalar: copy };
    });
  };

  const removeNewSinger = (index: number) => {
    setNewToyxona(prev => ({
      ...prev,
      xonandalar: prev.xonandalar.filter((_, i) => i !== index)
    }));
  };

  const addNewCar = () => {
    setNewToyxona(prev => ({
      ...prev,
      mashinalar: [...prev.mashinalar, { brand: "", price: "", image: "" }]
    }));
  };

  const changeNewCar = (index: number, key: string, value: string) => {
    setNewToyxona(prev => {
      const copy = [...prev.mashinalar];
      copy[index] = { ...copy[index], [key]: value };
      return { ...prev, mashinalar: copy };
    });
  };

  const removeNewCar = (index: number) => {
    setNewToyxona(prev => ({
      ...prev,
      mashinalar: prev.mashinalar.filter((_, i) => i !== index)
    }));
  };

  // Dynamic Singer & Car handlers for editingToyxona
  const addEditSinger = () => {
    if (!editingToyxona) return;
    setEditingToyxona({
      ...editingToyxona,
      xonandalar: [...(editingToyxona.xonandalar || []), { ism: "", narx: "", rasm: "" }]
    });
  };

  const changeEditSinger = (index: number, key: string, value: string) => {
    if (!editingToyxona) return;
    const copy = [...(editingToyxona.xonandalar || [])];
    copy[index] = { ...copy[index], [key]: value };
    setEditingToyxona({ ...editingToyxona, xonandalar: copy });
  };

  const removeEditSinger = (index: number) => {
    if (!editingToyxona) return;
    setEditingToyxona({
      ...editingToyxona,
      xonandalar: (editingToyxona.xonandalar || []).filter((_, i) => i !== index)
    });
  };

  const addEditCar = () => {
    if (!editingToyxona) return;
    setEditingToyxona({
      ...editingToyxona,
      mashinalar: [...(editingToyxona.mashinalar || []), { brand: "", price: "", image: "" }]
    });
  };

  const changeEditCar = (index: number, key: string, value: string) => {
    if (!editingToyxona) return;
    const copy = [...(editingToyxona.mashinalar || [])];
    copy[index] = { ...copy[index], [key]: value };
    setEditingToyxona({ ...editingToyxona, mashinalar: copy });
  };

  const removeEditCar = (index: number) => {
    if (!editingToyxona) return;
    setEditingToyxona({
      ...editingToyxona,
      mashinalar: (editingToyxona.mashinalar || []).filter((_, i) => i !== index)
    });
  };

  const handleAddToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToyxona.title || !newToyxona.price || !newToyxona.capacity || !newToyxona.location || !newToyxona.phoneNumber) {
      alert("Majburiy maydonlarni to'ldiring");
      return;
    }

    if (!isValidPhoneNumber(newToyxona.phoneNumber)) {
      alert("Telefon raqami noto'g'ri formatda. Namuna: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(newToyxona.phoneNumber);

    const images = newToyxona.imagesStr.split(",").map(i => i.trim()).filter(Boolean);
    const res = await fetch("/api/toyxonalar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newToyxona,
        phoneNumber: cleanPhone,
        images,
        status: "tasdiqlangan"
      })
    });

    if (res.ok) {
      alert("To'yxona muvaffaqiyatli qo'shildi!");
      setNewToyxona({
        title: "",
        tuman: "Bektemir",
        price: "",
        capacity: "",
        location: "",
        description: "",
        phoneNumber: "",
        image: "",
        imagesStr: "",
        ownerId: "",
        currency: "UZS",
        xonandalar: [],
        karnaySurnay: { mavjud: false, narx: "" },
        mashinalar: [],
        menu: { suyuq: ["Sho'rva", "Mastava", "Chuchvara"], quyuq: ["Palov", "Somsa", "Qozon Kabob"], images: [] }
      });
      setActiveTab("toyxonalar");
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOwner.name || !newOwner.surname || !newOwner.email || !newOwner.username || !newOwner.password) {
      alert("Barcha maydonlarni to'ldiring");
      return;
    }

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newOwner,
        role: "owner",
        action: "register"
      })
    });

    const data = await res.json();
    if (res.ok) {
      alert(`To'yxona egasi qo'shildi! OTP kod (email simulyatsiyasi): ${data.otp || "Yuborildi"}`);
      setNewOwner({ name: "", surname: "", email: "", username: "", password: "" });
      setActiveTab("egalar");
    } else {
      alert(data.error || "Xatolik yuz berdi");
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const yangiStatus = currentStatus === "tasdiqlangan" ? "tasdiqlanmagan" : "tasdiqlangan";
    await fetch("/api/toyxonalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: yangiStatus })
    });
    loadToyxonalar();
  };

  const handleDeleteToyxona = async (id: number) => {
    if (!confirm("Haqiqatan ham bu to'yxonani o'chirasizmi?")) return;
    await fetch(`/api/toyxonalar?id=${id}`, { method: "DELETE" });
    loadToyxonalar();
  };

  const handleAssignOwner = async (id: number, ownerId: string) => {
    await fetch("/api/toyxonalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ownerId: ownerId ? Number(ownerId) : null })
    });
    alert("To'yxona egasi biriktirildi!");
    loadToyxonalar();
  };

  const handleUpdateToyxona = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingToyxona) return;

    if (!editingToyxona.phoneNumber || !isValidPhoneNumber(editingToyxona.phoneNumber)) {
      alert("Telefon raqami noto'g'ri formatda. Namuna: +998901234567");
      return;
    }
    const cleanPhone = formatPhoneNumber(editingToyxona.phoneNumber);

    const images = editingToyxona.imagesStr ? editingToyxona.imagesStr.split(",").map(i => i.trim()).filter(Boolean) : [];

    const res = await fetch("/api/toyxonalar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editingToyxona,
        phoneNumber: cleanPhone,
        images
      })
    });

    if (res.ok) {
      alert("Ma'lumotlar o'zgartirildi!");
      setEditingToyxona(null);
      loadToyxonalar();
    } else {
      alert("Xatolik yuz berdi");
    }
  };

  const handleCancelBooking = async (id: number) => {
    if (!confirm("Ushbu bronni bekor qilmoqchimisiz?")) return;
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      alert("Bron bekor qilindi!");
      loadBookings();
    }
  };

  if (!authorized) {
    return (
      <div className="p-8 text-center py-20 text-gray-400 font-bold animate-pulse bg-white min-h-screen flex items-center justify-center">
        Tekshirilmoqda...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 pt-28 md:pt-36 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header and Tab Selection */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-4 border-b border-slate-100 gap-4">
          <h1 className="text-2xl font-black text-green-950 uppercase tracking-wide">
            Admin Panel
          </h1>
          {/* Tab Navigation Menu */}
          <div className="flex flex-wrap gap-2 bg-white">
            <button
              onClick={() => { setActiveTab("toyxonalar"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "toyxonalar" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              To'yxonalar
            </button>
            <button
              onClick={() => { setActiveTab("egalar"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "egalar" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              To'yxona Egalari
            </button>
            <button
              onClick={() => { setActiveTab("bronlar"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "bronlar" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              Barcha Bronlar
            </button>
            <button
              onClick={() => { setActiveTab("add_toyxona"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "add_toyxona" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              + Yangi To'yxona
            </button>
            <button
              onClick={() => { setActiveTab("add_owner"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "add_owner" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              + Yangi Ega
            </button>
            <button
              onClick={() => { setActiveTab("xabarlar"); setEditingToyxona(null); }}
              className={`py-2 px-4 rounded-xl font-semibold text-xs transition cursor-pointer ${activeTab === "xabarlar" ? "bg-green-800 text-white shadow-xs" : "text-gray-600 hover:bg-slate-50"}`}
            >
              Murojaatlar / Xabarlar
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white">
          {loading ? (
            <div className="text-center py-20 text-gray-400 font-bold animate-pulse">
              Yuklanmoqda...
            </div>
          ) : editingToyxona ? (
            /* EDIT TOYXONA FORM */
            <div className="bg-white p-6 rounded-2xl border border-white shadow-xs">
              <h3 className="font-bold text-xl text-green-950 mb-6 border-b border-white pb-3">To'yxona tahrirlash</h3>
              <form onSubmit={handleUpdateToyxona} className="space-y-4 text-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">To'yxona nomi</label>
                    <input
                      type="text"
                      value={editingToyxona.title}
                      onChange={e => setEditingToyxona({ ...editingToyxona, title: e.target.value })}
                      className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Rayon</label>
                    <select
                      value={editingToyxona.tuman}
                      onChange={e => setEditingToyxona({ ...editingToyxona, tuman: e.target.value })}
                      className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                    >
                      {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Narx (1 o'rindiq)</label>
                    <input
                      type="number"
                      value={editingToyxona.price}
                      onChange={e => setEditingToyxona({ ...editingToyxona, price: Number(e.target.value) })}
                      className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Valyuta</label>
                    <select
                      value={editingToyxona.currency || "UZS"}
                      onChange={e => setEditingToyxona({ ...editingToyxona, currency: e.target.value as "UZS" | "USD" })}
                      className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                    >
                      <option value="UZS">so'm (UZS)</option>
                      <option value="USD">dollar ($) (USD)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Sig'im (kishi)</label>
                    <input
                      type="number"
                      value={editingToyxona.capacity}
                      onChange={e => setEditingToyxona({ ...editingToyxona, capacity: Number(e.target.value) })}
                      className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Asosiy rasm (URL & Fayl)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingToyxona.image}
                        onChange={e => setEditingToyxona({ ...editingToyxona, image: e.target.value })}
                        className="flex-1 p-2.5 border border-white rounded-xl bg-white outline-none text-xs"
                        placeholder="https://..."
                      />
                      <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-white">
                        {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleMainImageUpload(e, true)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">Qo'shimcha rasmlar (vergul bilan)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingToyxona.imagesStr || ""}
                        onChange={e => setEditingToyxona({ ...editingToyxona, imagesStr: e.target.value })}
                        className="flex-1 p-2.5 border border-white rounded-xl bg-white outline-none text-xs"
                        placeholder="https://..., https://..."
                      />
                      <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-white">
                        {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleGalleryImageUpload(e, true)}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Telefon raqam</label>
                  <input
                    type="text"
                    value={editingToyxona.phoneNumber}
                    onChange={e => setEditingToyxona({ ...editingToyxona, phoneNumber: e.target.value })}
                    className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Manzil (batafsil)</label>
                  <input
                    type="text"
                    value={editingToyxona.location}
                    onChange={e => setEditingToyxona({ ...editingToyxona, location: e.target.value })}
                    className="w-full p-2.5 border border-white rounded-xl bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tavsif</label>
                  <textarea
                    value={editingToyxona.description}
                    onChange={e => setEditingToyxona({ ...editingToyxona, description: e.target.value })}
                    className="w-full p-2.5 border border-white rounded-xl bg-white outline-none resize-none"
                    rows={3}
                  ></textarea>
                </div>

                {/* Marosim Menusi */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                  <h4 className="font-bold text-green-950 text-sm">Marosim Menusi</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Suyuq taomlar (vergul bilan)</label>
                      <input
                        type="text"
                        value={(editingToyxona.menu?.suyuq || []).join(", ")}
                        onChange={e => setEditingToyxona({
                          ...editingToyxona,
                          menu: {
                            suyuq: e.target.value.split(",").map(x => x.trim()),
                            quyuq: editingToyxona.menu?.quyuq || [],
                            images: editingToyxona.menu?.images || []
                          }
                        })}
                        className="w-full p-2.5 border border-white rounded-xl bg-white outline-none text-xs text-slate-800"
                        placeholder="Sho'rva, Mastava..."
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Quyuq taomlar (vergul bilan)</label>
                      <input
                        type="text"
                        value={(editingToyxona.menu?.quyuq || []).join(", ")}
                        onChange={e => setEditingToyxona({
                          ...editingToyxona,
                          menu: {
                            suyuq: editingToyxona.menu?.suyuq || [],
                            quyuq: e.target.value.split(",").map(x => x.trim()),
                            images: editingToyxona.menu?.images || []
                          }
                        })}
                        className="w-full p-2.5 border border-white rounded-xl bg-white outline-none text-xs text-slate-800"
                        placeholder="Palov, Somsa..."
                      />
                    </div>
                  </div>
                </div>

                {/* San'atkorlar (Xonandalar) */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-500">Taklif etiladigan san'atkorlar (Xonandalar)</label>
                    <button type="button" onClick={addEditSinger} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                      + San'atkor qo'shish
                    </button>
                  </div>
                  {(editingToyxona.xonandalar || []).map((s, index) => (
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

                {/* Mashinalar */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs font-bold text-gray-500">Kortej xizmati uchun mashinalar</label>
                    <button type="button" onClick={addEditCar} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                      + Mashina qo'shish
                    </button>
                  </div>
                  {(editingToyxona.mashinalar || []).map((c, index) => (
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

                {/* Karnay-Surnay */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500">
                    <input
                      type="checkbox"
                      checked={!!editingToyxona.karnaySurnay?.mavjud}
                      onChange={e => setEditingToyxona({
                        ...editingToyxona,
                        karnaySurnay: {
                          mavjud: e.target.checked,
                          narx: editingToyxona.karnaySurnay?.narx || ""
                        }
                      })}
                      className="accent-green-900 cursor-pointer"
                    />
                    <span>Karnay-surnay xizmati mavjud</span>
                  </label>

                  {editingToyxona.karnaySurnay?.mavjud && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Karnay-surnay narxi (so'mda)</label>
                      <input
                        type="text"
                        placeholder="Masalan: 1,500,000"
                        value={editingToyxona.karnaySurnay.narx}
                        onChange={e => setEditingToyxona({
                          ...editingToyxona,
                          karnaySurnay: {
                            mavjud: true,
                            narx: e.target.value
                          }
                        })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none text-xs text-slate-800"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-green-800 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                  >
                    Saqlash
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingToyxona(null)}
                    className="px-6 py-2.5 border border-white text-gray-500 rounded-xl font-bold cursor-pointer"
                  >
                    Bekor qilish
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              {/* TOYXONALAR RO'YXATI TAB */}
              {activeTab === "toyxonalar" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <h3 className="font-bold text-lg text-green-950">To'yxonalar boshqaruvi</h3>
                    <input
                      type="text"
                      placeholder="Qidiruv..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="p-2 border border-white rounded-xl bg-white outline-none text-sm w-full md:w-64"
                    />
                  </div>

                  {/* Filters */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-4 rounded-xl text-xs border border-white">
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Rayon bo'yicha</label>
                      <select value={filterTuman} onChange={e => setFilterTuman(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="all">Barchasi</option>
                        {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Status bo'yicha</label>
                      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="all">Barchasi</option>
                        <option value="tasdiqlangan">Tasdiqlangan</option>
                        <option value="tasdiqlanmagan">Tasdiqlanmagan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Tartiblash</label>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="id">ID raqam</option>
                        <option value="price">Narxi</option>
                        <option value="capacity">Sig'imi</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Tartib</label>
                      <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="asc">Kamaymaydigan (asc)</option>
                        <option value="desc">Kamayadigan (desc)</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid */}
                  <div className="space-y-4">
                    {toyxonalar.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">To'yxonalar topilmadi</div>
                    ) : (
                      toyxonalar.map(toy => (
                        <div key={toy.id} className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border border-white rounded-xl hover:bg-slate-50/50 transition gap-4">
                          <div className="flex gap-4">
                            <Image src={toy.image} alt={toy.title} width={64} height={64} className="w-16 h-16 object-cover rounded-lg" unoptimized />
                            <div>
                              <h4 className="font-bold text-green-950 text-base flex items-center gap-2 flex-wrap">
                                {toy.title}
                                <a
                                  href={`/tumanlar/${getDistrictSlug(toy.tuman)}/${toy.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-700 hover:text-emerald-950 hover:underline text-[10px] font-bold inline-flex items-center gap-0.5 ml-2 border border-emerald-100 bg-emerald-50/20 px-1.5 py-0.5 rounded-md transition"
                                >
                                  🔍 Sahifani ko'rish
                                </a>
                              </h4>
                              <p className="text-xs text-gray-500">{toy.tuman} rayon, {toy.location}</p>
                              <div className="flex gap-4 text-xs font-semibold text-gray-600 mt-1">
                                <span>Sig'im: {toy.capacity} kishi</span>
                                <span>Narxi: {toy.price.toLocaleString()} {toy.currency === "USD" ? "$" : "so'm"}</span>
                              </div>
                              <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded-full mt-1.5 ${toy.status === "tasdiqlangan" ? "bg-green-600 text-white" : "bg-yellow-500 text-white"}`}>
                                {toy.status}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 w-full md:w-auto shrink-0">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleStatus(toy.id, toy.status)}
                                className={`flex-1 md:flex-initial text-xs font-bold py-1.5 px-3 rounded-lg border transition cursor-pointer ${toy.status === "tasdiqlangan" ? "bg-white border-white text-gray-500 hover:bg-slate-50" : "bg-white border-white text-green-800 hover:bg-slate-50"}`}
                              >
                                {toy.status === "tasdiqlangan" ? "Bekor qilish" : "Tasdiqlash"}
                              </button>
                              <button
                                onClick={() => setEditingToyxona({
                                  ...toy,
                                  imagesStr: toy.images?.join(", ") || "",
                                  xonandalar: toy.xonandalar || [],
                                  karnaySurnay: toy.karnaySurnay || { mavjud: false, narx: "" },
                                  mashinalar: toy.mashinalar || [],
                                  menu: toy.menu || { suyuq: ["Sho'rva", "Mastava", "Chuchvara"], quyuq: ["Palov", "Somsa", "Qozon Kabob"], images: [] }
                                })}
                                className="flex-1 md:flex-initial text-xs font-bold py-1.5 px-3 rounded-lg border border-white text-amber-700 bg-white hover:bg-slate-50 transition cursor-pointer"
                              >
                                Tahrirlash
                              </button>
                              <button
                                onClick={() => handleDeleteToyxona(toy.id)}
                                className="flex-1 md:flex-initial text-xs font-bold py-1.5 px-3 rounded-lg bg-red-500 border border-white text-white hover:bg-red-650 transition cursor-pointer"
                              >
                                O'chirish
                              </button>
                            </div>

                            <div className="flex items-center gap-2 text-xs">
                              <span className="text-gray-400 font-bold whitespace-nowrap">Egasi:</span>
                              <select
                                value={toy.ownerId || ""}
                                onChange={e => handleAssignOwner(toy.id, e.target.value)}
                                className="p-1 border border-white rounded-lg w-full bg-white text-gray-700 outline-none"
                              >
                                <option value="">Biriktirilmagan</option>
                                {owners.map(o => (
                                  <option key={o.id} value={o.id}>{o.name} {o.surname} ({o.username})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TOYXONA EGALARI TAB */}
              {activeTab === "egalar" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs space-y-6">
                  <h3 className="font-bold text-lg text-green-950 mb-4">To'yxona egalari</h3>
                  <div className="space-y-4">
                    {owners.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">To'yxona egalari yo'q</div>
                    ) : (
                      owners.map(o => (
                        <div key={o.id} className="flex justify-between items-center p-4 border border-white rounded-xl hover:bg-slate-50/50 transition">
                          <div>
                            <h4 className="font-bold text-gray-800">{o.name} {o.surname}</h4>
                            <p className="text-xs text-gray-500">Email: {o.email} | Username: {o.username}</p>
                            <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${o.verified ? "bg-white text-green-800 border border-white" : "bg-white text-red-800 border border-white"}`}>
                              {o.verified ? "Faollashtirilgan (OTP o'tgan)" : "Hali OTP o'tmagan"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* BARCHA BRONLAR TAB */}
              {activeTab === "bronlar" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs space-y-6">
                  <h3 className="font-bold text-lg text-green-950">Bron qilingan marosimlar</h3>

                  {/* Booking filters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4 bg-white p-4 rounded-xl text-xs border border-white">
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Rayon bo'yicha</label>
                      <select value={bookingFilterTuman} onChange={e => setBookingFilterTuman(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="all">Barchasi</option>
                        {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">To'yxona bo'yicha</label>
                      <select value={bookingFilterToyxona} onChange={e => setBookingFilterToyxona(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="all">Barchasi</option>
                        {toyxonalar.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Status bo'yicha</label>
                      <select value={bookingFilterStatus} onChange={e => setBookingFilterStatus(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="all">Barchasi</option>
                        <option value="bo'lib o'tgan">Bo'lib o'tgan</option>
                        <option value="endi bo'ladigan">Endi bo'ladigan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Tartiblash</label>
                      <select value={bookingSortBy} onChange={e => setBookingSortBy(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="sana">Sana bo'yicha</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-gray-500 mb-1">Tartib (Order)</label>
                      <select value={bookingSortOrder} onChange={e => setBookingSortOrder(e.target.value)} className="w-full p-2 border border-white bg-white rounded-lg outline-none">
                        <option value="asc">Kamaymaydigan (asc)</option>
                        <option value="desc">Kamayadigan (desc)</option>
                      </select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white text-gray-400 uppercase bg-white">
                          <th className="p-3">Bron ID</th>
                          <th className="p-3">To'yxona</th>
                          <th className="p-3">Sana (May)</th>
                          <th className="p-3">Mehmonlar</th>
                          <th className="p-3">Mijoz</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Amallar</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center p-6 text-gray-400">Bronlar topilmadi</td>
                          </tr>
                        ) : (
                          bookings.map(b => (
                            <tr key={b.id} className="border-b last:border-none border-white hover:bg-slate-50/50">
                              <td className="p-3 font-semibold text-green-900">#{b.id}</td>
                              <td className="p-3 font-semibold">{b.toyxonaTitle}</td>
                              <td className="p-3 whitespace-nowrap">{formatDateStr(b.sana, "uz")}</td>
                              <td className="p-3">{b.odamSoni} kishi</td>
                              <td className="p-3">
                                <p className="font-semibold text-[11px]">{b.user.ism} {b.user.familiya}</p>
                                <p className="text-[9px] text-gray-500">{b.user.raqam}</p>
                              </td>
                              <td className="p-3">
                                <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${b.status === "bo'lib o'tgan" ? "bg-slate-50 text-slate-400 border border-white" : "bg-white text-green-800 border border-white"}`}>
                                  {b.status}
                                </span>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => handleCancelBooking(b.id)}
                                  className="text-xs font-bold text-red-650 hover:text-red-800 transition cursor-pointer"
                                >
                                  Bekor qilish
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ADD TOYXONA TAB */}
              {activeTab === "add_toyxona" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs p-6">
                  <h3 className="font-bold text-lg text-green-950 mb-6 border-b border-white pb-3">Yangi To'yxona Qo'shish</h3>
                  <form onSubmit={handleAddToyxona} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">To'yxona nomi *</label>
                        <input
                          type="text"
                          placeholder="Nomi..."
                          value={newToyxona.title}
                          onChange={e => setNewToyxona({ ...newToyxona, title: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Rayon *</label>
                        <select
                          value={newToyxona.tuman}
                          onChange={e => setNewToyxona({ ...newToyxona, tuman: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        >
                          {tumanlar.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Narx (1 o'rindiq) *</label>
                        <input
                          type="number"
                          placeholder="4000..."
                          value={newToyxona.price}
                          onChange={e => setNewToyxona({ ...newToyxona, price: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Valyuta *</label>
                        <select
                          value={newToyxona.currency}
                          onChange={e => setNewToyxona({ ...newToyxona, currency: e.target.value as "UZS" | "USD" })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        >
                          <option value="UZS">so'm (UZS)</option>
                          <option value="USD">dollar ($) (USD)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Sig'im (kishi) *</label>
                        <input
                          type="number"
                          placeholder="300..."
                          value={newToyxona.capacity}
                          onChange={e => setNewToyxona({ ...newToyxona, capacity: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Telefon raqam *</label>
                      <input
                        type="text"
                        placeholder="+998..."
                        value={newToyxona.phoneNumber}
                        onChange={e => setNewToyxona({ ...newToyxona, phoneNumber: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Batafsil manzil *</label>
                      <input
                        type="text"
                        placeholder="Address..."
                        value={newToyxona.location}
                        onChange={e => setNewToyxona({ ...newToyxona, location: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Asosiy rasm (URL & Fayl)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..."
                            value={newToyxona.image}
                            onChange={e => setNewToyxona({ ...newToyxona, image: e.target.value })}
                            className="flex-1 p-2.5 border border-white bg-white rounded-xl outline-none text-xs"
                          />
                          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-white">
                            {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleMainImageUpload(e, false)}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Qo'shimcha rasmlar (vergul bilan)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://..., https://..."
                            value={newToyxona.imagesStr}
                            onChange={e => setNewToyxona({ ...newToyxona, imagesStr: e.target.value })}
                            className="flex-1 p-2.5 border border-white bg-white rounded-xl outline-none text-xs"
                          />
                          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center shrink-0 border border-white">
                            {uploading ? "Yuklanmoqda..." : "Rasm yuklash"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleGalleryImageUpload(e, false)}
                              className="hidden"
                              disabled={uploading}
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Tavsif</label>
                      <textarea
                        placeholder="Tavsif yozing..."
                        value={newToyxona.description}
                        onChange={e => setNewToyxona({ ...newToyxona, description: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none resize-none"
                        rows={3}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">To'yxona egasini biriktirish</label>
                      <select
                        value={newToyxona.ownerId}
                        onChange={e => setNewToyxona({ ...newToyxona, ownerId: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      >
                        <option value="">Biriktirmaslik</option>
                        {owners.map(o => (
                          <option key={o.id} value={o.id}>{o.name} {o.surname} ({o.username})</option>
                        ))}
                      </select>
                    </div>

                    {/* Marosim Menusi */}
                    <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                      <h4 className="font-bold text-green-950 text-sm">Marosim Menusi</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Suyuq taomlar (vergul bilan)</label>
                          <input
                            type="text"
                            value={newToyxona.menu.suyuq.join(", ")}
                            onChange={e => setNewToyxona({
                              ...newToyxona,
                              menu: {
                                suyuq: e.target.value.split(",").map(x => x.trim()),
                                quyuq: newToyxona.menu.quyuq,
                                images: newToyxona.menu.images
                              }
                            })}
                            className="w-full p-2.5 border border-white bg-white rounded-xl outline-none text-xs text-slate-800"
                            placeholder="Sho'rva, Mastava..."
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Quyuq taomlar (vergul bilan)</label>
                          <input
                            type="text"
                            value={newToyxona.menu.quyuq.join(", ")}
                            onChange={e => setNewToyxona({
                              ...newToyxona,
                              menu: {
                                suyuq: newToyxona.menu.suyuq,
                                quyuq: e.target.value.split(",").map(x => x.trim()),
                                images: newToyxona.menu.images
                              }
                            })}
                            className="w-full p-2.5 border border-white bg-white rounded-xl outline-none text-xs text-slate-800"
                            placeholder="Palov, Somsa..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* San'atkorlar (Xonandalar) */}
                    <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-500">Taklif etiladigan san'atkorlar (Xonandalar)</label>
                        <button type="button" onClick={addNewSinger} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                          + San'atkor qo'shish
                        </button>
                      </div>
                      {newToyxona.xonandalar.map((s, index) => (
                        <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Ism..."
                              value={s.ism}
                              onChange={e => changeNewSinger(index, "ism", e.target.value)}
                              className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Narx..."
                                value={s.narx}
                                onChange={e => changeNewSinger(index, "narx", e.target.value)}
                                className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <button type="button" onClick={() => removeNewSinger(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                                ✕
                              </button>
                            </div>
                          </div>
                          
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
                              onChange={e => changeNewSinger(index, "rasm", e.target.value)}
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
                                    changeNewSinger(index, "rasm", url);
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

                    {/* Mashinalar */}
                    <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold text-gray-500">Kortej xizmati uchun mashinalar</label>
                        <button type="button" onClick={addNewCar} className="text-xs font-bold text-emerald-800 hover:text-emerald-950 transition cursor-pointer">
                          + Mashina qo'shish
                        </button>
                      </div>
                      {newToyxona.mashinalar.map((c, index) => (
                        <div key={index} className="space-y-2 border-b border-slate-100 pb-3 last:border-none">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Mashina rusumi..."
                              value={c.brand}
                              onChange={e => changeNewCar(index, "brand", e.target.value)}
                              className="p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                            />
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Narx..."
                                value={c.price}
                                onChange={e => changeNewCar(index, "price", e.target.value)}
                                className="flex-1 p-2 border border-slate-200 rounded-lg outline-none text-xs bg-white text-slate-800"
                              />
                              <button type="button" onClick={() => removeNewCar(index)} className="text-red-650 hover:text-red-750 font-bold text-xs px-2 cursor-pointer">
                                ✕
                              </button>
                            </div>
                          </div>

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
                              onChange={e => changeNewCar(index, "image", e.target.value)}
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
                                    changeNewCar(index, "image", url);
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

                    {/* Karnay-Surnay */}
                    <div className="border border-slate-100 p-4 rounded-xl space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-500">
                        <input
                          type="checkbox"
                          checked={newToyxona.karnaySurnay.mavjud}
                          onChange={e => setNewToyxona({
                            ...newToyxona,
                            karnaySurnay: {
                              mavjud: e.target.checked,
                              narx: newToyxona.karnaySurnay.narx
                            }
                          })}
                          className="accent-green-900 cursor-pointer"
                        />
                        <span>Karnay-surnay xizmati mavjud</span>
                      </label>

                      {newToyxona.karnaySurnay.mavjud && (
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Karnay-surnay narxi (so'mda)</label>
                          <input
                            type="text"
                            placeholder="Masalan: 1,500,000"
                            value={newToyxona.karnaySurnay.narx}
                            onChange={e => setNewToyxona({
                              ...newToyxona,
                              karnaySurnay: {
                                mavjud: true,
                                narx: e.target.value
                              }
                            })}
                            className="w-full p-2.5 border border-slate-200 rounded-xl bg-white outline-none text-xs text-slate-800"
                          />
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-green-800 text-white rounded-xl font-bold shadow-xs hover:bg-green-700 transition cursor-pointer"
                    >
                      To'yxonani qo'shish
                    </button>
                  </form>
                </div>
              )}

              {/* ADD OWNER TAB */}
              {activeTab === "add_owner" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs p-6">
                  <h3 className="font-bold text-lg text-green-950 mb-6 border-b border-white pb-3">Yangi To'yxona Egasi Qo'shish</h3>
                  <form onSubmit={handleAddOwner} className="space-y-4 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Ism *</label>
                        <input
                          type="text"
                          placeholder="Ism..."
                          value={newOwner.name}
                          onChange={e => setNewOwner({ ...newOwner, name: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Familiya *</label>
                        <input
                          type="text"
                          placeholder="Familiya..."
                          value={newOwner.surname}
                          onChange={e => setNewOwner({ ...newOwner, surname: e.target.value })}
                          className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Email *</label>
                      <input
                        type="email"
                        placeholder="email@example.com..."
                        value={newOwner.email}
                        onChange={e => setNewOwner({ ...newOwner, email: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Foydalanuvchi nomi *</label>
                      <input
                        type="text"
                        placeholder="username..."
                        value={newOwner.username}
                        onChange={e => setNewOwner({ ...newOwner, username: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1">Parol *</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newOwner.password}
                        onChange={e => setNewOwner({ ...newOwner, password: e.target.value })}
                        className="w-full p-2.5 border border-white bg-white rounded-xl outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-green-800 text-white rounded-xl font-bold shadow-xs hover:bg-green-700 transition cursor-pointer"
                    >
                      Egani ro'yxatdan o'tkazish
                    </button>
                  </form>
                </div>
              )}

              {/* XABARLAR / MUROJAATLAR TAB */}
              {activeTab === "xabarlar" && (
                <div className="bg-white rounded-2xl border border-white shadow-xs p-6 space-y-6">
                  <h3 className="font-bold text-lg text-green-950">Mijozlar Murojaatlari</h3>
                  <div className="space-y-4">
                    {adminMessages.length === 0 ? (
                      <div className="text-center py-10 text-gray-400">Yangi xabarlar yo'q</div>
                    ) : (
                      adminMessages.filter(m => !m.isAdminMessage).map(msg => {
                        // Find replies for this message / user
                        const replies = adminMessages.filter(r => r.isAdminMessage && r.receiverId === msg.senderId);
                        return (
                          <div key={msg.id} className="p-4 border border-white rounded-xl bg-slate-50/50 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-bold text-slate-800">{msg.name}</h4>
                                <p className="text-xs text-gray-500">Tel: {msg.phone} | Sana: {new Date(msg.sentAt).toLocaleString()}</p>
                              </div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {msg.senderId ? "Tizimli mijoz" : "Mehmon"}
                              </span>
                            </div>
                            {msg.subject && (
                              <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-250 px-2.5 py-1 rounded-lg text-xs font-bold text-amber-850">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                                Buyurtma qilingan xizmat: {msg.subject}
                              </div>
                            )}
                            <p className="text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100">{msg.message}</p>
                            
                            {/* Replies */}
                            {replies.length > 0 && (
                              <div className="pl-6 space-y-2 border-l-2 border-emerald-500">
                                <span className="text-[9px] font-black uppercase text-emerald-800">Admin javoblari:</span>
                                {replies.map(rep => (
                                  <div key={rep.id} className="text-xs text-slate-600 bg-emerald-50/30 p-2.5 rounded-lg border border-emerald-100/50">
                                    <p className="font-semibold text-emerald-950">Javob ({new Date(rep.sentAt).toLocaleDateString()}):</p>
                                    <p className="mt-1">{rep.message}</p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Reply Input Box */}
                            {msg.senderId && (
                              <div className="pt-2 flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Javobingizni yozing..."
                                  value={replyTexts[msg.id] || ""}
                                  onChange={e => setReplyTexts({ ...replyTexts, [msg.id]: e.target.value })}
                                  className="flex-1 p-2 border border-slate-200 rounded-lg text-xs bg-white outline-none focus:border-green-800"
                                />
                                <button
                                  onClick={() => handleSendReply(msg.id, msg.senderId!, msg.name)}
                                  className="px-4 py-2 bg-green-800 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition cursor-pointer"
                                >
                                  Javob qaytarish
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center py-20 text-gray-400 font-bold animate-pulse bg-white min-h-screen flex items-center justify-center">
        Yuklanmoqda...
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
