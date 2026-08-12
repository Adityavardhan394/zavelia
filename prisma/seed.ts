import { PrismaClient, Audience } from "@prisma/client";

const prisma = new PrismaClient();

const categories: Array<{
  name: string;
  slug: string;
  audience: Audience;
  sortOrder: number;
  description: string;
}> = [
  { name: "Earrings", slug: "earrings-women", audience: "WOMEN", sortOrder: 1, description: "Elegant earrings for her" },
  { name: "Rings", slug: "rings-women", audience: "WOMEN", sortOrder: 2, description: "Rings for every mood" },
  { name: "Bracelets", slug: "bracelets-women", audience: "WOMEN", sortOrder: 3, description: "Graceful bracelets" },
  { name: "Chains", slug: "chains-women", audience: "WOMEN", sortOrder: 4, description: "Delicate chains" },
  { name: "Necklaces", slug: "necklaces-women", audience: "WOMEN", sortOrder: 5, description: "Statement necklaces" },
  { name: "Pendants", slug: "pendants-women", audience: "WOMEN", sortOrder: 6, description: "Charming pendants" },
  { name: "Anklets", slug: "anklets-women", audience: "WOMEN", sortOrder: 7, description: "Everyday anklets" },
  { name: "Hair Clips", slug: "hair-clips-women", audience: "WOMEN", sortOrder: 8, description: "Polished hair clips" },
  { name: "Hair Bands", slug: "hair-bands-women", audience: "WOMEN", sortOrder: 9, description: "Soft hair bands" },
  { name: "Jewellery Sets", slug: "jewellery-sets-women", audience: "WOMEN", sortOrder: 10, description: "Complete jewellery sets" },
  { name: "Chains", slug: "chains-men", audience: "MEN", sortOrder: 1, description: "Bold chains for him" },
  { name: "Rings", slug: "rings-men", audience: "MEN", sortOrder: 2, description: "Refined rings for him" },
  { name: "Bracelets", slug: "bracelets-men", audience: "MEN", sortOrder: 3, description: "Modern bracelets" },
  { name: "Pendants", slug: "pendants-men", audience: "MEN", sortOrder: 4, description: "Statement pendants" },
  { name: "Cufflinks", slug: "cufflinks-men", audience: "MEN", sortOrder: 5, description: "Classic cufflinks" },
  { name: "Hair Accessories", slug: "hair-accessories-girls", audience: "GIRLS", sortOrder: 1, description: "Playful hair accessories" },
  { name: "Bracelets", slug: "bracelets-girls", audience: "GIRLS", sortOrder: 2, description: "Cute bracelets" },
  { name: "Earrings", slug: "earrings-girls", audience: "GIRLS", sortOrder: 3, description: "Light earrings for girls" },
  { name: "Necklaces", slug: "necklaces-girls", audience: "GIRLS", sortOrder: 4, description: "Pretty necklaces" },
  { name: "Gift Sets", slug: "gift-sets-girls", audience: "GIRLS", sortOrder: 5, description: "Thoughtful gift sets" },
  { name: "Couple Rings", slug: "couple-rings", audience: "UNISEX", sortOrder: 1, description: "Matching couple rings" },
  { name: "Friendship Bracelets", slug: "friendship-bracelets", audience: "UNISEX", sortOrder: 2, description: "Friendship bracelets" },
  { name: "Gift Collections", slug: "gift-collections", audience: "UNISEX", sortOrder: 3, description: "Curated gift collections" },
];

const productImages: Record<string, [string, string]> = {
  "seed-rose-gold-hoop-earrings": [
    "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&h=800&fit=crop&q=80",
  ],
  "seed-classic-mens-chain": [
    "https://images.unsplash.com/photo-1617038260897-41a1fdb6c2c8?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop&q=80",
  ],
  "seed-couple-band-set": [
    "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&q=80",
  ],
  "seed-sold-out-pendant": [
    "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=800&h=800&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop&q=80",
  ],
};


