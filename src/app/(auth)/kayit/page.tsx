"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { registerSchema } from "@/lib/validations";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    setErrors({});

    const parsed = registerSchema.safeParse(formData);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error || "Kayıt sırasında bir hata oluştu");
        return;
      }

      router.push("/giris?registered=true");
    } catch {
      setServerError("Kayıt sırasında bir hata oluştu");
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
          <h2 className="mb-4 text-3xl font-black">Yolculuğun başlıyor!</h2>
          <p className="text-lg text-white/80">
            Edunova&apos;ya katıl, derslerini organize et ve her gün biraz daha ilerle.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            {["🎓", "📚", "💪", "🏆"].map((emoji, i) => (
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
            <h1 className="text-2xl font-black">Kayıt Ol 🎉</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Edunova&apos;ya katıl ve öğrenme yolculuğuna başla
            </p>
          </div>

          <Card className="border-2 shadow-lg">
            <CardContent className="p-6">
              {serverError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 font-medium">
                  ❌ {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Ad</label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input name="firstName" placeholder="Adın" value={formData.firstName} onChange={handleChange} error={errors.firstName} className="pl-10 rounded-xl h-11" />
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold">Soyad</label>
                    <Input name="lastName" placeholder="Soyadın" value={formData.lastName} onChange={handleChange} error={errors.lastName} className="rounded-xl h-11" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="email" name="email" placeholder="ornek@email.com" value={formData.email} onChange={handleChange} error={errors.email} className="pl-10 rounded-xl h-11" />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Şifre</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type={showPassword ? "text" : "password"} name="password" placeholder="En az 6 karakter" value={formData.password} onChange={handleChange} error={errors.password} className="pl-10 pr-10 rounded-xl h-11" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-muted-foreground hover:text-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">Şifre Tekrar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input type="password" name="confirmPassword" placeholder="Şifreni tekrar gir" value={formData.confirmPassword} onChange={handleChange} error={errors.confirmPassword} className="pl-10 rounded-xl h-11" />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-xl h-11 text-base font-bold" isLoading={isLoading}>
                  Kayıt Ol
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                Zaten hesabın var mı?{" "}
                <Link href="/giris" className="font-bold text-primary hover:underline">Giriş Yap</Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
