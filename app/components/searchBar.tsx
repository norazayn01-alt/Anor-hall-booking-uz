"use client";

import type React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { Search, CircleDot } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "Mirobod",
  "Yunusobod",
  "Chilonzor",
  "Mirzo Ulug'bek",
  "Sergeli",
  "Uchtepa",
  "Yashnobod",
  "Olmazor",
  "Shayxontohur",
  "Bektemir",
  "Yangihayot",
  "Yakkasaroy",
  "Sarbon",
  "Osh",
  "Zal",
  "Toshkent",
];

const GooeyFilter = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }} aria-hidden="true">
    <defs>
      <filter id="gooey-effect">
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="blur" />
        <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -8" result="goo" />
        <feComposite in="SourceGraphic" in2="goo" operator="atop" />
      </filter>
    </defs>
  </svg>
);

const STATIC_RANDOMS = Array.from({ length: 100 }, (_, i) => {
  // Deterministic math functions to create stable pseudo-random values
  const sin1 = Math.sin(i + 1);
  const sin2 = Math.sin(i + 2);
  const sin3 = Math.sin(i + 3);
  return {
    xRand: (sin1 + 1) / 2,
    yRand: (sin2 + 1) / 2,
    scaleRand: (sin3 + 1) / 2,
    durationRand: ((sin1 + sin2 + 1) / 2) * 1.5 + 1.5,
  };
});

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ value, onChange, placeholder = "Qidirish...", onSearch }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isClicked, setIsClicked] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const [isUnsupportedBrowser, setIsUnsupportedBrowser] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const isSafari = ua.includes("safari") && !ua.includes("chrome") && !ua.includes("chromium");
    const isChromeOniOS = ua.includes("crios");
    setIsUnsupportedBrowser(isSafari || isChromeOniOS);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim()) {
      const filtered = SUGGESTIONS.filter((item) =>
        item.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      if (onSearch) {
        onSearch(value);
      }
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 1000);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isFocused) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 800);
  };

  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  const searchIconVariants = {
    initial: { scale: 1 },
    animate: {
      rotate: isAnimating ? [0, -15, 15, -10, 10, 0] : 0,
      scale: isAnimating ? [1, 1.3, 1] : 1,
      transition: { duration: 0.6, ease: "easeInOut" },
    },
  } as any;

  const suggestionVariants = {
    hidden: (i: number) => ({
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.15, delay: i * 0.05 },
    }),
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 15, delay: i * 0.07 },
    }),
    exit: (i: number) => ({
      opacity: 0,
      y: -5,
      scale: 0.9,
      transition: { duration: 0.1, delay: i * 0.03 },
    }),
  } as any;

  const particles = Array.from({ length: isFocused ? 18 : 0 }, (_, i) => {
    const config = STATIC_RANDOMS[i % STATIC_RANDOMS.length];
    const xDest = (config.xRand - 0.5) * 40;
    const yDest = (config.yRand - 0.5) * 40;
    const scale = config.scaleRand * 0.8 + 0.4;
    const duration = config.durationRand;
    const left = config.xRand * 100;
    const top = config.yRand * 100;

    return (
      <motion.div
        key={i}
        initial={{ scale: 0 }}
        animate={{
          x: [0, xDest],
          y: [0, yDest],
          scale: [0, scale],
          opacity: [0, 0.8, 0],
        }}
        transition={{
          duration: duration,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-700"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          filter: "blur(2px)",
        }}
      />
    );
  });

  const clickParticles = isClicked
    ? Array.from({ length: 14 }, (_, i) => {
        const config = STATIC_RANDOMS[(i + 20) % STATIC_RANDOMS.length];
        const xDest = mousePosition.x + (config.xRand - 0.5) * 160;
        const yDest = mousePosition.y + (config.yRand - 0.5) * 160;
        const scale = config.scaleRand * 0.8 + 0.2;
        const duration = config.durationRand * 0.5 + 0.5;

        const rColor = Math.floor(config.xRand * 5) + 6;
        const gColor = Math.floor(config.yRand * 50) + 70;
        const bColor = Math.floor(config.scaleRand * 30) + 30;

        return (
          <motion.div
            key={`click-${i}`}
            initial={{ x: mousePosition.x, y: mousePosition.y, scale: 0, opacity: 1 }}
            animate={{
              x: xDest,
              y: yDest,
              scale: scale,
              opacity: [1, 0],
            }}
            transition={{ duration: duration, ease: "easeOut" }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: `rgba(${rColor}, ${gColor}, ${bColor}, 0.8)`,
              boxShadow: "0 0 8px rgba(4, 120, 87, 0.8)",
            }}
          />
        );
      })
    : null;

  return (
    <div className="relative w-full z-20">
      <GooeyFilter />
      <motion.form
        onSubmit={handleSubmit}
        className="relative flex items-center justify-center w-full mx-auto"
        initial={{ width: "100%", maxWidth: "600px" }}
        animate={{ scale: isFocused ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        onMouseMove={handleMouseMove}
      >
        <motion.div
          className={cn(
            "flex items-center w-full rounded-full border relative overflow-hidden backdrop-blur-md transition-all duration-300",
            isFocused ? "border-transparent bg-white shadow-2xl" : "border-slate-200 bg-white/80 shadow-md"
          )}
          animate={{
            boxShadow: isClicked
              ? "0 0 40px rgba(6, 95, 70, 0.5), 0 0 15px rgba(6, 78, 59, 0.6) inset"
              : isFocused
              ? "0 15px 35px rgba(0, 0, 0, 0.1)"
              : "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)",
          }}
          onClick={handleClick}
        >
          {isFocused && (
            <motion.div
              className="absolute inset-0 -z-10"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.1,
                background: [
                  "linear-gradient(90deg, #6ee7b7 0%, #34d399 100%)",
                  "linear-gradient(90deg, #a7f3d0 0%, #6ee7b7 100%)",
                  "linear-gradient(90deg, #34d399 0%, #059669 100%)",
                  "linear-gradient(90deg, #6ee7b7 0%, #34d399 100%)",
                ],
              }}
              transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            />
          )}

          <div
            className="absolute inset-0 overflow-hidden rounded-full -z-5"
            style={{ filter: isUnsupportedBrowser ? "none" : "url(#gooey-effect)" }}
          >
            {particles}
          </div>

          {isClicked && (
            <>
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-emerald-800/15"
                initial={{ scale: 0, opacity: 0.7 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 -z-5 rounded-full bg-white bg-white/20"
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </>
          )}

          {clickParticles}

          <motion.div className="pl-5 py-3.5" variants={searchIconVariants} initial="initial" animate="animate">
            <Search
              size={20}
              strokeWidth={isFocused ? 2.5 : 2}
              className={cn(
                "transition-all duration-300",
                isAnimating ? "text-emerald-800" : isFocused ? "text-emerald-950" : "text-emerald-900"
              )}
            />
          </motion.div>

          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 250)}
            className={cn(
              "w-full py-3.5 px-3 bg-transparent outline-none placeholder:text-slate-400 font-semibold text-sm md:text-base relative z-10 border-none",
              isFocused ? "text-slate-900 tracking-wide" : "text-slate-800"
            )}
          />

          <AnimatePresence>
            {value && (
              <motion.button
                type="submit"
                initial={{ opacity: 0, scale: 0.8, x: -20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -20 }}
                whileHover={{
                  scale: 1.03,
                  background: "linear-gradient(45deg, #064e3b 0%, #047857 100%)",
                  boxShadow: "0 10px 20px -5px rgba(6, 95, 70, 0.4)",
                }}
                whileTap={{ scale: 0.97 }}
                className="px-6 py-2.5 mr-2 text-xs font-extrabold rounded-full bg-gradient-to-r from-emerald-900 to-green-800 text-white backdrop-blur-sm transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                Qidirish
              </motion.button>
            )}
          </AnimatePresence>

          {isFocused && (
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.1, 0.2, 0.1, 0],
                background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, transparent 70%)",
              }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            />
          )}
        </motion.div>
      </motion.form>

      <AnimatePresence>
        {isFocused && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute z-30 w-full left-1/2 -translate-x-1/2 max-w-[600px] mt-2 overflow-hidden bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-100"
            style={{
              maxHeight: "260px",
              overflowY: "auto",
              filter: isUnsupportedBrowser ? "none" : "drop-shadow(0 15px 15px rgba(0,0,0,0.08))",
            }}
          >
            <div className="p-2 flex flex-col gap-0.5">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion}
                  custom={index}
                  variants={suggestionVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onMouseDown={(e) => {
                    // Prevent input onBlur from firing before onClick by using onMouseDown
                    e.preventDefault();
                    onChange(suggestion);
                    if (onSearch) {
                      onSearch(suggestion);
                    }
                    setIsFocused(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 cursor-pointer rounded-xl hover:bg-emerald-50/50 group text-left"
                >
                  <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: index * 0.06 }}>
                    <CircleDot size={14} className="text-emerald-800 group-hover:text-emerald-950" />
                  </motion.div>
                  <motion.span
                    className="text-slate-700 font-semibold text-sm group-hover:text-emerald-950"
                    initial={{ x: -5, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {suggestion}
                  </motion.span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export { SearchBar };
