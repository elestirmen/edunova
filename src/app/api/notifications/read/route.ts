import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { markRead, markAllRead } from "@/lib/services/notifications";
import { z } from "zod";

const schema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  if (parsed.data.all) {
    await markAllRead(session.user.id);
  } else if (parsed.data.ids?.length) {
    await markRead(session.user.id, parsed.data.ids);
  }
  return NextResponse.json({ ok: true });
}
