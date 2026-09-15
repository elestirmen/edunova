import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Coins,
  GraduationCap,
  Heart,
  LineChart,
  Lock,
  MapPin,
  Package,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
  Video,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Package,
    title: "Saat Paketleri",
    desc: "Veliden peşin paket al, kalan saat her teslim edilen derste otomatik düşsün. Bakiye kritik seviyeye inince uyarı gelsin.",
  },
  {
    icon: Coins,
    title: "Öğretmen Hakedişi",
    desc: "Saatlik tarifeden hakediş ders biter bitmez hesaplanır. Ay sonunda tek tıkla ödeme listesi hazır.",
  },
  {
    icon: CalendarCheck,
    title: "Program + Online Link",
    desc: "Haftalık ders programı, tekrar eden toplantı linkleriyle. Öğrenci derse panelden tek tıkla katılır.",
  },
  {
    icon: ClipboardCheck,
    title: "Yoklama + Ders Notu",
    desc: "Geçmiş tarihli düzeltme için tarih seçici, her ders için işlenen konu ve öğrenci notu kaydı.",
  },
  {
    icon: Heart,
    title: "Veli Görünürlüğü",
    desc: "Veli kendi panelinden çocuğunun bakiyesini, devamlılığını ve haftalık özetini görür. Telefon trafiği biter.",
  },
  {
    icon: LineChart,
    title: "Finansal Özet",
    desc: "Aylık gelir, ödenmemiş hakediş ve brüt kâr tek ekranda. Operasyon nerede duruyor, bir bakışta belli.",
  },
];

const roles = [
  {
    icon: UserCog,
    title: "Yönetici",
    tagline: "Operasyonun tamamı",
    items: ["Paket satışı + bakiye", "Öğretmen hakediş", "Tatil & ücret tanımı", "Finansal özet"],
    gradient: "from-ocean-600 to-ocean-400",
  },
  {
    icon: BookOpen,
    title: "Öğretmen",
    tagline: "Ders ve kazanç",
    items: ["Ders teslim akışı", "Tarih seçicili yoklama", "Materyal & ödev", "Aylık kazanç"],
    gradient: "from-brand-600 to-brand-400",
  },
  {
    icon: GraduationCap,
    title: "Öğrenci",
    tagline: "Günlük odak",
    items: ["Bugünkü ders + link", "Kalan saatim", "Ödev teslimi", "Hedef ve ilerleme"],
    gradient: "from-leaf-600 to-leaf-400",
  },
  {
    icon: Heart,
    title: "Veli",
    tagline: "Şeffaf takip",
    items: ["Çocuğun bakiyesi", "Devamlılık kaydı", "Haftalık özet", "Ders notları"],
    gradient: "from-rose-500 to-rose-400",
  },
];

