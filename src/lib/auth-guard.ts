import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/giris");
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) {
    redirect("/giris");
  }

  return session;
}
