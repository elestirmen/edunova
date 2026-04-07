import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUnauthorizedResponse, requireAdminApiSession, validationErrorResponse } from "@/lib/admin-api";
import { z } from "zod";

const goalUpdateSchema = z.object({
  title: z.string().min(2).max(200).optional(),
  targetPerWeek: z.number().int().min(1).max(50).optional(),
  currentProgress: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

interface RouteContext {
  params: { goalId: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();
    if (!session) return adminUnauthorizedResponse();

    const body = await req.json();
    const parsed = goalUpdateSchema.safeParse(body);
    if (!parsed.success) return validationErrorResponse(parsed.error.errors[0].message);

    const goal = await db.goal.findUnique({ where: { id: params.goalId }, select: { id: true } });
    if (!goal) return validationErrorResponse("Hedef bulunamadı", 404);

    await db.goal.update({ where: { id: params.goalId }, data: parsed.data });

    return NextResponse.json({ message: "Hedef güncellendi" });
  } catch (error) {
    console.error("Goal update error:", error);
    return validationErrorResponse("Hedef güncellenirken bir hata oluştu", 500);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminApiSession();
    if (!session) return adminUnauthorizedResponse();

    const goal = await db.goal.findUnique({ where: { id: params.goalId }, select: { id: true } });
    if (!goal) return validationErrorResponse("Hedef bulunamadı", 404);

    await db.goal.delete({ where: { id: params.goalId } });

    return NextResponse.json({ message: "Hedef silindi" });
  } catch (error) {
    console.error("Goal delete error:", error);
    return validationErrorResponse("Hedef silinirken bir hata oluştu", 500);
  }
}
