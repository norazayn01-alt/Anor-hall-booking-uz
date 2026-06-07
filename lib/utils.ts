import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isValidPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  // Remove spaces, parentheses, hyphens
  const clean = phone.replace(/[\s\-()]/g, '');
  // Must match Uzbekistan phone format:
  // Optional +998 or 998, followed by exactly 9 digits
  // Or just exactly 9 digits (local format)
  return /^(?:\+?998)?\d{9}$/.test(clean);
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return "";
  const clean = phone.replace(/[\s\-()]/g, '');
  if (/^\d{9}$/.test(clean)) {
    return `+998${clean}`;
  }
  if (/^998\d{9}$/.test(clean)) {
    return `+${clean}`;
  }
  return clean; // If already has +998
}

export function formatDateStr(sana: string, lang: "uz" | "ru" = "uz"): string {
  if (!sana) return "";
  if (!sana.includes("-")) {
    return `${sana}-${lang === "uz" ? "May" : "Мая"}, 2026`;
  }
  const parts = sana.split("-");
  if (parts.length < 3) return sana;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);

  const monthsUz = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
  const monthsRu = ["Января", "Февраля", "Марта", "Апреля", "Мая", "Июня", "Июля", "Августа", "Сентября", "Октября", "Ноября", "Декабря"];

  const mName = lang === "ru" ? monthsRu[month] : monthsUz[month];
  return `${day}-${mName}, ${year}`;
}


