import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export const metadata = { title: "Kayıt | Edunova" };

export default function KayitPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="mx-auto mb-2 h-10 w-10 text-primary" />
          <CardTitle>Kayıt yöneticiye özel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            Edunova kapalı bir platformdur. Hesap açılması için ajans yöneticisi ile
            iletişime geçin.
          </p>
          <Link href="/giris">
            <Button variant="outline" className="w-full">
              Giriş sayfasına dön
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
