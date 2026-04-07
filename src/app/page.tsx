import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  GraduationCap,
  Layout,
  MapPin,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  UserCog,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="Edunova" width={36} height={36} className="h-9 w-9 object-contain" />
            <span className="text-xl font-extrabold text-gradient">Edunova</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a>
            <a href="#nasil-calisir" className="hover:text-foreground transition-colors">Nasıl Çalışır</a>
            <a href="#roller" className="hover:text-foreground transition-colors">Kimler İçin</a>
            <a href="#sss" className="hover:text-foreground transition-colors">SSS</a>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/giris">
              <Button variant="ghost" size="sm" className="font-semibold">Giriş Yap</Button>
            </Link>
            <Link href="/kayit">
              <Button size="sm" className="font-semibold">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero-soft" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        <div className="relative mx-auto max-w-6xl px-6 pb-16 pt-20 lg:pb-24 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-white/80 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                Eğitimde yeni nesil platform
              </div>
              <h1 className="mb-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Eğitimi{" "}
                <span className="text-gradient">kolaylaştıran</span>
                <br />
                platform.
              </h1>
              <p className="mb-8 max-w-lg text-lg text-muted-foreground mx-auto lg:mx-0">
                Ders programı, öğrenci takibi, ilerleme analizi ve duyuru yönetimi
                — öğrenci, öğretmen ve yöneticiler için hepsi tek çatı altında.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/kayit">
                  <Button size="lg" className="w-full gap-2 px-8 text-base font-bold shadow-lg shadow-primary/20 sm:w-auto">
                    Ücretsiz Başla <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#ozellikler">
                  <Button variant="outline" size="lg" className="w-full px-8 text-base font-bold sm:w-auto">
                    Keşfet
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Ücretsiz</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Kurulum gerektirmez</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-primary" />Türkçe</span>
              </div>
            </div>

            {/* Dashboard Preview */}
            <div className="relative mx-auto w-full max-w-md lg:mx-0 lg:ml-auto">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 via-transparent to-emerald-500/10 blur-2xl" />
              <div className="relative rounded-2xl border bg-white p-5 shadow-2xl shadow-primary/5">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-100 text-sm font-bold text-teal-700">CA</div>
                  <div className="flex-1">
                    <p className="text-sm font-bold">Merhaba, Cem!</p>
                    <p className="text-xs text-muted-foreground">3 ders bugün</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-700">
                    <Flame className="h-3 w-3" /> 12 gün
                  </div>
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-blue-50 p-2.5 text-center">
                    <p className="text-lg font-black text-blue-700">5</p>
                    <p className="text-[10px] text-muted-foreground">Ders</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                    <p className="text-lg font-black text-emerald-700">47</p>
                    <p className="text-[10px] text-muted-foreground">Katılım</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-2.5 text-center">
                    <p className="text-lg font-black text-purple-700">%92</p>
                    <p className="text-[10px] text-muted-foreground">Başarı</p>
                  </div>
                </div>
                <div className="mb-2.5 rounded-xl bg-muted/50 p-3">
                  <div className="mb-1.5 flex justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold"><Target className="h-3 w-3 text-primary" />Haftalık Hedef</span>
                    <span className="font-bold text-primary">4/5</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { name: "Matematik", time: "09:00 - 10:30", room: "A-101", color: "#6366F1" },
                    { name: "Fizik", time: "11:00 - 12:30", room: "B-203", color: "#F59E0B" },
                  ].map((lesson) => (
                    <div key={lesson.name} className="flex items-center gap-3 rounded-xl border p-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white" style={{ backgroundColor: lesson.color }}>
                        {lesson.name.slice(0, 2)}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold">{lesson.name}</p>
                        <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" />{lesson.time}
                          <MapPin className="ml-1 h-2.5 w-2.5" />{lesson.room}
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

      {/* ── Social Proof Bar ── */}
      <section className="border-y bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-6 py-8 sm:gap-16">
          {[
            { value: "500+", label: "Aktif Öğrenci" },
            { value: "50+", label: "Öğretmen" },
            { value: "120+", label: "Ders" },
            { value: "%98", label: "Memnuniyet" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black text-foreground sm:text-3xl">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="ozellikler" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">Özellikler</p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">Eğitim yönetimi için ihtiyacın olan her şey</h2>
            <p className="text-muted-foreground">
              Ders takibinden ilerleme analizine, duyuru yönetiminden program planlamasına kadar
              tüm eğitim süreçlerini tek platformda yönetin.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Calendar, title: "Ders Programı", desc: "Haftalık program görünümü ile tüm dersleri, saatleri ve sınıfları tek bakışta görün.", color: "text-blue-600 bg-blue-50" },
              { icon: TrendingUp, title: "İlerleme Takibi", desc: "Öğrencilerin katılım oranları, serileri ve seviye ilerlemelerini gerçek zamanlı izleyin.", color: "text-emerald-600 bg-emerald-50" },
              { icon: Target, title: "Hedef Belirleme", desc: "Haftalık ders hedefleri belirleyin ve öğrencilerin motivasyonunu artırın.", color: "text-purple-600 bg-purple-50" },
              { icon: Bell, title: "Duyuru Sistemi", desc: "Genel veya derse özel duyurular yayınlayın, tüm kullanıcılara anında ulaşın.", color: "text-amber-600 bg-amber-50" },
              { icon: Users, title: "Kullanıcı Yönetimi", desc: "Öğrenci, öğretmen ve yönetici hesaplarını kolayca oluşturun ve yönetin.", color: "text-rose-600 bg-rose-50" },
              { icon: BarChart3, title: "İstatistikler", desc: "Detaylı raporlar ve analizlerle eğitim kalitesini ölçümleyin ve geliştirin.", color: "text-cyan-600 bg-cyan-50" },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-2xl border bg-card p-6 transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
                <div className={`mb-4 inline-flex rounded-xl p-3 ${feature.color}`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="nasil-calisir" className="border-y bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">Nasıl Çalışır</p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">3 adımda başlayın</h2>
            <p className="text-muted-foreground">Edunova&apos;yı kullanmaya başlamak dakikalar sürer.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              { step: "01", title: "Hesap Oluşturun", desc: "Ücretsiz kayıt olun. Yöneticiniz size öğretmen veya öğrenci rolü atayacak.", icon: UserCog },
              { step: "02", title: "Derslere Katılın", desc: "Atanan derslerinizi görüntüleyin, ders programınızı inceleyin ve hazırlığınızı yapın.", icon: BookOpen },
              { step: "03", title: "İlerlemenizi Takip Edin", desc: "Günlük seri, haftalık hedef ve seviye sistemiyle motivasyonunuzu koruyun.", icon: Zap },
            ].map((item) => (
              <div key={item.step} className="relative text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                  <item.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Role-Based Sections ── */}
      <section id="roller" className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">Kimler İçin</p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">Her rol için özel deneyim</h2>
            <p className="text-muted-foreground">
              Öğrenci, öğretmen ve yönetici — herkes kendi ihtiyaçlarına özel bir panele sahip.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Student */}
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 text-white">
                <GraduationCap className="mb-3 h-8 w-8" />
                <h3 className="text-xl font-bold">Öğrenciler</h3>
                <p className="mt-1 text-sm text-white/80">Kendi eğitim yolculuğunu yönet</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["Ders programını görüntüle", "Günlük seri ve seviye takibi", "Haftalık hedef belirleme", "Katılım geçmişi", "Duyuruları takip et"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Teacher */}
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white">
                <BookOpen className="mb-3 h-8 w-8" />
                <h3 className="text-xl font-bold">Öğretmenler</h3>
                <p className="mt-1 text-sm text-white/80">Derslerini ve öğrencilerini yönet</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["Ders ve öğrenci listesi", "Bugünkü ders programı", "Öğrenci seri takibi", "Duyuru yayınlama", "Detaylı öğrenci profilleri"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Admin */}
            <div className="overflow-hidden rounded-2xl border bg-card">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
                <Shield className="mb-3 h-8 w-8" />
                <h3 className="text-xl font-bold">Yöneticiler</h3>
                <p className="mt-1 text-sm text-white/80">Tüm platformu kontrol et</p>
              </div>
              <div className="p-6">
                <ul className="space-y-3">
                  {["Kullanıcı ve rol yönetimi", "Ders oluşturma ve atama", "Haftalık program düzenleme", "İstatistik ve raporlar", "Sistem geneli duyurular"].map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-purple-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlight ── */}
      <section className="border-y bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">Motivasyon Sistemi</p>
              <h2 className="mb-6 text-3xl font-black sm:text-4xl">Öğrenmeyi alışkanlığa dönüştürün</h2>
              <p className="mb-8 text-muted-foreground leading-relaxed">
                Edunova&apos;nın gamifikasyon sistemi, öğrencilerin her gün derslerine katılmalarını
                teşvik eder. Günlük seri, seviye atlama ve haftalık hedefler ile öğrenciler
                motivasyonlarını yüksek tutar.
              </p>
              <div className="space-y-4">
                {[
                  { icon: Flame, title: "Günlük Seri", desc: "Her gün katılım ile seriyi uzatın" },
                  { icon: Sparkles, title: "Seviye Sistemi", desc: "Her 10 derste bir seviye atlayın" },
                  { icon: Target, title: "Haftalık Hedef", desc: "Kişiselleştirilmiş haftalık ders hedefleri" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-2.5">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative mx-auto max-w-sm lg:mx-0 lg:ml-auto">
              <div className="rounded-2xl border bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                  <h4 className="font-bold">İlerleme</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">Seviye 4</span>
                </div>
                <div className="mb-6 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-sm"><span>Günlük Seri</span><span className="font-bold text-orange-600">12 gün</span></div>
                    <div className="h-2 rounded-full bg-orange-100"><div className="h-full w-3/4 rounded-full bg-gradient-to-r from-orange-400 to-rose-400" /></div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm"><span>Haftalık Hedef</span><span className="font-bold text-primary">4/5</span></div>
                    <div className="h-2 rounded-full bg-secondary"><div className="h-full w-4/5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" /></div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-sm"><span>Seviye İlerlemesi</span><span className="font-bold text-purple-600">7/10</span></div>
                    <div className="h-2 rounded-full bg-purple-100"><div className="h-full w-[70%] rounded-full bg-gradient-to-r from-purple-400 to-indigo-400" /></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Toplam Katılım", value: "47", icon: BookOpen, color: "text-blue-600" },
                    { label: "Rekor Seri", value: "18", icon: Flame, color: "text-orange-600" },
                    { label: "Katılım Oranı", value: "%92", icon: TrendingUp, color: "text-emerald-600" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-muted/50 p-3 text-center">
                      <s.icon className={`mx-auto mb-1 h-4 w-4 ${s.color}`} />
                      <p className="text-lg font-black">{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack / Trust ── */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">Neden Edunova</p>
            <h2 className="mb-4 text-3xl font-black sm:text-4xl">Modern ve güvenilir altyapı</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Zap, title: "Hızlı", desc: "Next.js ile yıldırım hızında sayfa yüklemeleri" },
              { icon: Shield, title: "Güvenli", desc: "Şifreli kimlik doğrulama ve rol tabanlı erişim" },
              { icon: Layout, title: "Responsive", desc: "Masaüstü, tablet ve mobilde mükemmel görünüm" },
              { icon: Sparkles, title: "Modern UI", desc: "Temiz, sezgisel ve kullanıcı dostu arayüz" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border bg-card p-5 text-center">
                <item.icon className="mx-auto mb-3 h-7 w-7 text-primary" />
                <h4 className="mb-1 font-bold">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="sss" className="border-t bg-muted/30 py-20 lg:py-28">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center mb-12">
            <p className="mb-2 text-sm font-semibold text-primary uppercase tracking-wider">SSS</p>
            <h2 className="text-3xl font-black sm:text-4xl">Sıkça Sorulan Sorular</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "Edunova ücretsiz mi?", a: "Evet, Edunova tamamen ücretsiz bir eğitim yönetim platformudur. Kayıt olun ve hemen kullanmaya başlayın." },
              { q: "Kimler kullanabilir?", a: "Öğrenciler, öğretmenler ve eğitim kurumu yöneticileri. Her rol için özelleştirilmiş bir panel sunuyoruz." },
              { q: "Ders programımı nasıl görebilirim?", a: "Giriş yaptıktan sonra 'Ders Programı' bölümünden haftalık planınızı görüntüleyebilirsiniz. Bugünkü dersler ana sayfada da gösterilir." },
              { q: "Mobil cihazlarda çalışıyor mu?", a: "Evet, Edunova responsive tasarıma sahiptir. Telefon, tablet veya bilgisayardan sorunsuz erişebilirsiniz." },
              { q: "Öğrenci serisi (streak) nasıl çalışır?", a: "Her gün en az bir derse katılan öğrencilerin serisi artar. Seri devam ettikçe seviye atlama ve başarım kazanma imkanı sağlanır." },
              { q: "Yönetici olarak neler yapabilirim?", a: "Kullanıcı hesapları oluşturabilir, ders ve program yönetimi yapabilir, duyuru yayınlayabilir ve platform istatistiklerini görüntüleyebilirsiniz." },
            ].map((faq) => (
              <div key={faq.q} className="rounded-xl border bg-card p-5">
                <h4 className="mb-2 font-bold flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary shrink-0" />
                  {faq.q}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="gradient-hero py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Sparkles className="mx-auto mb-4 h-10 w-10 text-white/80" />
          <h2 className="mb-4 text-3xl font-black sm:text-4xl">
            Eğitim yolculuğunuza bugün başlayın
          </h2>
          <p className="mb-8 text-lg text-white/80 max-w-xl mx-auto">
            Ücretsiz hesap oluşturun, derslerinizi organize edin ve
            öğrencilerinizin ilerlemesini takip etmeye başlayın.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/kayit">
              <Button size="lg" variant="secondary" className="w-full gap-2 px-8 text-base font-bold shadow-lg sm:w-auto">
                Ücretsiz Kayıt Ol <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/giris">
              <Button size="lg" variant="ghost" className="w-full px-8 text-base font-bold text-white hover:text-white hover:bg-white/10 sm:w-auto">
                Giriş Yap
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t bg-background py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2">
                <Image src="/logo.png" alt="Edunova" width={32} height={32} className="h-8 w-8 object-contain" />
                <span className="text-lg font-extrabold text-gradient">Edunova</span>
              </Link>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-xs">
                Öğrenci, öğretmen ve yöneticiler için modern eğitim yönetim platformu.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="mb-3 text-sm font-bold">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#ozellikler" className="hover:text-foreground transition-colors">Özellikler</a></li>
                <li><a href="#nasil-calisir" className="hover:text-foreground transition-colors">Nasıl Çalışır</a></li>
                <li><a href="#roller" className="hover:text-foreground transition-colors">Kimler İçin</a></li>
                <li><a href="#sss" className="hover:text-foreground transition-colors">SSS</a></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="mb-3 text-sm font-bold">Hesap</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/giris" className="hover:text-foreground transition-colors">Giriş Yap</Link></li>
                <li><Link href="/kayit" className="hover:text-foreground transition-colors">Kayıt Ol</Link></li>
              </ul>
            </div>

            {/* Tech */}
            <div>
              <h4 className="mb-3 text-sm font-bold">Teknoloji</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Next.js 14</li>
                <li>PostgreSQL</li>
                <li>Prisma ORM</li>
                <li>Tailwind CSS</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row">
            <p className="text-xs text-muted-foreground">&copy; 2026 Edunova. Tüm hakları saklıdır.</p>
            <p className="text-xs text-muted-foreground">
              Türkiye&apos;de tasarlandı ve geliştirildi.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
