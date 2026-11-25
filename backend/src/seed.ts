import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "./lib/prisma.js";

async function main() {
  const categories = [
    { name: "Elektronik", slug: "elektronik", icon: "Smartphone" },
    { name: "Fashion", slug: "fashion", icon: "Shirt" },
    { name: "Rumah & Furniture", slug: "rumah-furniture", icon: "Home" },
    { name: "Otomotif", slug: "otomotif", icon: "Zap" },
    { name: "Buku & Media", slug: "buku-media", icon: "BookOpen" },
    { name: "Olahraga", slug: "olahraga", icon: "Dumbbell" },
    { name: "Makanan & Minuman", slug: "makanan-minuman", icon: "Coffee" },
    { name: "Kesehatan & Kecantikan", slug: "kesehatan-kecantikan", icon: "Heart" },
  ];

  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
  }

  const sellerEmail = "seller@example.com";
  const buyerEmail = "buyer@example.com";
  const passwordHash = await bcrypt.hash("password123", 10);

  const seller = await prisma.user.upsert({
    where: { email: sellerEmail },
    update: { fullName: "Demo Seller" },
    create: {
      email: sellerEmail,
      passwordHash,
      fullName: "Demo Seller",
      roles: { create: [{ role: "seller" }] },
      stores: { create: [{ name: "AhmadCorp Official Store", location: "Jakarta" }] },
    },
    include: { stores: true },
  });

  await prisma.user.upsert({
    where: { email: buyerEmail },
    update: { fullName: "Demo Buyer" },
    create: {
      email: buyerEmail,
      passwordHash,
      fullName: "Demo Buyer",
      roles: { create: [{ role: "buyer" }] },
    },
  });

  const storeId = seller.stores[0]?.id;
  if (!storeId) return;

  const elektronik = await prisma.category.findUnique({ where: { slug: "elektronik" } });
  const fashion = await prisma.category.findUnique({ where: { slug: "fashion" } });

  await prisma.product.createMany({
    data: [
      {
        storeId,
        categoryId: fashion?.id,
        name: "Kaos Pria Cotton Combed 30s",
        description: "Kaos pria berbahan cotton combed 30s yang nyaman dipakai sehari-hari.",
        price: 130000,
        originalPrice: null,
        stock: 50,
        images: [
          "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?auto=format&fit=crop&q=60&w=600",
        ],
        soldCount: 345,
      },
      {
        storeId,
        categoryId: elektronik?.id,
        name: "Iphone 17 Pro Max I-box 128GB",
        description: "iPhone 17 Pro Max i-box 128GB adalah smartphone terbaru dari Apple.",
        price: 20999000,
        originalPrice: 24500000,
        stock: 9,
        images: [
          "https://images.unsplash.com/photo-1757709608566-4b9fd41a7af5?auto=format&fit=crop&q=60&w=600",
        ],
        soldCount: 1234,
      },
      {
        storeId,
        categoryId: elektronik?.id,
        name: "Headphone Wireless Noise Cancelling",
        description: "Headphone wireless dengan fitur noise cancelling dan kualitas suara premium.",
        price: 549000,
        originalPrice: 799000,
        stock: 50,
        images: [
          "https://images.unsplash.com/photo-1676315636995-a5d5df17b192?auto=format&fit=crop&q=60&w=600",
        ],
        soldCount: 3421,
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
