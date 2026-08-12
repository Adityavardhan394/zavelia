const { PrismaClient } = require("@prisma/client");

const bySlug = {
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
  const prisma = new PrismaClient();
  const products = await prisma.product.findMany({
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  for (const product of products) {
    const urls = bySlug[product.slug] || [
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop&q=80",
      "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&h=800&fit=crop&q=80",
    ];

    if (product.images.length === 0) {
      await prisma.productImage.createMany({
        data: [
          {
            productId: product.id,
            url: urls[0],
            altText: product.name,
            sortOrder: 0,
            isPrimary: true,
          },
          {
            productId: product.id,
            url: urls[1],
            altText: `${product.name} alternate`,
            sortOrder: 1,
            isPrimary: false,
          },
        ],
      });
      continue;
    }

    for (let i = 0; i < product.images.length; i++) {
      await prisma.productImage.update({
        where: { id: product.images[i].id },
        data: { url: urls[Math.min(i, urls.length - 1)] },
      });
    }
  }

  console.log(`Updated images for ${products.length} products`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
