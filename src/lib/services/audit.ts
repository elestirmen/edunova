import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

type Tx = Prisma.TransactionClient | typeof db;

export async function logAudit(
  input: {
    actorId?: string | null;
    action: string;
    targetType?: string;
    targetId?: string;
    metadata?: Prisma.InputJsonValue;
  },
  tx: Tx = db
) {
  return tx.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      metadata: input.metadata,
    },
  });
}
