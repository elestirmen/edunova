import { requireAuth } from "@/lib/auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Shield, Globe } from "lucide-react";

export const metadata = { title: "Ayarlar | Edunova" };

export default async function AdminSettingsPage() {
  await requireAuth(["ADMIN"]);

  return (
    <DashboardShell
      title="Sistem Ayarları"
      description="Platform yapılandırması"
    >
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Genel Bilgiler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Platform</span>
              <span className="font-medium">Edunova v0.1.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Ortam</span>
              <Badge variant="secondary">Geliştirme</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Veritabanı</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                PostgreSQL
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Güvenlik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Kimlik Doğrulama</span>
              <span className="text-sm text-muted-foreground">JWT / NextAuth</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Şifre Hash</span>
              <span className="text-sm text-muted-foreground">bcrypt (12 rounds)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Oturum Süresi</span>
              <span className="text-sm text-muted-foreground">7 gün</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Lokalizasyon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Birincil Dil</span>
              <span className="text-sm text-muted-foreground">Türkçe (tr)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Zaman Dilimi</span>
              <span className="text-sm text-muted-foreground">Europe/Istanbul</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
