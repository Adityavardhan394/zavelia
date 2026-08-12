const argon2 = require("argon2");
const { PrismaClient } = require("@prisma/client");

async function main() {
  const prisma = new PrismaClient();
  const email = "admin@zavelia.store";
  const password = "ZaveliaAdmin!2026";
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isActive: true, role: "SUPER_ADMIN", name: "Zavelia Admin" },
    create: {
      name: "Zavelia Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`Admin ready: ${user.email}`);
  console.log(`Password: ${password}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  process.exit(1);
});
