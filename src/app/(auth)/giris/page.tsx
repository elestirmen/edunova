"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loading /></div>}>
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
      {/* Left — Decorative */}
      <div className="hidden lg:flex lg:w-1/2 gradient-hero items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <Image src="/logo.png" alt="Edunova" width={120} height={120} className="mx-auto mb-6 h-28 w-28 object-contain brightness-0 invert opacity-90 animate-float" />
          <h2 className="mb-4 text-3xl font-black">Tekrar hoş geldin!</h2>
          <p className="text-lg text-white/80">
            Derslerini takip et, serileri kır ve hedeflerine ulaş.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {["📚", "🔥", "🎯", "⭐"].map((emoji, i) => (
              <span key={i} className="text-3xl animate-float" style={{ animationDelay: `${i * 0.4}s` }}>
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="Edunova" width={44} height={44} className="h-11 w-11 object-contain" />
              <span className="text-2xl font-extrabold text-gradient">Edunova</span>
            </Link>
          </div>

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black">Giriş Yap 👋</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Hesabına giriş yap ve öğrenmeye devam et
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              {registered && (
                <div className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700 font-medium">
                  🎉 Kayıt başarılı! Şimdi giriş yapabilirsin.
                </div>
              )}

              {error && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium">
                  ❌ {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 rounded-xl h-11"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 rounded-xl h-11"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl h-11 text-base font-bold" isLoading={isLoading}>
                  Giriş Yap
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Hesabın yok mu?{" "}
                <Link href="/kayit" className="font-bold text-primary hover:underline">Kayıt Ol</Link>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 rounded-2xl border-2 border-dashed p-4">
            <p className="mb-2 text-xs font-bold text-muted-foreground uppercase tracking-wide">🧪 Demo Hesaplar</p>
            <div className="space-y-1.5 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-base">🎓</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ogrenci@edunova.com</code>
                <span className="text-muted-foreground">/</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">123456</code>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">👨‍🏫</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">ogretmen@edunova.com</code>
                <span className="text-muted-foreground">/</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">123456</code>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-base">🛡️</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">admin@edunova.com</code>
                <span className="text-muted-foreground">/</span>
                <code className="rounded bg-muted px-1.5 py-0.5 text-xs">123456</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
