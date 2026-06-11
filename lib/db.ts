import crypto from "crypto";
import pool from "./pg";

// Ensure database tables are initialized and seeded
async function seedTables() {
  try {
    // 1. additional_services
    const servicesCheck = await pool.query(
      "SELECT 1 FROM additional_services LIMIT 1",
    );
    if (servicesCheck.rows.length === 0) {
      const services = [
        {
          name: { uz: "Chevrolet Gentra (Oq)", ru: "Chevrolet Gentra (Белый)" },
          category: "kortej",
          sub_category: { uz: "Ekonom", ru: "Эконом" },
          price: { uz: "350,000 so'm / kun", ru: "350,000 сум / день" },
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6D2lSOGkEojvsJjSlYz_5hNyQXqT0Krmv_uN3QOgHrw&s=10",
          description: {
            uz: "Kuyov-navkarlar hamda mehmonlar uchun qulay, shinam va hamyonbop klassik transport xizmati.",
            ru: "Удобный, комфортный и доступный классический транспорт для друзей жениха и гостей.",
          },
        },
        {
          name: {
            uz: "Chevrolet Malibu 2 (Qora)",
            ru: "Chevrolet Malibu 2 (Черный)",
          },
          category: "kortej",
          sub_category: { uz: "Komfort", ru: "Комфорт" },
          price: { uz: "700,000 so'm / kun", ru: "700,000 сум / день" },
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYEAVYuRkj0S2DLiBYXrKHqzybVLkzJKfDpf17-ZCt4g&s=10",
          description: {
            uz: "Zamonaviy dizayn, yumshoq yurish va yuqori darajadagi qulaylikka ega bo'lgan ideal tanlov.",
            ru: "Идеальный выбор с современным дизайном, мягким ходом и высоким уровнем комфорта.",
          },
        },
        {
          name: {
            uz: "Mercedes-Benz S-Class (W222)",
            ru: "Mercedes-Benz S-Class (W222)",
          },
          category: "kortej",
          sub_category: { uz: "Lyuks", ru: "Люкс" },
          price: { uz: "2,200,000 so'm / kun", ru: "2,200,000 сум / день" },
          image:
            "https://seo-cms.autoscout24.ch/wp-content/uploads/2025/03/611871B.jpg",
          description: {
            uz: "Sizning unutilmas tantanali kuningiz uchun nufuzli, hashamatli va xavfsiz lyuks avtomobil.",
            ru: "Престижный, роскошный и безопасный автомобиль класса люкс для вашего незабывавого дня торжества.",
          },
        },
        {
          name: {
            uz: "Rolls-Royce Ghost (Oq)",
            ru: "Rolls-Royce Ghost (Белый)",
          },
          category: "kortej",
          sub_category: { uz: "Premium Lyuks", ru: "Премиум Люкс" },
          price: { uz: "7,500,000 so'm / kun", ru: "7,500,000 сум / день" },
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9bXfvDRemlj_j4QPSNoo-R14vuJ_O4EV-J-fIu0e1l14favhebnpCuyE&s=10",
          description: {
            uz: "Haqiqiy qirollik to'yi hashamatini his qilishni istaganlar uchun eng yuqori toifadagi eksklyuziv avtoulov.",
            ru: "Эксклюзивный автомобиль высшего класса для тех, кто хочет прочувствовать настоящую роскошь королевской свадьбы.",
          },
        },
        {
          name: {
            uz: "Mercedes-Benz G-Class (Gelandewagen)",
            ru: "Mercedes-Benz G-Class (Gelandewagen)",
          },
          category: "kortej",
          sub_category: { uz: "VVIP Lyuks", ru: "VVIP Люкс" },
          price: { uz: "4,000,000 so'm / kun", ru: "4,000,000 сум / день" },
          image:
            "https://di-uploads-development.dealerinspire.com/mercedesbenzofcoralgables/uploads/2024/03/New-AMG-G-CLASS-from-Mercedes-Benz.png",
          description: {
            uz: "Kuyov-navkarlar korteji uchun o'ziga xos savlat va qudrat ramzi bo'lgan afsonaviy yo'ltanlamas.",
            ru: "Легендарный внедорожник, являющийся символом особого авторитета и могущества для свадебного кортежа.",
          },
        },
        {
          name: {
            uz: "Milliy Karnay-Surnay Guruhi (Standard)",
            ru: "Национальная группа Карнай-Сурнай (Стандарт)",
          },
          category: "music",
          sub_category: null,
          price: { uz: "1,500,000 so'm", ru: "1,500,000 сум" },
          image:
            "https://frankfurt.apollo.olxcdn.com/v1/files/6bgrbdxoih3o2-UZ/image;s=1080x1080",
          description: {
            uz: "To'yxonada mehmonlar va kelin-kuyovlarni milliy ohanglar, karnay-surnay sadosi ostida kutib olish marosimi.",
            ru: "Церемония встречи гостей и молодоженов в зале под национальные мелодии и звуки карная-сурная.",
          },
        },
        {
          name: {
            uz: "Professional Royal Karnay Guruhi",
            ru: "Профессиональная группа Рояль Карнай",
          },
          category: "music",
          sub_category: null,
          price: { uz: "3,000,000 so'm", ru: "3,000,000 сум" },
          image:
            "https://leadbook.ru/thumbnails/medium/uploads/profile/522_1442508490.JPG",
          description: {
            uz: "Milliy liboslardagi 8 kishilik kengaytirilgan guruh (karnay, surnay, nogora) hamda maxsus sahna chiqishlari.",
            ru: "Расширенная группа из 8 человек в национальных костюмах (карнай, сурнай, дойра), а также специальные сценические выступления.",
          },
        },
        {
          name: {
            uz: "Kelin-Kuyov Xonadoni Bezatish (Elegant)",
            ru: "Оформление дома невесты/жениха (Элегант)",
          },
          category: "decor",
          sub_category: null,
          price: { uz: "2,500,000 so'm", ru: "2,500,000 сум" },
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEikzAmL-XNhkHCmU90q2ao45YPS0Cx49yHuCeS7cdchtHC0IaC1SSk3ST&s=10",
          description: {
            uz: "Kelin yoki kuyov uyining darvozaxonasi, hovlisi va xonalarini zamonaviy pardozlar, lentalar va dekorlar bilan bezash.",
            ru: "Украшение ворот, двора и комнат дома невесты или жениха современными отделочными материалами, лентами и декором.",
          },
        },
        {
          name: {
            uz: "Hashamatli LED & Jonli Gullar Dekori",
            ru: "Роскошный декор со светодиодами и живыми цветами",
          },
          category: "decor",
          sub_category: null,
          price: { uz: "5,500,000 so'm", ru: "5,500,000 сум" },
          image:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ0sGPc6dDPbbjI8ynhdLIz51LjxBax57sb5DN7SgAXjBZVmanAt5GvbZY&s=10",
          description: {
            uz: "Xonadoningizda to'y kayfiyatini yaratish uchun jonli premium gullar, LED chiroqlar va fotozona dekoratsiyalari.",
            ru: "Живые цветы премиум-класса, светодиодные подсветки и фотозоны для создания свадебного настроения в вашем доме.",
          },
        },
        {
          name: { uz: "Klassik Oq guldasta", ru: "Классический белый букет" },
          category: "bouquet",
          sub_category: null,
          price: { uz: "450,000 so'm", ru: "450,000 сум" },
          image:
            "https://i.pinimg.com/webp/1200x/9b/26/a8/9b26a8fd94a9b30eb87031982ce259bd.webp",
          description: {
            uz: "Nozik oq atirgullar va yashil barglar uyg'unligidan tayyorlangan nafis, abadiy klassik kelin guldastasi.",
            ru: "Элегантный, вечно классический букет невесты, созданный из гармоничного сочетания нежных белых роз и зеленых листьев.",
          },
        },
        {
          name: {
            uz: "Qirollik Peon & Orxideya Guldastasi",
            ru: "Королевский букет из пионов и орхидей",
          },
          category: "bouquet",
          sub_category: null,
          price: { uz: "1,200,000 so'm", ru: "1,200,000 сум" },
          image:
            "https://i.pinimg.com/webp/736x/00/7c/ad/007cad0eb0bb0fbe5681af320e549026.webp",
          description: {
            uz: "Import qilingan noyob peonlar, nafis orxideya va maxsus lentalar bilan tayyorlanadigan hashamatli guldasta.",
            ru: "Роскошный букет, созданный с использованием редких импортных пионов, нежных орхидей и специальных лент.",
          },
        },
        {
          name: { uz: "Eksklyuziv Kelin Libosi (Oq)", ru: "Эксклюзивное свадебное платье (Белое)" },
          category: "women",
          sub_category: { uz: "Kelin Liboslar", ru: "Свадебные платья" },
          price: { uz: "3,500,000 so'm / kun", ru: "3,500,000 сум / день" },
          image: "https://i.pinimg.com/736x/35/6b/ea/356beaf1c02ab84d4daff1dcdaebfc64.jpg",
          description: {
            uz: "Zamonaviy dizayndagi, qo'l mehnati bilan bezatilgan va hashamatli oq kelinlik libosi.",
            ru: "Роскошное белое свадебное платье современного дизайна, украшенное ручной работой."
          }
        },
        {
          name: { uz: "Kelin Salom Milliy Ansambli", ru: "Национальный ансамбль Келин Салом" },
          category: "women",
          sub_category: { uz: "Milliy Liboslar", ru: "Национальные наряды" },
          price: { uz: "1,800,000 so'm / kun", ru: "1,800,000 сум / день" },
          image: "https://i.pinimg.com/736x/55/f1/b7/55f1b72eddf2fb2d1e041cd4baeb7a7e.jpg",
          description: {
            uz: "Kelin salom marosimi uchun mo'ljallangan, milliy naqshlar bilan tikilgan an'anaviy zarbof liboslar to'plami.",
            ru: "Традиционный набор одежды с национальными узорами, предназначенный для церемонии келин салом."
          }
        },
        {
          name: { uz: "Professional Kelin Makiyaji va Soch Turmagi", ru: "Профессиональный свадебный макияж и прическа" },
          category: "women",
          sub_category: { uz: "Stilist va Vizajist", ru: "Стилист и Визажист" },
          price: { uz: "2,000,000 so'm", ru: "2,000,000 сум" },
          image: "https://i.pinimg.com/736x/6f/30/16/6f30164c0525287f3b89098bc19d36ea.jpg",
          description: {
            uz: "To'y kuningizda eng go'zal ko'rinishga ega bo'lishingiz uchun professional vizajist va soch ustalarining maxsus xizmati.",
            ru: "Специальные услуги профессионального визажиста и парикмахера, чтобы вы выглядели неотразимо в день свадьбы."
          }
        },
        {
          name: { uz: "Kelin Salom Xonanda Ayollari (Guruh)", ru: "Женская группа исполнительниц Келин Салом" },
          category: "music",
          sub_category: null,
          price: { uz: "1,500,000 so'm", ru: "1,500,000 сум" },
          image: "https://i.pinimg.com/736x/2d/a2/29/2da229a5ec13d80a153be415f3e9365c.jpg",
          description: {
            uz: "To'yda kelin salom marosimini milliy ohanglar, qo'shiqlar va maxsus ko'rinishlar bilan o'tkazib beruvchi professional xonandalar guruhi.",
            ru: "Профессиональная женская группа певиц, которая проведет церемонию келин салом под национальные мелодии, песни и специальные выступления."
          }
        },
        {
          name: { uz: "Ijaraga Oqshom Ko'ylaklari", ru: "Вечерние платья напрокат" },
          category: "women",
          sub_category: { uz: "Dugonalar uchun", ru: "Для подружек невесты" },
          price: { uz: "400,000 so'm dan / kun", ru: "от 400,000 сум / день" },
          image: "https://i.pinimg.com/736x/1a/10/7c/1a107c1b4807a505bdf9ff15edb7d305.jpg",
          description: {
            uz: "Kelinning dugonalari va to'y mehmonlari uchun mos keladigan zamonaviy, bir xil dizayndagi oqshom ko'ylaklari ijarasi.",
            ru: "Аренда современных одинаковых вечерних платьев, подходящих для подружек невесты и гостей свадьбы."
          }
        },
        {
          name: { uz: "Kuyov uchun Barber Xizmati", ru: "Услуги барбера для жениха" },
          category: "men",
          sub_category: { uz: "Erkaklar Saloni", ru: "Мужской салон" },
          price: { uz: "500,000 so'm", ru: "500,000 сум" },
          image: "https://i.pinimg.com/736x/14/b4/0b/14b40bd47a7465fbbbe28a6fcf7c7c0b.jpg",
          description: {
            uz: "To'y kuni kuyovlar uchun professional soch va soqol turmagi, yuz parvarishi hamda tayyorgarlik jarayoni.",
            ru: "Профессиональная стрижка волос и бороды, уход за лицом и процесс подготовки жениха в день свадьбы."
          }
        },
        {
          name: { uz: "Kuyovlar uchun Kostyum-shim ijarasi", ru: "Прокат мужских костюмов для жениха" },
          category: "men",
          sub_category: { uz: "Kuyov Liboslari", ru: "Наряды жениха" },
          price: { uz: "1,200,000 so'm / kun", ru: "1,200,000 сум / день" },
          image: "https://i.pinimg.com/736x/2b/9b/77/2b9b7759d57a911a3df3ecba25838cf3.jpg",
          description: {
            uz: "Turkiya va Italiya brendlarining eng so'nggi urfdagi zamonaviy smoking hamda klassik kostyum-shimlari.",
            ru: "Современные смокинги и классические костюмы по последней моде от турецких и итальянских брендов."
          }
        }
      ];

      for (const s of services) {
        await pool.query(
          `INSERT INTO additional_services (name, category, sub_category, price, image, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            JSON.stringify(s.name),
            s.category,
            s.sub_category ? JSON.stringify(s.sub_category) : null,
            JSON.stringify(s.price),
            s.image,
            JSON.stringify(s.description),
          ],
        );
      }
    }

    // 2. menu_items
    const menuCheck = await pool.query("SELECT 1 FROM menu_items LIMIT 1");
    if (menuCheck.rows.length === 0) {
      const menus = [
        {
          category: "Suyuq Taomlar",
          name: "Sho'rva",
          price: "25,000 so'm",
          description:
            "Tovuq yoki qo'y go'shtidan mayin bulyon va sabzavotlar bilan.",
        },
        {
          category: "Suyuq Taomlar",
          name: "Mastava",
          price: "22,000 so'm",
          description:
            "Guruch, go'sht va maxsus ziravorlar bilan an'anaviy sho'rva.",
        },
        {
          category: "Suyuq Taomlar",
          name: "Chuchvara",
          price: "28,000 so'm",
          description: "Qo'lda tugilgan mayda chuchvaralar mazali bulyonda.",
        },
        {
          category: "Suyuq Taomlar",
          name: "Mampar",
          price: "24,000 so'm",
          description:
            "Xamir bo'lakchalari va go'shtli qayla bilan to'yimli suyuq taom.",
        },
        {
          category: "Quyuq Taomlar",
          name: "To'y Palovi",
          price: "45,000 so'm",
          description:
            "Lazer guruchidan, sarxil sabzi va mayin qo'y go'shti bilan.",
        },
        {
          category: "Quyuq Taomlar",
          name: "Qozon Kabob",
          price: "55,000 so'm",
          description:
            "Qozonda qovurilgan kartoshka va suvli mol/qo'y go'shti.",
        },
        {
          category: "Quyuq Taomlar",
          name: "Assorti Go'shtli",
          price: "80,000 so'm",
          description:
            "Turli xildagi dimlangan va qovurilgan go'shtlar to'plami.",
        },
        {
          category: "Quyuq Taomlar",
          name: "Vaguri",
          price: "60,000 so'm",
          description:
            "Qo'y go'shtining o'z yog'ida qovurilgan maxsus bo'laklari.",
        },
        {
          category: "Salatlar",
          name: "Achchuchuk",
          price: "12,000 so'm",
          description:
            "Pomidor, piyoz va achchiq qalampirning yupqa to'g'ralgan aralashmasi.",
        },
        {
          category: "Salatlar",
          name: "Bahor",
          price: "15,000 so'm",
          description:
            "Bodring, ko'katlar va maxsus sous bilan tayyorlangan salat.",
        },
        {
          category: "Salatlar",
          name: "Smak",
          price: "18,000 so'm",
          description: "Pomidor, pishloq va krutonlar bilan to'yimli salat.",
        },
      ];

      for (const m of menus) {
        await pool.query(
          `INSERT INTO menu_items (category, name, price, description)
           VALUES ($1, $2, $3, $4)`,
          [m.category, m.name, m.price, m.description],
        );
      }
    }

    // 3. pricing_packages
    const packagesCheck = await pool.query(
      "SELECT 1 FROM pricing_packages LIMIT 1",
    );
    if (packagesCheck.rows.length === 0) {
      const packages = [
        {
          name: "Ekonom Paket",
          price: "15,000,000 so'm dan",
          description: "Asosiy va an'anaviy marosimlar uchun mos paket.",
          features: [
            "150 kishilik zal sig'imi",
            "Standart 2 xil taom (Sho'rva, Palov)",
            "Karnay-surnay xizmati",
            "Standart ovoz tizimi va chiroqlar",
          ],
          badge: "Eng ommabop",
        },
        {
          name: "Standart Paket",
          price: "30,000,000 so'm dan",
          description: "O'rtacha darajadagi va to'liq tantanalar uchun.",
          features: [
            "300 kishilik zal sig'imi",
            "3 xil taom va salatlar to'plami",
            "Karnay-surnay va milliy cholg'ular",
            "Boshlovchi va standart san'atkorlar",
            "Professional chiroq va akustika",
          ],
          badge: "Tavsiya etiladi",
        },
        {
          name: "Premium Paket",
          price: "60,000,000 so'm dan",
          description: "Hashamatli, eksklyuziv va unutilmas tantanalar uchun.",
          features: [
            "500+ kishilik zal sig'imi",
            "Premium toifadagi taomlar va desertlar",
            "Estrada yulduzlari chiqishi",
            "Maxsus yoritish va 3D LED ekranlar",
            "Fotolar va videolavhalar paketi",
          ],
          badge: "VIP xizmat",
        },
      ];

      for (const p of packages) {
        await pool.query(
          `INSERT INTO pricing_packages (name, price, description, features, badge)
           VALUES ($1, $2, $3, $4, $5)`,
          [p.name, p.price, p.description, JSON.stringify(p.features), p.badge],
        );
      }
    }

    // 4. gallery_items
    const galleryCheck = await pool.query(
      "SELECT 1 FROM gallery_items LIMIT 1",
    );
    if (galleryCheck.rows.length === 0) {
      const gallery = [
        { src: "/osh.jpg", title: "To'y Palovi" },
        { src: "/chuchvara.jpg", title: "Chuchvara" },
        { src: "/mastava.jpg", title: "Mastava" },
        { src: "/shorva.jpg", title: "Sho'rva" },
        { src: "/mampar.jpg", title: "Mampar" },
        { src: "/qozon-kabob.jpg", title: "Qozon Kabob" },
        { src: "/assorti.jpg", title: "Assorti Go'shtli" },
        { src: "/tuxumbarak.jpg", title: "Tuxumbarak" },
        { src: "/salat.jpg", title: "Salat" },
        { src: "/achchuchuk.jpg", title: "Achchuchuk" },
      ];

      for (const g of gallery) {
        await pool.query(
          `INSERT INTO gallery_items (src, title)
           VALUES ($1, $2)`,
          [g.src, g.title],
        );
      }
    }

    // 5. hall_categories
    const hallsCheck = await pool.query(
      "SELECT 1 FROM hall_categories LIMIT 1",
    );
    if (hallsCheck.rows.length === 0) {
      const halls = [
        {
          title: "Katta Tantanalar Zali",
          capacity: "400 - 1000 kishi",
          description:
            "Keng miqyosdagi to'ylar, yirik korporativ tadbirlar va yubileylar uchun mo'ljallangan hashamatli zal.",
          features: [
            "Professional akustika",
            "Baland shiftlar",
            "Katta sahna",
            "Premium yoritish tizimi",
          ],
          image:
            "https://sarbon-restaurant.uz/_next/image?url=%2Fhalls%2Fmain%2Fmain-2.webp&w=3840&q=75",
        },
        {
          title: "VIP Kichik Marosimlar Zali",
          capacity: "100 - 250 kishi",
          description:
            "Yaqin oilaviy davralar, unashtiruv marosimlari va mini-banketlar uchun qulay va shinam muhit.",
          features: [
            "Shinam dizayn",
            "Alohida kirish joyi",
            "Oila uchun maxsus hudud",
            "Jonli ijro uchun moslashtirilgan",
          ],
          image:
            "https://thumbs.dreamstime.com/b/luxury-banquet-hall-scene-luxurious-adorned-elegant-chandeliers-ornate-columns-floral-arrangements-creating-opulent-405088627.jpg",
        },
        {
          title: "Yozgi Terrasa va Ochiq Maydon",
          capacity: "150 - 400 kishi",
          description:
            "Yoz kunlarida ochiq osmon ostida, yashil tabiat qo'ynida go'zal nikoh oqshomlarini o'tkazish uchun eng yaxshi maskan.",
          features: [
            "Tabiiy manzara",
            "Fountains",
            "Lounge hududi",
            "Barbekyu va ochiq oshxona",
          ],
          image:
            "https://avatars.mds.yandex.net/get-altay/12548008/2a0000018f1a4963f2f61c9bd236bec1e9d6/L_height",
        },
      ];

      for (const h of halls) {
        await pool.query(
          `INSERT INTO hall_categories (title, capacity, description, features, image)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            h.title,
            h.capacity,
            h.description,
            JSON.stringify(h.features),
            h.image,
          ],
        );
      }
    }
  } catch (err) {
    console.error("Error seeding tables:", err);
  }
}