const flow = [
  {
    step: "01",
    icon: Package,
    title: "Paket satılır",
    desc: "Veli 10 saatlik paketi alır, bakiye öğrencinin dersine tanımlanır.",
  },
  {
    step: "02",
    icon: Video,
    title: "Ders işlenir",
    desc: "Öğretmen programdaki dersi online linkten işler, yoklama ve konu notunu girer.",
  },
  {
    step: "03",
    icon: Clock,
    title: "Saat düşer",
    desc: "Teslim edilen ders bakiyeden otomatik düşer, veli anında görür.",
  },
  {
    step: "04",
    icon: Wallet,
    title: "Hakediş oluşur",
    desc: "Öğretmenin kazancı işlenir; ay sonunda ödeme listesi tek tıkla hazırlanır.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ---------- Navbar ---------- */}
      <nav className="sticky top-0 z-50 border-b glass">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/15 bg-white shadow-sm transition-transform duration-300 ease-premium group-hover:scale-105">
              <Image
                src="/logo.png"
                alt="Edunova"
                width={32}
                height={32}
                className="h-7 w-7 object-contain"
                priority
              />
            </span>
            <span className="text-xl font-bold tracking-tight text-gradient">Edunova</span>
          </Link>

          <div className="hidden items-center gap-1 text-sm font-medium text-muted-foreground md:flex">
            {[
              { href: "#ozellikler", label: "Özellikler" },
              { href: "#akis", label: "Nasıl çalışır" },
              { href: "#roller", label: "Roller" },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <Link href="/giris">
            <Button size="sm" className="gap-1.5">
              Giriş Yap <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* ---------- Hero ---------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="absolute inset-0 aurora" />
        <div className="absolute inset-0 bg-grid-faint bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_72%)]" />

        <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-16 sm:px-6 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="text-center lg:text-left">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-xs backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Uzaktan özel ders operasyon platformu
              </div>

              <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.4rem]">
                Özel ders işini{" "}
                <span className="text-gradient">tek panelden</span> yönet.
              </h1>

              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground lg:mx-0 lg:text-lg">
                Saat paketleri, öğretmen hakedişleri, ders teslimleri, veli iletişimi ve
                ödev takibi — dağınık tablolar yerine tek bir operasyon merkezinde.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/giris">
                  <Button size="lg" className="w-full gap-2 sm:w-auto">
                    Panele Giriş Yap <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#ozellikler">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Özellikleri Keşfet
                  </Button>
                </a>
              </div>

              {/* Değer şeridi */}
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t pt-6 lg:mx-0 lg:max-w-md">
                {[
                  { value: "4", label: "rol, tek sistem" },
                  { value: "Otomatik", label: "saat düşümü" },
                  { value: "Tek tık", label: "hakediş ödemesi" },
                ].map((item) => (
                  <div key={item.label}>
                    <p className="text-lg font-bold tracking-tight text-foreground">
                      {item.value}
                    </p>
                    <p className="text-[11px] leading-tight text-muted-foreground">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* ---------- Ürün önizlemesi ---------- */}
            <div className="relative mx-auto w-full max-w-md lg:ml-auto lg:mr-0">
              <div className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-ocean-400/20 via-brand-400/10 to-leaf-400/20 blur-3xl" />

              {/* Arka katman */}
              <div className="absolute -right-3 top-5 hidden h-full w-full rotate-2 rounded-3xl border bg-card/50 shadow-lg backdrop-blur sm:block" />

              <div className="relative overflow-hidden rounded-3xl border bg-card shadow-xl">
                <div className="flex items-center justify-between border-b bg-muted/40 px-5 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg brand-surface text-[11px] font-bold text-primary-foreground">
                      AY
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold leading-tight">Bu ay özet</p>
                      <p className="text-[11px] text-muted-foreground">Yönetici paneli</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-leaf-500/12 px-2 py-0.5 text-[10px] font-semibold text-leaf-700 dark:text-leaf-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-leaf-500" />
                    Canlı
                  </span>
                </div>

                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-3 gap-2.5">
                    {[
                      { value: "87", label: "Teslim ders", tone: "text-ocean-700 dark:text-ocean-300", bg: "bg-ocean-500/10" },
                      { value: "12", label: "Öğrenci", tone: "text-brand-700 dark:text-brand-300", bg: "bg-brand-500/10" },
                      { value: "9", label: "Öğretmen", tone: "text-leaf-700 dark:text-leaf-300", bg: "bg-leaf-500/10" },
                    ].map((s) => (
                      <div key={s.label} className={`rounded-xl ${s.bg} p-3 text-center`}>
                        <p className={`tabular text-xl font-bold leading-none ${s.tone}`}>
                          {s.value}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Bakiye çubuğu */}
                  <div className="rounded-xl border p-3.5">
                    <div className="mb-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold">Ayşe — Matematik paketi</span>
                      <span className="tabular text-muted-foreground">6,5 / 10 saat</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-[65%] rounded-full bg-[linear-gradient(90deg,hsl(198_52%_44%),hsl(176_50%_42%)_55%,hsl(148_48%_46%))]" />
                    </div>
                  </div>

                  {/* Ders listesi */}
                  <div className="space-y-2">
                    {[
                      { name: "Matematik — Cem", time: "16:00", room: "Zoom", color: "hsl(198 52% 42%)" },
                      { name: "YKS Mat. Grubu", time: "Cmt 10:00", room: "Meet", color: "hsl(148 48% 42%)" },
                    ].map((lesson) => (
                      <div
                        key={lesson.name}
                        className="flex items-center gap-3 rounded-xl border p-2.5"
                      >
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-[11px] font-bold text-white"
                          style={{ backgroundColor: lesson.color }}
                        >
                          {lesson.name.slice(0, 2)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">{lesson.name}</p>
                          <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <Clock className="h-2.5 w-2.5" />
                            {lesson.time}
                            <MapPin className="ml-1 h-2.5 w-2.5" />
                            {lesson.room}
                          </p>
                        </div>
                        <span className="rounded-lg bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">
                          Katıl
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Yüzen hakediş kartı */}
              <div className="absolute -bottom-10 -left-16 hidden animate-float rounded-2xl border bg-card p-3.5 shadow-lg xl:block">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-leaf-500/12 text-leaf-600 dark:text-leaf-300">
                    <Coins className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Ödenmemiş hakediş
                    </p>
                    <p className="tabular text-sm font-bold">₺14.250</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Özellikler ---------- */}
      <section id="ozellikler" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Özellikler
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Ajansı yönetmek için ihtiyacın olan her şey
            </h2>
            <p className="mt-4 text-muted-foreground">
              Birebir ve grup derslerini, saat paketlerini, öğretmen hakedişlerini ve veli
              iletişimini aynı yerde takip et.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all duration-300 ease-premium hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg"
              >
                <div className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-primary/10 to-transparent opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                <div className="mb-5 inline-flex rounded-xl bg-primary/10 p-3 text-primary ring-1 ring-inset ring-primary/15 transition-transform duration-300 ease-premium group-hover:scale-105">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mb-2 text-base font-semibold tracking-tight">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Akış ---------- */}
      <section id="akis" className="relative overflow-hidden border-y bg-muted/30 py-20 lg:py-28">
        <div className="absolute inset-0 aurora opacity-60" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Nasıl çalışır
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Paketten hakedişe tek akış
            </h2>
            <p className="mt-4 text-muted-foreground">
              Ders bittiği anda bakiye de hakediş de kendi kendine işler. Elle tablo
              güncellemek yok.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {flow.map((item, idx) => (
              <div key={item.step} className="relative">
                {idx < flow.length - 1 && (
                  <div className="absolute left-[calc(100%-0.5rem)] top-12 hidden h-px w-4 bg-border lg:block" />
                )}
                <div className="h-full rounded-2xl border bg-card p-5 shadow-sm transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-inset ring-primary/15">
                      <item.icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="tabular text-xs font-bold text-muted-foreground/50">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="mb-1.5 text-[15px] font-semibold tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-[13px] leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Roller ---------- */}
      <section id="roller" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Roller
            </p>
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              Dört rol, dört özelleştirilmiş panel
            </h2>
            <p className="mt-4 text-muted-foreground">
              Herkes yalnızca kendi işini görür; yetkiler sistem tarafından ayrılır.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <div
                key={role.title}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all duration-300 ease-premium hover:-translate-y-1 hover:shadow-lg"
              >
                <div className={`relative bg-gradient-to-br ${role.gradient} p-5 text-white`}>
                  <div className="absolute inset-0 noise opacity-[0.12]" />
                  <role.icon className="relative mb-3 h-6 w-6" />
                  <h3 className="relative text-lg font-semibold tracking-tight">{role.title}</h3>
                  <p className="relative text-xs text-white/80">{role.tagline}</p>
                </div>
                <ul className="space-y-2.5 p-5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[13px]">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Güven ---------- */}
      <section className="border-t bg-muted/20 py-14">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: Lock,
              title: "Rol bazlı yetki",
              desc: "Her panel yalnızca kendi verisine erişir; API katmanında da korunur.",
            },
            {
              icon: ShieldCheck,
              title: "Denetim kaydı",
              desc: "Kritik işlemler kim, ne zaman, ne yaptı bilgisiyle kayıt altında.",
            },
            {
              icon: Users,
              title: "Davetle hesap",
              desc: "Kullanıcılar yönetici tarafından oluşturulur; açık kayıt yok.",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3.5">
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card text-primary shadow-sm ring-1 ring-border">
                <item.icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-tight">{item.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="relative overflow-hidden gradient-hero py-20 text-white">
        <div className="absolute inset-0 noise opacity-[0.15]" />
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-72 w-72 rounded-full bg-leaf-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-6">
          <span className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Operasyona giriş yap</h2>
          <p className="mx-auto mt-4 max-w-xl text-white/85">
            Hesaplar yönetici tarafından açılır. Yönetici, öğretmen, öğrenci ve veli
            kullanıcıları davet edilir.
          </p>
          <Link href="/giris" className="mt-8 inline-block">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 bg-white text-brand-800 shadow-xl hover:bg-white/90"
            >
              Giriş Yap <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="border-t bg-background py-10">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/15 bg-white shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Edunova"
                  width={28}
                  height={28}
                  className="h-6 w-6 object-contain"
                />
              </span>
              <span className="text-base font-bold tracking-tight text-gradient">Edunova</span>
            </Link>

            <div className="flex items-center gap-5 text-xs text-muted-foreground">
              <a href="#ozellikler" className="transition-colors hover:text-foreground">
                Özellikler
              </a>
              <a href="#akis" className="transition-colors hover:text-foreground">
                Nasıl çalışır
              </a>
              <Link href="/giris" className="transition-colors hover:text-foreground">
                Giriş
              </Link>
            </div>

            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Edunova
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
