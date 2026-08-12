import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { createAuditLog } from "@/lib/security/audit";
import { getClientIp } from "@/lib/security/rate-limit";
import { settingsUpdateSchema } from "@/lib/validations";
import { fail, ok } from "@/lib/utils/api";
import { revalidatePath, revalidateTag } from "next/cache";

async function getOrCreateSettings() {
  const existing = await prisma.siteSettings.findFirst();
  if (existing) return existing;
  return prisma.siteSettings.create({
    data: {
      storeName: "ZAVÉLIA",
      tagline: "Elegance For Every You",
      freeShippingThresholdInPaise: 30000,
      standardShippingInPaise: 4900,
    },
  });
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  try {
    return ok(await getOrCreateSettings());
  } catch (error) {
    console.error("[GET /api/admin/settings]", error);
    return fail("Failed to load settings", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return fail("Unauthorized", { status: 401, code: "UNAUTHORIZED" });
  }

  try {
    const body = await request.json().catch(() => null);
    const parsed = settingsUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail("Invalid settings payload", {
        status: 400,
        code: "VALIDATION_ERROR",
        details: parsed.error.flatten(),
      });
    }

    const data = parsed.data;
    const current = await getOrCreateSettings();
    const settings = await prisma.siteSettings.update({
      where: { id: current.id },
      data: {
        ...(data.storeName != null ? { storeName: data.storeName } : {}),
        ...(data.tagline != null ? { tagline: data.tagline } : {}),
        ...(data.whatsappDisplayNumber !== undefined
          ? { whatsappDisplayNumber: data.whatsappDisplayNumber }
          : {}),
        ...(data.supportEmail !== undefined
          ? {
              supportEmail:
                data.supportEmail === "" ? null : data.supportEmail,
            }
          : {}),
        ...(data.supportPhone !== undefined
          ? { supportPhone: data.supportPhone }
          : {}),
        ...(data.businessAddress !== undefined
          ? { businessAddress: data.businessAddress }
          : {}),
        ...(data.freeShippingThresholdInPaise != null
          ? {
              freeShippingThresholdInPaise:
                data.freeShippingThresholdInPaise,
            }
          : {}),
        ...(data.standardShippingInPaise != null
          ? { standardShippingInPaise: data.standardShippingInPaise }
          : {}),
        ...(data.instagramUrl !== undefined
          ? {
              instagramUrl:
                data.instagramUrl === "" ? null : data.instagramUrl,
            }
          : {}),
        ...(data.facebookUrl !== undefined
          ? {
              facebookUrl:
                data.facebookUrl === "" ? null : data.facebookUrl,
            }
          : {}),
        ...(data.isStoreOpen != null ? { isStoreOpen: data.isStoreOpen } : {}),
        ...(data.announcementText !== undefined
          ? { announcementText: data.announcementText }
          : {}),
      },
    });

    await createAuditLog({
      userId: admin.id,
      action: "SETTINGS_UPDATE",
      entityType: "SiteSettings",
      entityId: settings.id,
      ipAddress: getClientIp(request.headers),
    });

    revalidateTag("settings", "max");
    revalidatePath("/");
    return ok(settings);
  } catch (error) {
    console.error("[PATCH /api/admin/settings]", error);
    return fail("Failed to update settings", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
  }
}
