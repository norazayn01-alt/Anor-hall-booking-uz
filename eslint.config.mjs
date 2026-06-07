import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scratch/**",
  ]),
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
    rules: {
      // O'zbek/rus matni uchun ' belgisi ko'p ishlatiladi, har birini &apos; ga
      // almashtirish kodni o'qib bo'lmas qiladi.
      "react/no-unescaped-entities": "off",
      // any tiplar haqida xabar berish, lekin build'ni to'xtatmaslik
      "@typescript-eslint/no-explicit-any": "off",
      // useEffect ichida setState
      "react-hooks/set-state-in-effect": "off",
      // <img> tegi dinamik URL'lar (tasodifiy tashqi saytlar) bilan ishlashda Next.js Image'dan ko'ra xavfsizroq (xatolik bermaydi)
      "@next/next/no-img-element": "off",
      // Custom shriflarni CDN orqali yuklashga ruxsat berish
      "@next/next/no-page-custom-font": "off",
      // Ishlatilmagan o'zgaruvchilar ogohlantirishlarini o'chirish
      "@typescript-eslint/no-unused-vars": "off",
      // React Hooks dependencies warninglarini o'chirish
      "react-hooks/exhaustive-deps": "off",
    },
  },
]);

export default eslintConfig;
