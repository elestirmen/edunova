import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function requireAdminApiSession() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return session;
}

export function adminUnauthorizedResponse() {
  return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
}

export function validationErrorResponse(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}
