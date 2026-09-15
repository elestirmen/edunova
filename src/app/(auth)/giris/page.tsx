"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/ui/loading";

const demoAccounts = [
  { role: "Öğrenci", email: "ogrenci@edunova.com", icon: GraduationCap },
  { role: "Öğretmen", email: "ogretmen@edunova.com", icon: Users },
  { role: "Yönetici", email: "admin@edunova.com", icon: UserCog },
];

const highlights = [
  "Saat paketleri ve bakiye otomatik işlensin",
  "Ders teslimi hakedişe anında dönüşsün",
  "Veli çocuğunun durumunu kendi panelinden görsün",
];

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loading />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Geçersiz e-posta veya şifre");
      } else {
        const res = await fetch("/api/auth/session");
        const session = await res.json();
        const role = session?.user?.role;

        if (role === "STUDENT") router.push("/panel/ogrenci");
        else if (role === "TEACHER") router.push("/panel/ogretmen");
        else if (role === "ADMIN") router.push("/panel/yonetici");
        else if (role === "PARENT") router.push("/panel/veli");
        else router.push("/panel");
      }
    } catch {
      setError("Giriş yapılırken bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ---------- Sol: marka paneli ---------- */}
      <div className="relative hidden overflow-hidden gradient-hero lg:flex lg:w-[46%] lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 noise opacity-[0.14]" />
        <div className="absolute -left-24 top-10 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-leaf-300/20 blur-3xl" />

        <Link href="/" className="relative inline-flex items-center gap-3 text-white">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/95 shadow-lg">
            <Image
              src="/logo.png"
              alt="Edunova"
              width={36}
              height={36}
              className="h-8 w-8 object-contain"
              priority
            />
          </span>
          <span className="text-xl font-bold tracking-tight">Edunova</span>
        </Link>

        <div className="relative max-w-md text-white">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-semibold ring-1 ring-inset ring-white/25 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Operasyon paneli
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
            Ajansın bugün nerede duruyor, tek ekranda gör.
          </h2>
          <p className="mt-4 text-white/80">
            Ders, bakiye, hakediş ve veli iletişimi aynı akışta. Giriş yap, kaldığın
            yerden devam et.
          </p>

          <ul className="mt-8 space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/90">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-xs text-white/70">
          <ShieldCheck className="h-4 w-4" />
          Rol bazlı erişim — herkes yalnızca kendi verisini görür.
        </p>
      </div>

      {/* ---------- Sağ: form ---------- */}
      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-8">
        <div className="absolute inset-0 aurora opacity-70 lg:opacity-40" />

        <div className="relative w-full max-w-[26rem]">
          <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 lg:hidden">
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

          <div className="mb-7 text-center lg:text-left">
            <h1 className="text-2xl font-bold tracking-tight">Tekrar hoş geldin</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Hesabına giriş yap ve panele devam et.
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-xl sm:p-7">
            {registered && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-leaf-500/25 bg-leaf-500/10 p-3 text-[13px] font-medium text-leaf-800 dark:text-leaf-200">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                Kayıt başarılı. Şimdi giriş yapabilirsin.
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2.5 rounded-xl border border-destructive/25 bg-destructive/10 p-3 text-[13px] font-medium text-destructive"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-[13px] font-semibold text-foreground"
                >
                  E-posta
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="ornek@edunova.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-[13px] font-semibold text-foreground"
                >
                  Şifre
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full gap-2"
                isLoading={isLoading}
              >
                Giriş Yap
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-[13px] text-muted-foreground">
              Hesabın yok mu?{" "}
              <Link href="/kayit" className="font-semibold text-primary hover:underline">
                Yöneticine başvur
              </Link>
            </p>
          </div>

          {/* Demo erişimi — tıklayınca alanları doldurur */}
          <div className="mt-5 rounded-2xl border border-dashed bg-card/60 p-4">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Demo hesapları
            </p>
            <div className="grid gap-1.5">
              {demoAccounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => {
                    setEmail(account.email);
                    setPassword("123456");
                    setError("");
                  }}
                  className="group flex items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-accent"
                >
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <account.icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold leading-tight">
                      {account.role}
                    </span>
                    <span className="block truncate text-[11px] text-muted-foreground">
                      {account.email}
                    </span>
                  </span>
                  <span className="text-[11px] font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100">
                    Doldur
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
