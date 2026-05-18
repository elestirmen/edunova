import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { purchasePackage } from "@/lib/services/ledger";
import { logAudit } from "@/lib/services/audit";
import { notify } from "@/lib/services/notifications";
import { hourPackageSchema } from "@/lib/validations";
import { NotificationType } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const url = new URL(req.url);
  const studentId = url.searchParams.get("studentId");
  const courseId = url.searchParams.get("courseId");
  const packages = await db.hourPackage.findMany({
    where: {
      ...(studentId && { studentId }),
      ...(courseId && { courseId }),
    },
    include: {
      student: { select: { firstName: true, lastName: true, email: true } },
      course: { select: { name: true, code: true } },
    },
    orderBy: { purchasedAt: "desc" },
    take: 100,
  });
  return NextResponse.json({ items: packages });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }
  const body = await req.json();
  const parsed = hourPackageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0].message },
      { status: 400 }
    );
  }
  const pkg = await purchasePackage({
    ...parsed.data,
    createdById: session.user.id,
  });
  const course = await db.course.findUnique({
    where: { id: parsed.data.courseId },
    select: { name: true },
  });
  await Promise.all([
    notify({
      userId: parsed.data.studentId,
      type: NotificationType.PACKAGE_PURCHASED,
      title: `${course?.name ?? "Ders"} için yeni paket eklendi`,
      body: `${parsed.data.hoursPurchased} saat eklendi.`,
    }),
    logAudit({
      actorId: session.user.id,
      action: "package.purchase",
      targetType: "HourPackage",
      targetId: pkg.id,
      metadata: {
        hours: parsed.data.hoursPurchased,
        price: parsed.data.pricePaid,
      },
    }),
  ]);
  return NextResponse.json({ package: pkg }, { status: 201 });
}
