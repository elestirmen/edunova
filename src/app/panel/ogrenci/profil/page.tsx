"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Phone, Save, X } from "lucide-react";

export default function StudentProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || "",
    lastName: session?.user?.lastName || "",
    phone: "",
    bio: "",
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) return;
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.firstName) {
          setFormData({
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || "",
            bio: data.bio || "",
          });
        }
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, [loaded]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotice(null);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setNotice({ type: "success", message: "Profil başarıyla güncellendi." });
        await update();
        setTimeout(() => setNotice(null), 3000);
      } else {
        setNotice({ type: "error", message: "Profil güncellenemedi." });
      }
    } catch {
      setNotice({ type: "error", message: "Bir hata oluştu." });
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) return null;

  return (
    <DashboardShell title="Profil" eyebrow="Öğrenci" description="Hesap bilgilerini düzenle">
      <div className="mx-auto max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar firstName={session.user.firstName} lastName={session.user.lastName} size="lg" />
              <div>
                <CardTitle>{session.user.firstName} {session.user.lastName}</CardTitle>
                <p className="text-sm text-muted-foreground">{session.user.email}</p>
                <Badge variant="secondary" className="mt-1">Öğrenci</Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Profil Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            {notice && (
              <div className={`mb-4 flex items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-[13px] font-medium ${notice.type === "success" ? "bg-leaf-500/10 text-leaf-700 dark:text-leaf-300" : "bg-destructive/10 text-destructive"}`}>
                {notice.message}
                <button onClick={() => setNotice(null)} className="ml-2 rounded p-0.5 hover:bg-foreground/10"><X className="h-3.5 w-3.5" /></button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Ad</label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={formData.firstName} onChange={(e) => setFormData((p) => ({ ...p, firstName: e.target.value }))} className="pl-10 h-9" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Soyad</label>
                  <Input value={formData.lastName} onChange={(e) => setFormData((p) => ({ ...p, lastName: e.target.value }))} className="h-9" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">E-posta</label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={session.user.email} disabled className="pl-10 h-9" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Telefon</label>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} placeholder="05XX XXX XX XX" className="pl-10 h-9" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Hakkımda</label>
                <Textarea value={formData.bio} onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))} placeholder="Kendinden kısaca bahset…" rows={3} />
              </div>

              <Button type="submit" size="sm" isLoading={isLoading} className="gap-1.5">
                <Save className="h-4 w-4" />
                Kaydet
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
