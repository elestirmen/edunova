import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Kayıt" };

export default function KayitPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-5 py-12">
      <div className="absolute inset-0 gradient-hero-soft" />
      <div className="absolute inset-0 aurora" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/15 bg-white shadow-sm">
            <Image
              src="/logo.png"
              alt="Edunova"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
            />
          </span>
          <span className="text-xl font-bold tracking-tight text-gradient">Edunova</span>
        </Link>

        <div className="rounded-3xl border bg-card p-7 text-center shadow-xl">
          <span className="mx-auto mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Kayıt yöneticiye özel</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Edunova kapalı bir platformdur. Öğrenci, öğretmen ve veli hesapları ajans
            yöneticisi tarafından oluşturulur.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-muted/60 px-4 py-3 text-[13px] text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            Hesap talebi için yöneticinle iletişime geç.
          </div>

          <Link href="/giris" className="mt-6 block">
            <Button variant="outline" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Giriş sayfasına dön
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
