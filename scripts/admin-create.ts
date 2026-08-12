#!/usr/bin/env tsx
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import argon2 from "argon2";
import { PrismaClient, Role } from "@prisma/client";

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
    const name = (await rl.question("Admin name: ")).trim();
    const email = (await rl.question("Admin email: ")).trim().toLowerCase();
    const password = await rl.question("Admin password: ");
    const roleAnswer = (
      await rl.question("Role [ADMIN/SUPER_ADMIN] (default ADMIN): ")
    )
      .trim()
      .toUpperCase();

    if (!name || !email || !password) {
      console.error("Name, email, and password are required.");
      process.exit(1);
    }

    const passwordError = isStrongPassword(password);
    if (passwordError) {
      console.error(passwordError);
      process.exit(1);
    }

    const role: Role =
      roleAnswer === "SUPER_ADMIN" ? Role.SUPER_ADMIN : Role.ADMIN;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.error("An admin with this email already exists.");
      process.exit(1);
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        isActive: true,
      },
    });

    console.log(`Created admin ${user.email} (${user.role}).`);
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
