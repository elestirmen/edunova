import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listNotifications, unreadCount } from "@/lib/services/notifications";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const [items, unread] = await Promise.all([
    listNotifications(session.user.id, 30),
    unreadCount(session.user.id),
  ]);
  return NextResponse.json({ items, unread });
}