async function initializeDatabase() {
  try {
    const checkTable = await pool.query(
      "SELECT 1 FROM information_schema.tables WHERE table_name = 'additional_services' LIMIT 1",
    );
    if (checkTable.rows.length > 0) {
      return;
    }
    // 1. Core tables updates
    await pool.query(`
      ALTER TABLE venue_singers ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE venue_cars ADD COLUMN IF NOT EXISTS image TEXT;
      ALTER TABLE venues ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'UZS';

      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        sender_id INT REFERENCES users(id) ON DELETE SET NULL,
        receiver_id INT REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_admin_message BOOLEAN DEFAULT FALSE
      );
      ALTER TABLE messages ADD COLUMN IF NOT EXISTS subject VARCHAR(255);
    `);

    // 2. Create new tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS additional_services (
        id SERIAL PRIMARY KEY,
        name JSONB NOT NULL,
        category VARCHAR(50) NOT NULL,
        sub_category JSONB,
        price JSONB NOT NULL,
        image TEXT,
        description JSONB NOT NULL
      );

      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        category VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS pricing_packages (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        features JSONB NOT NULL,
        badge VARCHAR(255)
      );

      CREATE TABLE IF NOT EXISTS gallery_items (
        id SERIAL PRIMARY KEY,
        src VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hall_categories (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        capacity VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        features JSONB NOT NULL,
        image VARCHAR(255) NOT NULL
      );
    `);

    // 3. Seed tables
    await seedTables();
  } catch (err) {
    console.error("Error initializing database schema:", err);
  }
}

// initializeDatabase();

// ─── Xizmat Ko'rsatuvchilar uchun Migration ──────────────────────────────────
export async function migrateServiceProviders() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(50) NOT NULL,
        sub_category VARCHAR(100),
        description TEXT,
        phone VARCHAR(50) NOT NULL,
        address VARCHAR(255),
        images JSONB DEFAULT '[]',
        price_per_session VARCHAR(100),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS service_bookings (
        id SERIAL PRIMARY KEY,
        provider_id INT REFERENCES service_providers(id) ON DELETE CASCADE,
        booking_date DATE NOT NULL,
        start_time VARCHAR(10) NOT NULL,
        end_time VARCHAR(10) NOT NULL,
        client_name VARCHAR(255) NOT NULL,
        client_phone VARCHAR(50) NOT NULL,
        note TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } catch (err) {
    console.error("Error migrating service_providers tables:", err);
  }
}

// Auto-run migration on import
migrateServiceProviders();

import { DISTRICTS, getDistrictSlug } from "./districts";
export { DISTRICTS, getDistrictSlug };

export interface UserType {
  id: number;
  name: string;
  surname: string;
  email: string;
  username: string;
  password?: string;
  role: "admin" | "owner" | "user";
  verified: boolean;
  otp?: string;
}

export interface MessageType {
  id: number;
  senderId: number | null;
  receiverId: number | null;
  name: string;
  phone: string;
  message: string;
  sentAt: string;
  isAdminMessage: boolean;
  subject?: string;
}

export interface ToyxonaType {
  id: number;
  tuman: string;
  title: string;
  price: number;
  image: string;
  images?: string[];
  location: string;
  description: string;
  phoneNumber: string;
  status: "tasdiqlangan" | "tasdiqlanmagan";
  capacity: number;
  ownerId?: number;
  currency?: "UZS" | "USD";
  menu?: { suyuq: string[]; quyuq: string[]; images?: string[] };
  xonandalar?: Array<{ ism: string; narx: string; rasm?: string }>;
  karnaySurnay?: { mavjud: boolean; narx: string };
  mashinalar?: Array<{ brand: string; price: string; image?: string }>;
  bronKunlar?: number[];
  singersEnabled?: boolean;
  carsEnabled?: boolean;
}

export interface BookingType {
  id: number;
  toyxonaId: number;
  toyxonaTitle: string;
  tuman: string;
  sana: string;
  odamSoni: number;
  user: { ism: string; familiya: string; raqam: string; userId?: number };
  xizmatlar: string[];
  status: "bo'lib o'tgan" | "endi bo'ladigan";
  grandTotal?: number;
  prepayAmount?: number;
  currency?: string;
}

export interface DbType {
  users: UserType[];
  toyxonalar: ToyxonaType[];
  bookings: BookingType[];
}

export function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ─── Direct SQL helpers (tez, faqat kerakli so'rovlar) ──────────────────────

export async function getUsers(): Promise<UserType[]> {
  const res = await pool.query(
    "SELECT id, name, surname, email, username, password, role, verified, otp FROM users ORDER BY id ASC",
  );
  return res.rows.map((r) => ({
    id: r.id,
    name: r.name,
    surname: r.surname,
    email: r.email,
    username: r.username,
    password: r.password,
    role: r.role,
    verified: r.verified,
    otp: r.otp || undefined,
  }));
}

export async function getUserByUsername(
  username: string,
): Promise<UserType | null> {
  const res = await pool.query(
    "SELECT * FROM users WHERE username = $1 LIMIT 1",
    [username],
  );
  if (!res.rows[0]) return null;
  const r = res.rows[0];
  return {
    id: r.id,
    name: r.name,
    surname: r.surname,
    email: r.email,
    username: r.username,
    password: r.password,
    role: r.role,
    verified: r.verified,
    otp: r.otp || undefined,
  };
}

export async function getUserById(id: number): Promise<UserType | null> {
  const res = await pool.query("SELECT * FROM users WHERE id = $1 LIMIT 1", [
    id,
  ]);
  if (!res.rows[0]) return null;
  const r = res.rows[0];
  return {
    id: r.id,
    name: r.name,
    surname: r.surname,
    email: r.email,
    username: r.username,
    password: r.password,
    role: r.role,
    verified: r.verified,
    otp: r.otp || undefined,
  };
}

export async function saveUser(user: UserType): Promise<void> {
  await pool.query(
    `INSERT INTO users (id, name, surname, email, username, password, role, verified, otp)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT (id) DO UPDATE SET
       name=EXCLUDED.name, surname=EXCLUDED.surname, email=EXCLUDED.email,
       username=EXCLUDED.username, password=EXCLUDED.password,
       role=EXCLUDED.role, verified=EXCLUDED.verified, otp=EXCLUDED.otp`,
    [
      user.id,
      user.name,
      user.surname,
      user.email,
      user.username,
      user.password,
      user.role,
      user.verified,
      user.otp || null,
    ],
  );
}

export async function getNextUserId(): Promise<number> {
  const res = await pool.query(
    "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM users",
  );
  return res.rows[0].next_id;
}

// Venues
export async function getVenues(
  filters: {
    tuman?: string;
    status?: string;
    ownerId?: number;
    id?: number;
  } = {},
): Promise<ToyxonaType[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let i = 1;

  if (filters.id !== undefined) {
    conditions.push(`v.id = $${i++}`);
    params.push(filters.id);
  }
  if (filters.status) {
    conditions.push(`v.status = $${i++}`);
    params.push(filters.status);
  }
  if (filters.tuman) {
    conditions.push(`LOWER(v.tuman) = LOWER($${i++})`);
    params.push(filters.tuman);
  }
  if (filters.ownerId !== undefined) {
    conditions.push(`v.owner_id = $${i++}`);
    params.push(filters.ownerId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query(
    `SELECT * FROM venues ${where} ORDER BY v.id ASC`.replace(
      "FROM venues",
      "FROM venues v",
    ),
    params,
  );

  if (!res.rows.length) return [];

  const venueIds = res.rows.map((r) => r.id);

  // Barcha related ma'lumotlarni bitta so'rovda olish (N+1 muammosi hal qilindi)
  const [imgRes, singerRes, carRes, bookingRes] = await Promise.all([
    pool.query(
      `SELECT venue_id, image_url FROM venue_images WHERE venue_id = ANY($1)`,
      [venueIds],
    ),
    pool.query(
      `SELECT venue_id, name, price, image FROM venue_singers WHERE venue_id = ANY($1)`,
      [venueIds],
    ),
    pool.query(
      `SELECT venue_id, brand, price, image FROM venue_cars WHERE venue_id = ANY($1)`,
      [venueIds],
    ),
    pool.query(
      `SELECT venue_id, booking_date FROM bookings WHERE venue_id = ANY($1)`,
      [venueIds],
    ),
  ]);

  // Map'larga yig'ish (tezkor lookup)
  const imgMap = new Map<number, string[]>();
  imgRes.rows.forEach((r) => {
    if (!imgMap.has(r.venue_id)) imgMap.set(r.venue_id, []);
    imgMap.get(r.venue_id)!.push(r.image_url);
  });

  const singerMap = new Map<
    number,
    { ism: string; narx: string; rasm?: string }[]
  >();
  singerRes.rows.forEach((r) => {
    if (!singerMap.has(r.venue_id)) singerMap.set(r.venue_id, []);
    singerMap
      .get(r.venue_id)!
      .push({
        ism: r.name,
        narx: Number(r.price).toLocaleString(),
        rasm: r.image || undefined,
      });
  });

  const carMap = new Map<
    number,
    { brand: string; price: string; image?: string }[]
  >();
  carRes.rows.forEach((r) => {
    if (!carMap.has(r.venue_id)) carMap.set(r.venue_id, []);
    carMap
      .get(r.venue_id)!
      .push({
        brand: r.brand,
        price: Number(r.price).toLocaleString(),
        image: r.image || undefined,
      });
  });

  const bronMap = new Map<number, number[]>();
  bookingRes.rows.forEach((r) => {
    if (!bronMap.has(r.venue_id)) bronMap.set(r.venue_id, []);
    bronMap.get(r.venue_id)!.push(new Date(r.booking_date).getDate());
  });

  return res.rows.map((r) => ({
    id: r.id,
    tuman: r.tuman,
    title: r.title,
    price: Number(r.price),
    image: r.image,
    images: imgMap.get(r.id) || [],
    location: r.location,
    description: r.description || "",
    phoneNumber: r.phone_number,
    status: r.status,
    capacity: r.capacity,
    ownerId: r.owner_id || undefined,
    currency: r.currency || "UZS",
    menu: typeof r.menu === "string" ? JSON.parse(r.menu) : r.menu || undefined,
    xonandalar: singerMap.get(r.id) || [],
    karnaySurnay: r.karnay_surnay_available
      ? { mavjud: true, narx: Number(r.karnay_surnay_price).toLocaleString() }
      : undefined,
    mashinalar: carMap.get(r.id) || [],
    bronKunlar: bronMap.get(r.id) || [],
    singersEnabled: !!r.singers_enabled,
    carsEnabled: !!r.cars_enabled,
  }));
}

export async function getNextVenueId(): Promise<number> {
  const res = await pool.query(
    "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM venues",
  );
  return res.rows[0].next_id;
}

export async function saveVenue(t: ToyxonaType): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const isKarnayAvail = !!t.karnaySurnay?.mavjud;
    const karnayPrice = t.karnaySurnay
      ? Number(String(t.karnaySurnay.narx).replace(/,/g, ""))
      : 0;

    await client.query(
      `INSERT INTO venues (id, tuman, title, price, image, location, description, phone_number, status, capacity, owner_id, karnay_surnay_available, karnay_surnay_price, menu, currency, singers_enabled, cars_enabled)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO UPDATE SET
         tuman=EXCLUDED.tuman, title=EXCLUDED.title, price=EXCLUDED.price, image=EXCLUDED.image,
         location=EXCLUDED.location, description=EXCLUDED.description, phone_number=EXCLUDED.phone_number,
         status=EXCLUDED.status, capacity=EXCLUDED.capacity, owner_id=EXCLUDED.owner_id,
         karnay_surnay_available=EXCLUDED.karnay_surnay_available,
         karnay_surnay_price=EXCLUDED.karnay_surnay_price, menu=EXCLUDED.menu, currency=EXCLUDED.currency,
         singers_enabled=EXCLUDED.singers_enabled, cars_enabled=EXCLUDED.cars_enabled`,
      [
        t.id,
        t.tuman,
        t.title,
        t.price,
        t.image,
        t.location,
        t.description,
        t.phoneNumber,
        t.status,
        t.capacity,
        t.ownerId || null,
        isKarnayAvail,
        karnayPrice,
        t.menu || null,
        t.currency || "UZS",
        t.singersEnabled || false,
        t.carsEnabled || false,
      ],
    );

    await client.query("DELETE FROM venue_images WHERE venue_id = $1", [t.id]);
    if (t.images?.length) {
      for (const img of t.images)
        await client.query(
          "INSERT INTO venue_images (venue_id, image_url) VALUES ($1,$2)",
          [t.id, img],
        );
    }
    await client.query("DELETE FROM venue_singers WHERE venue_id = $1", [t.id]);
    if (t.xonandalar?.length) {
      for (const s of t.xonandalar) {
        const singerPrice = s.narx
          ? Number(String(s.narx).replace(/,/g, ""))
          : 0;
        await client.query(
          "INSERT INTO venue_singers (venue_id, name, price, image) VALUES ($1,$2,$3,$4)",
          [t.id, s.ism, singerPrice, s.rasm || null],
        );
      }
    }
    await client.query("DELETE FROM venue_cars WHERE venue_id = $1", [t.id]);
    if (t.mashinalar?.length) {
      for (const c of t.mashinalar) {
        const carPrice = c.price
          ? Number(String(c.price).replace(/,/g, ""))
          : 0;
        await client.query(
          "INSERT INTO venue_cars (venue_id, brand, price, image) VALUES ($1,$2,$3,$4)",
          [t.id, c.brand, carPrice, c.image || null],
        );
      }
    }
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

// Bookings
export async function getBookings(
  filters: {
    userId?: number;
    ownerId?: number;
    toyxonaId?: number;
    tuman?: string;
    status?: string;
  } = {},
): Promise<BookingType[]> {
  const conditions: string[] = [];
  const params: (string | number)[] = [];
  let i = 1;

  if (filters.userId !== undefined) {
    conditions.push(`b.user_id = $${i++}`);
    params.push(filters.userId);
  }
  if (filters.ownerId !== undefined) {
    conditions.push(`v.owner_id = $${i++}`);
    params.push(filters.ownerId);
  }
  if (filters.toyxonaId !== undefined) {
    conditions.push(`b.venue_id = $${i++}`);
    params.push(filters.toyxonaId);
  }
  if (filters.tuman) {
    conditions.push(`LOWER(v.tuman) = LOWER($${i++})`);
    params.push(filters.tuman);
  }
  if (filters.status) {
    conditions.push(`b.status = $${i++}`);
    params.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query(
    `SELECT b.*, v.title AS venue_title, v.tuman AS venue_tuman
     FROM bookings b LEFT JOIN venues v ON b.venue_id = v.id
     ${where} ORDER BY b.id ASC`,
    params,
  );

  // Fetch all venues to  pricing details dynamically
  const venues = await getVenues();
  const venueMap = new Map(venues.map((v) => [v.id, v]));

  return res.rows.map((r) => {
    const bXizmatlar =
      typeof r.selected_services === "string"
        ? JSON.parse(r.selected_services)
        : r.selected_services || [];
    const venue = venueMap.get(r.venue_id);

    let grandTotal = 0;
    let prepayAmount = 0;
    let currency = "UZS";

    if (venue) {
      currency = venue.currency || "UZS";
      const mainPriceTotal = r.guest_count * venue.price;
      let extraServicesTotal = 0;
      if (bXizmatlar && bXizmatlar.length > 0) {
        bXizmatlar.forEach((serviceName: string) => {
          if (
            (serviceName === "Karnay-surnay xizmati" ||
              serviceName.includes("Karnay")) &&
            venue.karnaySurnay
          ) {
            extraServicesTotal +=
              Number(String(venue.karnaySurnay.narx).replace(/,/g, "")) || 0;
          }
          const matchingXonanda = venue.xonandalar?.find(
            (x) => x.ism === serviceName,
          );
          if (matchingXonanda) {
            extraServicesTotal +=
              Number(String(matchingXonanda.narx).replace(/,/g, "")) || 0;
          }
          const matchingMashina = venue.mashinalar?.find(
            (m) => m.brand === serviceName,
          );
          if (matchingMashina) {
            extraServicesTotal +=
              Number(String(matchingMashina.price).replace(/,/g, "")) || 0;
          }
        });
      }
      grandTotal = mainPriceTotal + extraServicesTotal;
      prepayAmount = grandTotal * 0.2; // 20% avans
    }

    return {
      id: r.id,
      toyxonaId: r.venue_id,
      toyxonaTitle: r.venue_title || "",
      tuman: r.venue_tuman || "",
      sana: r.booking_date
        ? (() => {
            const d = new Date(r.booking_date);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            return `${y}-${m}-${day}`;
          })()
        : "",
      odamSoni: r.guest_count,
      user: {
        ism: r.contact_name,
        familiya: r.contact_surname,
        raqam: r.contact_phone,
        userId: r.user_id || undefined,
      },
      xizmatlar: bXizmatlar,
      status: r.status,
      grandTotal,
      prepayAmount,
      currency,
    };
  });
}

export async function getNextBookingId(): Promise<number> {
  const res = await pool.query(
    "SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM bookings",
  );
  return res.rows[0].next_id;
}

export async function saveBooking(b: BookingType): Promise<void> {
  const dateStr = b.sana.includes("-")
    ? b.sana
    : `2026-05-${Number(b.sana).toString().padStart(2, "0")}`;
  await pool.query(
    `INSERT INTO bookings (id, venue_id, user_id, booking_date, guest_count, contact_name, contact_surname, contact_phone, selected_services, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     ON CONFLICT (id) DO UPDATE SET
       venue_id=EXCLUDED.venue_id, user_id=EXCLUDED.user_id, booking_date=EXCLUDED.booking_date,
       guest_count=EXCLUDED.guest_count, contact_name=EXCLUDED.contact_name,
       contact_surname=EXCLUDED.contact_surname, contact_phone=EXCLUDED.contact_phone,
       selected_services=EXCLUDED.selected_services, status=EXCLUDED.status`,
    [
      b.id,
      b.toyxonaId,
      b.user.userId || null,
      dateStr,
      b.odamSoni,
      b.user.ism,
      b.user.familiya,
      b.user.raqam,
      JSON.stringify(b.xizmatlar),
      b.status,
    ],
  );
}

export async function deleteBooking(id: number): Promise<void> {
  await pool.query("DELETE FROM bookings WHERE id = $1", [id]);
}

// ─── Legacy getDb / saveDb (mavjud ishlayotgan codega mosligi uchun) ─────────
// Yangi code yuqoridagi to'g'ridan-to'g'ri funksiyalarni ishlatsin.
export async function getDb(): Promise<DbType> {
  try {
    const [users, toyxonalar, bookings] = await Promise.all([
      getUsers(),
      getVenues(),
      getBookings(),
    ]);
    return { users, toyxonalar, bookings };
  } catch (error) {
    console.error("getDb error:", error);
    return { users: [], toyxonalar: [], bookings: [] };
  }
}

export async function saveDb(data: DbType): Promise<void> {
  // saveDb to'liq ma'lumotlarni sinxronlash — faqat zarur holatlarda ishlatilsin
  // Yangi code saveVenue, saveBooking, saveUser'dan foydalansin
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const u of data.users) {
      await client.query(
        `INSERT INTO users (id, name, surname, email, username, password, role, verified, otp)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, surname=EXCLUDED.surname, email=EXCLUDED.email,
           username=EXCLUDED.username, password=EXCLUDED.password,
           role=EXCLUDED.role, verified=EXCLUDED.verified, otp=EXCLUDED.otp`,
        [
          u.id,
          u.name,
          u.surname,
          u.email,
          u.username,
          u.password,
          u.role,
          u.verified,
          u.otp || null,
        ],
      );
    }

    for (const t of data.toyxonalar) {
      const isKarnayAvail = !!t.karnaySurnay?.mavjud;
      const karnayPrice = t.karnaySurnay
        ? Number(t.karnaySurnay.narx.replace(/,/g, ""))
        : 0;
      await client.query(
        `INSERT INTO venues (id, tuman, title, price, image, location, description, phone_number, status, capacity, owner_id, karnay_surnay_available, karnay_surnay_price, menu, currency, singers_enabled, cars_enabled)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
         ON CONFLICT (id) DO UPDATE SET
           tuman=EXCLUDED.tuman, title=EXCLUDED.title, price=EXCLUDED.price, image=EXCLUDED.image,
           location=EXCLUDED.location, description=EXCLUDED.description, phone_number=EXCLUDED.phone_number,
           status=EXCLUDED.status, capacity=EXCLUDED.capacity, owner_id=EXCLUDED.owner_id,
           karnay_surnay_available=EXCLUDED.karnay_surnay_available,
           karnay_surnay_price=EXCLUDED.karnay_surnay_price, menu=EXCLUDED.menu, currency=EXCLUDED.currency,
           singers_enabled=EXCLUDED.singers_enabled, cars_enabled=EXCLUDED.cars_enabled`,
        [
          t.id,
          t.tuman,
          t.title,
          t.price,
          t.image,
          t.location,
          t.description,
          t.phoneNumber,
          t.status,
          t.capacity,
          t.ownerId || null,
          isKarnayAvail,
          karnayPrice,
          t.menu || null,
          t.currency || "UZS",
          t.singersEnabled || false,
          t.carsEnabled || false,
        ],
      );
    }

    for (const b of data.bookings) {
      const dateStr = b.sana.includes("-")
        ? b.sana
        : `2026-05-${Number(b.sana).toString().padStart(2, "0")}`;
      await client.query(
        `INSERT INTO bookings (id, venue_id, user_id, booking_date, guest_count, contact_name, contact_surname, contact_phone, selected_services, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO UPDATE SET
           venue_id=EXCLUDED.venue_id, user_id=EXCLUDED.user_id, booking_date=EXCLUDED.booking_date,
           guest_count=EXCLUDED.guest_count, contact_name=EXCLUDED.contact_name,
           contact_surname=EXCLUDED.contact_surname, contact_phone=EXCLUDED.contact_phone,
           selected_services=EXCLUDED.selected_services, status=EXCLUDED.status`,
        [
          b.id,
          b.toyxonaId,
          b.user.userId || null,
          dateStr,
          b.odamSoni,
          b.user.ism,
          b.user.familiya,
          b.user.raqam,
          JSON.stringify(b.xizmatlar),
          b.status,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function saveMessage(
  msg: Omit<MessageType, "id" | "sentAt">,
): Promise<void> {
  await pool.query(
    `INSERT INTO messages (sender_id, receiver_id, name, phone, message, is_admin_message, subject)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [
      msg.senderId,
      msg.receiverId,
      msg.name,
      msg.phone,
      msg.message,
      msg.isAdminMessage,
      msg.subject || null,
    ],
  );
}

export async function getMessages(
  filters: { userId?: number } = {},
): Promise<MessageType[]> {
  const conditions: string[] = [];
  const params: (number | string)[] = [];
  let idx = 1;

  if (filters.userId !== undefined) {
    conditions.push(`(sender_id = $${idx} OR receiver_id = $${idx++})`);
    params.push(filters.userId);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const res = await pool.query(
    `SELECT id, sender_id, receiver_id, name, phone, message, sent_at, is_admin_message, subject
     FROM messages
     ${where}
     ORDER BY sent_at ASC`,
    params,
  );

  return res.rows.map((r) => ({
    id: r.id,
    senderId: r.sender_id,
    receiverId: r.receiver_id,
    name: r.name,
    phone: r.phone,
    message: r.message,
    sentAt: r.sent_at
      ? new Date(r.sent_at).toISOString()
      : new Date().toISOString(),
    isAdminMessage: r.is_admin_message,
    subject: r.subject || undefined,
  }));
}
