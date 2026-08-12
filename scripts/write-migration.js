const { execSync } = require("child_process");
const fs = require("fs");

const sql = execSync(
  "pnpm prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
  { encoding: "utf8" },
);

const checks = `
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stockOnHand_nonnegative" CHECK ("stockOnHand" >= 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_stockReserved_nonnegative" CHECK ("stockReserved" >= 0);
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_reserved_lte_onhand" CHECK ("stockReserved" <= "stockOnHand");
`;

fs.mkdirSync("prisma/migrations/20260812000000_init", { recursive: true });
fs.writeFileSync(
  "prisma/migrations/20260812000000_init/migration.sql",
  sql.replace(/^\uFEFF/, "").trim() + "\n" + checks,
  { encoding: "utf8" },
);
console.log("migration.sql written");
