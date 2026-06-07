
export const DISTRICT_TRANSLATIONS: Record<string, { uz: string; ru: string }> = {
  "Bektemir": { uz: "Bektemir", ru: "Бектемир" },
  "Mirobod": { uz: "Mirobod", ru: "Мирабад" },
  "Mirzo Ulug'bek": { uz: "Mirzo Ulug'bek", ru: "Мирзо-Улугбек" },
  "Olmazor": { uz: "Olmazor", ru: "Алмазар" },
  "Sergeli": { uz: "Sergeli", ru: "Сергели" },
  "Uchtepa": { uz: "Uchtepa", ru: "Учтепа" },
  "Yakkasaroy": { uz: "Yakkasaroy", ru: "Яккасарай" },
  "Yangihayot": { uz: "Yangihayot", ru: "Янгихаёт" },
  "Yashnobod": { uz: "Yashnobod", ru: "Яшнабад" },
  "Yunusobod": { uz: "Yunusobod", ru: "Юнусабад" },
  "Shayxontohur": { uz: "Shayxontohur", ru: "Шайхантахур" },
  "Chilonzor": { uz: "Chilonzor", ru: "Чиланзар" }
};

export const TOYXONA_TRANSLATIONS: Record<number, {
  title: string;
  location: string;
  description: string;
  tuman?: string;
  menu?: {
    suyuq: string[];
    quyuq: string[];
  };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
}> = {
  1: {
    title: "Свадебный зал Сарбон",
    location: "Ташкент, Бектемирский район, улица Хусайна Байкаро",
    description: "Банкетный зал Сарбон послужит для проведения ваших самых незабываемых дней на высшем уровне. Элегантный интерьер, профессиональные услуги.",
    tuman: "Бектемир",
    menu: {
      suyuq: ["Чучвара", "Мастава", "Шурпа", "Мампар"],
      quyuq: ["Свадебный плов", "Казан кабоб", "Мясное ассорти", "Вагури"]
    }
  },
  2: {
    title: "Свадебный зал Ок сарой",
    location: "Ташкент, Узбекистан",
    description: "Свадебный зал Ок сарой — просторный банкетный зал с роскошным дизайном и уникальной атмосферой.",
    tuman: "Бектемир"
  },
  3: {
    title: "Свадебный зал Мархамат",
    location: "Ташкент, Узбекистан",
    description: "Свадебный зал Мархамат — уютное и доступное место для проведения семейных свадеб и торжеств.",
    tuman: "Бектемир"
  },
  4: {
    title: "Свадебный зал Элегант",
    location: "Ташкент, Узбекистан",
    description: "Свадебный зал Элегант — просторный и современный банкетный зал в светлых тонах.",
    tuman: "Бектемир"
  },
  5: {
    title: "Свадебный зал Бахор",
    location: "Ташкент, Узбекистан",
    description: "Свадебный зал Бахор — отличается великолепным декором и прекрасной акустической системой.",
    tuman: "Бектемир"
  }
};

export const FALLBACK_MENU = {
  uz: {
    suyuq: ["Chuchvara", "Mastava", "Sho'rva", "Mampar"],
    quyuq: ["To'y Palovi", "Qozon Kabob", "Assorti Go'shtli", "Vaguri"],
  },
  ru: {
    suyuq: ["Чучвара", "Мастава", "Шурпа", "Мампар"],
    quyuq: ["Свадебный плов", "Казан кабоб", "Мясное ассорти", "Вагури"],
  }
};

export const FALLBACK_XONANDALAR = {
  uz: [
    { ism: "Jahongir Otajonov", narx: "35,000,000" },
    { ism: "Munisa Rizayeva", narx: "32,000,000" },
  ],
  ru: [
    { ism: "Джахонгир Отажонов", narx: "35,000,000" },
    { ism: "Муниса Ризаева", narx: "32,000,000" },
  ]
};

export function translateToyxona<T extends {
  id: number;
  tuman: string;
  title: string;
  location: string;
  description: string;
  price: number;
  phoneNumber: string;
  menu?: { suyuq: string[]; quyuq: string[] };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
}>(toyxona: T, lang: "uz" | "ru"): T {
  if (lang === "uz" || !toyxona) return toyxona;

  const t = { ...toyxona };

  // Translate basic strings
  const translation = TOYXONA_TRANSLATIONS[t.id];
  if (translation) {
    t.title = translation.title;
    t.location = translation.location;
    t.description = translation.description;
    if (translation.menu) t.menu = translation.menu as T["menu"];
  }

  // Dynamically translate singer names if present
  if (t.xonandalar && t.xonandalar.length > 0) {
    t.xonandalar = t.xonandalar.map(x => {
      let ism = x.ism;
      if (ism === "Jahongir Otajonov") ism = "Джахонгир Отажонов";
      else if (ism === "Munisa Rizayeva") ism = "Муниса Ризаева";
      return { ...x, ism };
    });
  }

  // Translate tuman name
  const tumanTrans = DISTRICT_TRANSLATIONS[t.tuman];
  if (tumanTrans) {
    t.tuman = tumanTrans.ru as unknown as T["tuman"];
  }

  return t;
}