async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default-settings" },
    update: {},
    create: {
      id: "default-settings",
      storeName: "ZAVÉLIA",
      tagline: "Elegance For Every You",
      freeShippingThresholdInPaise: 30000,
      standardShippingInPaise: 4900,
      announcementText: "FREE shipping on orders of ₹300 and above",
      isStoreOpen: true,
      supportEmail: process.env.BUSINESS_SUPPORT_EMAIL || null,
      supportPhone: process.env.BUSINESS_SUPPORT_PHONE || null,
      businessAddress: process.env.BUSINESS_ADDRESS || null,
      whatsappDisplayNumber: process.env.WHATSAPP_BUSINESS_NUMBER || null,
    },
  });

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        audience: category.audience,
        sortOrder: category.sortOrder,
        description: category.description,
        isActive: true,
      },
      create: category,
    });
  }

  const womenEarrings = await prisma.category.findUniqueOrThrow({
    where: { slug: "earrings-women" },
  });
  const menChains = await prisma.category.findUniqueOrThrow({
    where: { slug: "chains-men" },
  });
  const coupleRings = await prisma.category.findUniqueOrThrow({
    where: { slug: "couple-rings" },
  });

  const seedProducts = [
    {
      name: "[SEED] Rose Gold Hoop Earrings",
      slug: "seed-rose-gold-hoop-earrings",
      sku: "SEED-EAR-001",
      shortDescription: "Lightweight rose-gold finish hoops for everyday elegance.",
      description:
        "Development seed product. Soft rose-gold hoop earrings designed for daily wear. Remove before production launch.",
      material: "Alloy with rose-gold plating",
      careInstructions: "Keep dry. Wipe with a soft cloth after use.",
      audience: "WOMEN" as Audience,
      categoryId: womenEarrings.id,
      priceInPaise: 49900,
      compareAtPriceInPaise: 69900,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      variants: [
        { name: "Size", value: "Medium", sku: "SEED-EAR-001-M", stockOnHand: 25 },
        { name: "Size", value: "Large", sku: "SEED-EAR-001-L", stockOnHand: 12 },
      ],
    },
    {
      name: "[SEED] Classic Mens Chain",
      slug: "seed-classic-mens-chain",
      sku: "SEED-CHN-001",
      shortDescription: "Polished stainless finish chain for him.",
      description:
        "Development seed product. A versatile everyday chain. Remove before production launch.",
      material: "Stainless steel",
      careInstructions: "Avoid chemicals and store dry.",
      audience: "MEN" as Audience,
      categoryId: menChains.id,
      priceInPaise: 79900,
      compareAtPriceInPaise: 99900,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      variants: [
        { name: "Length", value: "20 inch", sku: "SEED-CHN-001-20", stockOnHand: 18 },
        { name: "Length", value: "22 inch", sku: "SEED-CHN-001-22", stockOnHand: 8 },
      ],
    },
    {
      name: "[SEED] Couple Band Set",
      slug: "seed-couple-band-set",
      sku: "SEED-RNG-001",
      shortDescription: "Matching couple bands with brushed finish.",
      description:
        "Development seed product. Pair of complementary bands. Remove before production launch.",
      material: "Alloy",
      careInstructions: "Avoid water and perfume contact.",
      audience: "UNISEX" as Audience,
      categoryId: coupleRings.id,
      priceInPaise: 89900,
      compareAtPriceInPaise: null,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      variants: [
        { name: "Set", value: "Pair", sku: "SEED-RNG-001-SET", stockOnHand: 15 },
      ],
    },
    {
      name: "[SEED] Sold Out Pendant",
      slug: "seed-sold-out-pendant",
      sku: "SEED-PND-000",
      shortDescription: "Seed product used to test sold-out behaviour.",
      description: "Development seed product with zero stock.",
      material: "Alloy",
      careInstructions: "N/A",
      audience: "WOMEN" as Audience,
      categoryId: womenEarrings.id,
      priceInPaise: 29900,
      compareAtPriceInPaise: null,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      variants: [
        { name: "Size", value: "One Size", sku: "SEED-PND-000-OS", stockOnHand: 0 },
      ],
    },
  ];

  for (const product of seedProducts) {
    const { variants, ...data } = product;
    await prisma.product.upsert({
      where: { slug: data.slug },
      update: {
        ...data,
        isActive: true,
      },
      create: {
        ...data,
        images: {
          create: [
            {
              url: (productImages[data.slug] ?? [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&q=80",
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop&q=80",
              ])[0],
              altText: data.name,
              sortOrder: 0,
              isPrimary: true,
            },
            {
              url: (productImages[data.slug] ?? [
                "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&q=80",
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop&q=80",
              ])[1],
              altText: `${data.name} alternate`,
              sortOrder: 1,
              isPrimary: false,
            },
          ],
        },
        variants: {
          create: variants.map((v) => ({
            ...v,
            priceAdjustmentInPaise: 0,
            stockReserved: 0,
            lowStockThreshold: 5,
            isActive: true,
          })),
        },
      },
    });

    // Ensure variants exist on re-seed
    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          stockOnHand: variant.stockOnHand,
          name: variant.name,
          value: variant.value,
          isActive: true,
        },
        create: {
          product: { connect: { slug: data.slug } },
          name: variant.name,
          value: variant.value,
          sku: variant.sku,
          stockOnHand: variant.stockOnHand,
          stockReserved: 0,
          lowStockThreshold: 5,
          priceAdjustmentInPaise: 0,
          isActive: true,
        },
      });
    }
  }

  console.log("Seed completed: settings, categories, and [SEED] products.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
