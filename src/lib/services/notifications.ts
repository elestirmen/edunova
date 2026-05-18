import { Prisma, NotificationType } from "@prisma/client";
import { db } from "@/lib/db";

type Tx = Prisma.TransactionClient | typeof db;

export async function notify(
  input: {
    userId: string;
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
  },
  tx: Tx = db
) {
  return tx.notification.create({ data: input });
}

export async function notifyMany(
  input: {
    userIds: string[];
    type: NotificationType;
    title: string;
    body?: string;
    link?: string;
  },
  tx: Tx = db
) {
  if (input.userIds.length === 0) return { count: 0 };
  return tx.notification.createMany({
    data: input.userIds.map((userId) => ({
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      link: input.link,
    })),
  });
}

export async function markRead(userId: string, ids: string[]) {
  return db.notification.updateMany({
    where: { id: { in: ids }, userId },
    data: { readAt: new Date() },
  });
}

export async function markAllRead(userId: string) {
  return db.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function unreadCount(userId: string) {
  return db.notification.count({ where: { userId, readAt: null } });
}

export async function listNotifications(userId: string, limit = 20) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
