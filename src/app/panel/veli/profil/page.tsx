import { requireAuth } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Profil | Edunova" };

export default async function ParentProfilePage() {
  const session = await requireAuth(["PARENT"]);

  return (
    <DashboardShell title="Profil" description="Hesap bilgilerin">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Hesap</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Ad Soyad:</span>{" "}
            {session.user.firstName} {session.user.lastName}
          </p>
          <p>
            <span className="text-muted-foreground">E-posta:</span>{" "}
            {session.user.email}
          </p>
          <p>
            <span className="text-muted-foreground">Rol:</span> Veli
          </p>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
