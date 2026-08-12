import { v2 as cloudinary } from "cloudinary";
import { requireAdmin } from "@/lib/auth";
import { fail, ok } from "@/lib/utils/api";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return fail("Cloudinary is not configured", {
      status: 503,
      code: "UPLOAD_UNAVAILABLE",
    });
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });

  const body = await request.json().catch(() => ({}));
  const folder = typeof body.folder === "string" ? body.folder : "zavelia/products";
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = {
    timestamp,
    folder,
    allowed_formats: "jpg,png,webp",
  };

  const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

  return ok({
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    maxFileSizeBytes: 5 * 1024 * 1024,
    allowedFormats: ["image/jpeg", "image/png", "image/webp"],
  });
}
