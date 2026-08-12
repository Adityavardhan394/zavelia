const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function main() {
  const dir = path.join(__dirname, "..", "public", "brand");
  fs.mkdirSync(dir, { recursive: true });
  const svg = fs.readFileSync(path.join(dir, "zavelia-logo.svg"));
  await sharp(svg).png().toFile(path.join(dir, "zavelia-logo.png"));
  await sharp(svg).resize(64, 64, { fit: "contain", background: "#F7EFE5" }).png().toFile(path.join(dir, "favicon.png"));
  console.log("Logo PNG generated");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
