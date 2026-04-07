import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Edunova" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-xl font-extrabold text-gradient">Edunova</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/giris">
              <Button variant="ghost" size="sm" className="rounded-xl font-semibold">
                Giriş Yap
              </Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm" className="rounded-xl font-semibold">
                Kayıt Ol
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — tek odak noktası */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="relative mx-auto max-w-5xl px-6 pb-10 pt-16 lg:pb-16 lg:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            {/* Sol: Metin */}
            <div className="text-center lg:text-left">
              <Image
                src="/logo.png"
                alt="Edunova"
                width={72}
                height={72}
                className="mx-auto mb-6 h-16 w-16 object-contain lg:mx-0"
              />
              <h1 className="mb-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                Derslerini takip et,{" "}
                <span className="text-gradient">hedeflerine ulaş.</span>
              </h1>
              <p className="mb-8 text-base text-muted-foreground sm:text-lg">
                Ders programın, ilerlemen ve hedeflerin tek bir yerde.
                Edunova ile her gün biraz daha ilerle.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/kayit">
                  <Button
                    size="lg"
                    className="w-full gap-2 rounded-xl px-8 text-base font-bold shadow-lg shadow-teal-500/20 sm:w-auto"
                  >
                    Hemen Başla <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/giris">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full rounded-xl px-8 text-base font-bold sm:w-auto"
                  >
                    Giriş Yap
                  </Button>
                </Link>
              </div>
            </div>

            {/* Sağ: Canlı dashboard önizleme */}
            <div className="relative mx-auto w-full max-w-sm lg:mx-0 lg:ml-auto">
              <div className="rounded-3xl border bg-white p-5 shadow-xl shadow-teal-500/5">
                {/* Greeting */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-sm font-bold text-teal-700">
                    CA
                  </div>
                  <div>
                    <p className="text-sm font-bold">Merhaba, Cem!</p>
                    <p className="text-xs text-muted-foreground">
                      12 günlük seri 🔥
                    </p>
                  </div>
                </div>

                {/* Streak mini */}
                <div className="mb-3 flex gap-3">
                  <div className="flex-1 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 p-3 text-center text-white">
                    <p className="text-2xl font-black leading-none">12</p>
                    <p className="mt-0.5 text-[10px] text-white/80">gün seri</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-teal-50 p-3 text-center">
                    <p className="text-2xl font-black leading-none text-teal-700">5</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">aktif ders</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-emerald-50 p-3 text-center">
                    <p className="text-2xl font-black leading-none text-emerald-700">47</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">katılım</p>
                  </div>
                </div>

                {/* Weekly progress */}
                <div className="mb-3 rounded-2xl bg-teal-50/70 p-3">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="font-semibold">🎯 Haftalık Hedef</span>
                    <span className="font-bold text-teal-600">4/5</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-teal-100">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                </div>

                {/* Today's lesson */}
                <div className="flex items-center gap-3 rounded-2xl border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 text-xs font-bold text-white">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold">Matematik</p>
                    <p className="text-[10px] text-muted-foreground">09:00 - 10:30 · A-101</p>
                  </div>
                  <span className="text-xs text-muted-foreground">📍</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Özellik — kısa ve net */}
      <section className="border-t bg-white py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-6 text-center">
              <span className="mb-2 block text-3xl">📅</span>
              <h3 className="mb-1 font-bold">Ders Programı</h3>
              <p className="text-sm text-muted-foreground">
                Haftalık programını gör, hiçbir dersi kaçırma.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 p-6 text-center">
              <span className="mb-2 block text-3xl">🔥</span>
              <h3 className="mb-1 font-bold">Seri Takibi</h3>
              <p className="text-sm text-muted-foreground">
                Her gün devam et, serileri kır, motivasyonunu koru.
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 p-6 text-center">
              <span className="mb-2 block text-3xl">🎯</span>
              <h3 className="mb-1 font-bold">Hedefler</h3>
              <p className="text-sm text-muted-foreground">
                Haftalık hedefler belirle ve ilerlemeni takip et.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA — sade ve etkili */}
      <section className="gradient-hero py-16 text-white">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="mb-3 text-2xl font-black sm:text-3xl">
            Hazır mısın?
          </h2>
          <p className="mb-6 text-white/80">
            Ücretsiz kayıt ol ve öğrenme yolculuğuna başla.
          </p>
          <Link href="/kayit">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 rounded-xl px-8 text-base font-bold shadow-lg"
            >
              Ücretsiz Kayıt Ol <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer — minimal */}
      <footer className="border-t py-6">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Image src="/logo.png" alt="Edunova" width={20} height={20} className="h-5 w-5 object-contain" />
            <span className="text-xs">&copy; 2025 Edunova</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
