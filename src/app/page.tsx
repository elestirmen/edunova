import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coins,
  GraduationCap,
  Heart,
  MapPin,
  Package,
  Shield,
  Sparkles,
  UserCog,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="Edunova"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
            <span className="text-xl font-extrabold text-gradient">Edunova</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors">
              Özellikler
            </a>
            <a href="#roller" className="hover:text-foreground transition-colors">
              Roller
            </a>
          </div>
          <Link href="/giris">
            <Button size="sm" className="font-semibold">
              Giriş Yap
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 lg:pb-24 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white/80 dark:bg-card/80 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Uzaktan özel ders operasyon platformu
              </div>
              <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Özel ders işini{" "}
                <span className="text-gradient">tek panelden</span> yönet.
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground mx-auto lg:mx-0">
                Saat paketleri, öğretmen hakedişleri, ders teslimleri, veli iletişimi
                ve ödev takibi — operasyonun bir yerde.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/giris">
                  <Button
                    size="lg"
                    className="w-full gap-2 px-8 text-base font-bold shadow-lg shadow-primary/20 sm:w-auto"
                  >
                    Giriş Yap <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#ozellikler">
                  <Button variant="outline" size="lg" className="w-full px-8 text-base font-bold sm:w-auto">
                    Özellikleri Keşfet
                  </Button>
                </a>
              </div>
            </div>

            {/* Önizleme */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 blur-2xl" />
              <div className="relative rounded-2xl border bg-card p-5 shadow-2xl">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-950/40 text-sm font-bold text-teal-700 dark:text-teal-300">
                    AY
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Bu ay özet</p>
                    <p className="text-xs text-muted-foreground">Operasyon paneli</p>
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-2.5 text-center">
                    <p className="text-lg font-black text-blue-700 dark:text-blue-300">87</p>
                    <p className="text-[10px] text-muted-foreground">Ders</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-2.5 text-center">
                    <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">12</p>
                    <p className="text-[10px] text-muted-foreground">Öğrenci</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 p-2.5 text-center">
                    <p className="text-lg font-black text-purple-700 dark:text-purple-300">9</p>
                    <p className="text-[10px] text-muted-foreground">Öğretmen</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "Matematik (Cem)", time: "16:00", room: "Zoom", color: "#6366F1" },
                    { name: "YKS Mat. Grubu", time: "Cumartesi 10:00", room: "Meet", color: "#EF4444" },
                  ].map((lesson) => (
                    <div
                      key={lesson.name}
                      className="flex items-center gap-3 rounded-xl border p-2.5"
                    >
                      <div
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white"
                        style={{ backgroundColor: lesson.color }}
                      >
                        {lesson.name.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{lesson.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />
                          {lesson.time}
                          <MapPin className="ml-1 h-2.5 w-2.5" />
                          {lesson.room}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Özellikler */}
      <section id="ozellikler" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">
              Özellikler
            </p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">
              Özel ders ajansını yönetmek için ihtiyacın olan her şey
            </h2>
            <p className="text-muted-foreground">
              Birebir ve grup derslerini, saat paketlerini, öğretmen hakedişlerini ve
              veli iletişimini aynı yerde takip et.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Package,
                title: "Saat Paketleri",
                desc: "Veliden peşin paket al, bakiyeyi otomatik takip et. Düşen bakiyede uyarı al.",
              },
              {
                icon: Coins,
                title: "Öğretmen Hakedişi",
                desc: "Her ders sonrası saatlik ücretten hakediş otomatik hesaplanır. Aylık ödeme akışı hazır.",
              },
              {
                icon: Calendar,
                title: "Ders Programı + Online Link",
                desc: "Haftalık ders programı, online toplantı linkleriyle birlikte. Bir tıkla katıl.",
              },
              {
                icon: ClipboardCheck,
                title: "Yoklama + Ders Notu",
                desc: "Tarih seçici ile geçmiş düzeltme. Her ders için işlenen konuyu kaydet.",
              },
              {
                icon: Heart,
                title: "Veli İletişimi",
                desc: "Veli paneli: çocuğun bakiyesi, devamlılığı ve haftalık özeti.",
              },
              {
                icon: Wallet,
                title: "Finansal Özet",
                desc: "Aylık gelir, ödenmemiş hakediş, brüt kâr — operasyonun tek bakışta.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 text-primary">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roller */}
      <section id="roller" className="border-y bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">
              Roller
            </p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">
              Dört rol, dört özelleştirilmiş deneyim
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UserCog,
                title: "Yönetici",
                items: ["Paket satışı + bakiye", "Öğretmen hakediş", "Tatil & ücret", "Finansal özet"],
                gradient: "from-purple-500 to-indigo-500",
              },
              {
                icon: BookOpen,
                title: "Öğretmen",
                items: ["Ders teslim akışı", "Tarih seçicili yoklama", "Materyal & ödev", "Aylık kazanç"],
                gradient: "from-emerald-500 to-teal-500",
              },
              {
                icon: GraduationCap,
                title: "Öğrenci",
                items: ["Bugünkü ders + link", "Bakiyem", "Ödev teslim", "Kendi hedefim"],
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: Heart,
                title: "Veli",
                items: ["Çocuğun bakiyesi", "Devamlılık", "Haftalık özet", "Ders notları"],
                gradient: "from-rose-500 to-pink-500",
              },
            ].map((role) => (
              <div
                key={role.title}
                className="overflow-hidden rounded-2xl border bg-card"
              >
                <div className={`bg-gradient-to-r ${role.gradient} p-5 text-white`}>
                  <role.icon className="mb-2 h-7 w-7" />
                  <h3 className="text-lg font-bold">{role.title}</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {role.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Shield className="mx-auto mb-4 h-10 w-10 text-white/80" />
          <h2 className="mb-4 text-3xl font-black sm:text-4xl">
            Operasyona giriş yap
          </h2>
          <p className="mb-8 text-lg text-white/80 max-w-xl mx-auto">
            Hesap açma admin tarafından yapılır. Yönetici, öğretmen, öğrenci ve veli
            kullanıcıları davet edilir.
          </p>
          <Link href="/giris">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 px-8 text-base font-bold shadow-lg"
            >
              Giriş Yap <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/logo.png"
                alt="Edunova"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
              <span className="text-base font-extrabold text-gradient">Edunova</span>
            </Link>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Edunova
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
