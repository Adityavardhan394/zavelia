import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";

export async function createAuditLog(input: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId ?? undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? undefined,
        metadata: input.metadata,
        ipAddress: input.ipAddress ?? undefined,
      },
    });
  } catch {
    // Never break primary flows because of audit logging
  }
}
