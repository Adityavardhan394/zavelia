#!/usr/bin/env tsx
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const email = (await rl.question("Admin email to disable: ")).trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error("Admin not found.");
      process.exit(1);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { isActive: false },
    });
    console.log(`Disabled admin ${email}.`);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
