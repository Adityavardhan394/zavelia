#!/usr/bin/env tsx
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import argon2 from "argon2";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isStrongPassword(password: string): string | null {
  if (password.length < 12) return "Password must be at least 12 characters.";
  if (!/[A-Z]/.test(password)) return "Include at least one uppercase letter.";
  if (!/[a-z]/.test(password)) return "Include at least one lowercase letter.";
  if (!/[0-9]/.test(password)) return "Include at least one number.";
  if (!/[^A-Za-z0-9]/.test(password))
    return "Include at least one special character.";
  return null;
}

async function main() {
  const rl = readline.createInterface({ input, output });
  try {
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const password = await rl.question("New password: ");
    const passwordError = isStrongPassword(password);
    if (passwordError) {
      console.error(passwordError);
      process.exit(1);
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error("Admin not found.");
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, isActive: true },
    });

    console.log(`Password reset for ${email}.`);
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
