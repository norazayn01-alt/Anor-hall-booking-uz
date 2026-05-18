"use client";
import { useState } from "react";
import React from "react";
import Link from "next/link";
import Logo from "./logo";
import Image from "next/image";
import HomePage from "../tumanlar/page";

const homeLinks = [
  { label: "Bektemir", href: "/tumanlar/sergeli" },
  { label: "Mirobod", href: "/tumanlar/mirobod" },
  { label: "Mirzo Ulug'bek", href: "/tumanlar/mirzo_ulugbek" },
  { label: "Olmazor", href: "/tumanlar/olmazor" },
  { label: "Sergeli", href: "/tumanlar/sergeli" },
  { label: "Uchtepa", href: "/tumanlar/uchtepa" },
  { label: "Yakkasaroy", href: "/tumanlar/yakkasaroy" },
  { label: "Yangihayot", href: "/tumanlar/yangihayot" },
  { label: "Yashnobod", href: "/tumanlar/yashnobod" },
  { label: "Yunusobod", href: "/tumanlar/yunusobod" },
  { label: "Shayxontohur", href: "/tumanlar/shayxontohur" },
  { label: "Chilonzor", href: "/tumanlar/chilonzor" },
];

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="relative w-full z-20">
      <div className="flex justify-between bg-white p-8 sticky top-0">
        <div className="flex justify-start border border-white bg-linear-to-r from-red-700 to-green-800 bg-clip-text text-2xl font-extrabold text-transparent hover:mask-x-from-neutral-100 ...">
          <Link
            href={"/"}
            className="flex justify-items-center-safe rounded-full"
          >
            <Logo />
            <span className="font-bold text-2xl">Anor</span>
          </Link>
        </div>
        <div className="flex justify-around border border-white gap-10 text-black">
          <ul className="flex gap-8 text-gray-700 font-medium tracking-widest text-sm items-center ">
            {/* <li>
              <Link href="/tumanlar" className="hover:text-rose-400 transition">
                HOME
              </Link>
            </li> */}
            <div className="relative">
              <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1 hover:text-rose-400 transition"
              >
                TUMANLAR <span>▾</span>
              </button>

              {/* Dropdown list */}
              {open && (
                <ul className="absolute top-10 left-0 bg-red shadow-lg w-48 z-50">
                  {homeLinks.map((item) => (
                    <li key={item.href} className="border-b last:border-none">
                      <Link
                        href={item.href}
                        className="block px-4 py-3 hover:text-pink-500 hover:bg-white backdrop-blur-md shadow-lg"
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <li>
              <Link href="/zallar" className="hover:text-rose-400 transition">
                ZALLAR
              </Link>
            </li>
            <li>
              <Link href="/menyu" className="hover:text-rose-400 transition">
                MENYU
              </Link>
            </li>
            <li>
              <Link href="/narxlar" className="hover:text-rose-400 transition">
                NARXLAR
              </Link>
            </li>
            <li>
              <Link href="/galereya" className="hover:text-rose-400 transition">
                GALEREYA
              </Link>
            </li>
            <li>
              <Link
                href="/boglanish"
                className="hover:text-rose-400 transition"
              >
                BOG'LANISH
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex gap-4 text-sm text-gray-600">
          <Link href="/account" className="hover:text-rose-400 transition">
            ACCOUNT
          </Link>
          <Link href="/cart" className="hover:text-rose-400 transition">
            CART
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
