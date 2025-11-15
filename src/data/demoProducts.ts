export type DemoProduct = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  rating?: number;
  description?: string;
  sold?: number;
  location?: string;
  discount?: number;
};

export const demoProducts: DemoProduct[] = [
  {
    id: "1",
    name: "Kaos Pria Cotton Combed 30s",
    price: 130000,
    image:
      "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fHBha2FpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1200",
    images: [
      "https://images.unsplash.com/photo-1737094540214-261561588b89?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1171",
      "https://images.unsplash.com/photo-1548768041-2fceab4c0b85?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1716951884362-e560807383b5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDI1fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.8,
    description:
      "Kaos pria berbahan cotton combed 30s yang nyaman dipakai sehari-hari.",
    sold: 345,
    location: "Jakarta Barat",
  },
  {
    id: "2",
    name: "Kaos Polos Cotton Combed 30s Premium Quality",
    price: 100000,
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8cGFrYWlhbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=1200",
    images: [
      "https://images.unsplash.com/photo-1759572095317-3a96f9a98e2b?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fGthb3MlMjBwb2xvc3xlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1693443687750-611ad77f3aba?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE0fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1544441892-715e8df46144?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE4fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.8,
    description:
      "Kaos polos berkualitas premium dari bahan cotton combed 30s yang lembut dan awet.",
    sold: 345,
    location: "Bandung Barat",
  },
  {
    id: "3",
    name: "Iphone 17 Pro Max I-box 128GB",
    price: 20999000,
    // NOTE: originalPrice harusnya > price. Data kamu sebelumnya 4.500.000 (lebih kecil dari price).
    // Kalau mau realistis, bisa pakai ~24.500.000. Silakan sesuaikan:
    originalPrice: 24500000,
    image:
      "https://images.unsplash.com/photo-1757709608566-4b9fd41a7af5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=1200",
    images: [
      "https://images.unsplash.com/photo-1757710436034-f1d7372ec1be?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGlwaG9uZSUyMDE3fGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1758784211688-ab9177d65bb3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDJ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
      "https://plus.unsplash.com/premium_photo-1753486710927-7818a14edb55?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDY0fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.8,
    description:
      "iPhone 17 Pro Max i-box 128GB adalah smartphone terbaru dari Apple yang menawarkan performa tinggi dengan chip A17 Bionic, layar Super Retina XDR 6.7 inci, dan sistem kamera Pro yang canggih untuk foto dan video berkualitas profesional.",
    sold: 1234,
    location: "Jakarta Pusat",
    discount: 27,
  },
  {
    id: "4",
    name: "Sepatu Sneakers Casual Pria Wanita Premium Quality",
    price: 249000,
    originalPrice: 399000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    images: [
      "https://media.istockphoto.com/id/1391533360/id/foto/sepatu-kets-merah.webp?a=1&s=612x612&w=0&k=20&c=KU74ITTuuTIG2_y7QdwdsNpO--cwQJtOyRXzzFQ44wY=",
      "https://media.istockphoto.com/id/1391533364/id/foto/sepatu-kets-merah.jpg?s=612x612&w=0&k=20&c=qhsd30aK93IQSBcY-S0Ckh4icvglaAQ4IPHJrQ_Hye8=",
      "https://media.istockphoto.com/id/1151755034/id/foto/sebuah-studio-bidikan-sepasang-sepatu-lari-di-latar-belakang-merah-berbaring-datar.jpg?s=612x612&w=0&k=20&c=i6x49mElEKkZBl_338JVR0G5uMH-URyw61hUd0yDXfc=",
    ],
    rating: 4.9,
    description:
      "Sepatu sneakers casual pria dan wanita dengan desain trendy dan bahan premium yang nyaman dipakai sepanjang hari.",
    sold: 856,
    location: "Bandung",
    discount: 38,
  },
  {
    id: "5",
    name: "Tas Ransel Laptop 15.6 inch Anti Air USB Charging Port",
    price: 179000,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200",
    rating: 4.7,
    description:
      "Tas ransel laptop 15.6 inch dengan fitur anti air dan port pengisian USB, cocok untuk aktivitas sehari-hari dan perjalanan bisnis.",
    sold: 432,
    location: "Surabaya",
  },
  {
    id: "6",
    name: "Jam Tangan Smartwatch Health Tracker AMOLED Display",
    price: 899000,
    originalPrice: 1299000,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200",
    rating: 4.6,
    description:
      "Jam tangan smartwatch dengan fitur health tracker, layar AMOLED, dan berbagai fungsi pintar untuk mendukung gaya hidup aktif Anda.",
    sold: 2341,
    location: "Jakarta Selatan",
    discount: 31,
  },
  {
    id: "7",
    name: "Kamera DSLR Professional 24MP WiFi Full HD Video",
    price: 7899000,
    image:
      "https://images.unsplash.com/photo-1597644951651-ac608e336556?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Njh8fGNhdGFsb2clMjBrYW1lcmF8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&q=60&w=1200",
    rating: 4.9,
    description:
      "Kamera DSLR professional dengan resolusi 24MP, konektivitas WiFi, dan kemampuan merekam video Full HD untuk hasil foto dan video yang menakjubkan.",
    sold: 187,
    location: "Yogyakarta",
  },
  {
    id: "8",
    name: "Headphone Wireless Noise Cancelling Premium Sound",
    price: 549000,
    originalPrice: 799000,
    image:
      "https://images.unsplash.com/photo-1676315636995-a5d5df17b192?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=1200",
    images: [
      "https://images.unsplash.com/photo-1505751104546-4b63c93054b1?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1752442533996-98202aa79840?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE3fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1684703147716-014da6a31aa3?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074",
    ],
    rating: 4.8,
    description:
      "Headphone wireless dengan fitur noise cancelling dan kualitas suara premium, ideal untuk menikmati musik tanpa gangguan di mana saja.",
    sold: 3421,
    location: "Jakarta Barat",
    discount: 31,
  },
  {
    id: "9",
    name: "Keyboard Mechanical RGB Gaming Custom Switches",
    price: 679000,
    image:
      "https://plus.unsplash.com/premium_photo-1664194583917-b0ba07c4ce2a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2V5Ym9hcmQlMjBtZWNoYW5pY2FsfGVufDB8fDB8fHww&auto=format&fit=crop&q=60&w=1200",
    images: [
      "https://plus.unsplash.com/premium_photo-1664194583917-e2ca85efc15e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
      "https://plus.unsplash.com/premium_photo-1679177183572-a4056053b8a2?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
      "https://plus.unsplash.com/premium_photo-1679177183775-75c2e0d0d209?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE1fHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.7,
    description:
      "Keyboard mechanical RGB gaming dengan custom switches yang dapat disesuaikan, memberikan pengalaman mengetik dan bermain game yang optimal.",
    sold: 521,
    location: "Semarang",
  },
  {
    id: "10",
    name: "Monitor Gaming 27 inch 144Hz IPS HDR 1ms Response",
    price: 2499000,
    originalPrice: 3299000,
    image:
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200",
    images: [
      "https://images.unsplash.com/photo-1527443154391-507e9dc6c5cc?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bGF5YXIlMjBrb21wdXRlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1560131914-2e469a0e8607?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8bGF5YXIlMjBrb21wdXRlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1674460614587-c320ce2a9fa5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDEwfHx8ZW58MHx8fHx8&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.9,
    description:
      "Monitor gaming 27 inch dengan refresh rate 144Hz, panel IPS, dukungan HDR, dan response time 1ms untuk pengalaman gaming yang mulus dan imersif.",
    sold: 312,
    location: "Medan",
    discount: 24,
  },
  {
    id: "11",
    name: "Redragon Gaming Mouse M711 Cobra",
    price: 1999000,
    // NOTE: URL kamu sebelumnya korup (tertempel string lain). Sudah diperbaiki.
    image:
      "https://images.unsplash.com/photo-1594008671689-8d8b9480cae8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169",
    images: [
      "https://images.unsplash.com/photo-1594008671712-da08718510bf?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1636487658549-0ba2cef1cb9a?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDV8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
      "https://images.unsplash.com/photo-1756928626912-17d51297f43d?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDZ8fHxlbnwwfHx8fHw%3D&auto=format&fit=crop&q=60&w=600",
    ],
    rating: 4.9,
    description:
      "Redragon Gaming Mouse M711 Cobra adalah mouse gaming berkualitas tinggi dengan desain ergonomis, sensor presisi tinggi, dan lampu RGB yang dapat disesuaikan untuk pengalaman bermain game yang optimal.",
    sold: 312,
    location: "Jakarta Pusat",
  },
];
