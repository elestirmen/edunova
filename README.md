# Edunova — Eğitim Platformu

Edunova, öğrencilerin organize, motive ve kontrol altında hissetmelerini sağlayan modern bir eğitim platformudur.

## Hızlı Başlangıç

### Gereksinimler
- Node.js 18+
- PostgreSQL 14+
- npm

### Kurulum

```bash
# Bağımlılıkları yükle
npm install

# .env dosyasını oluştur
cp .env.example .env
# DATABASE_URL ve NEXTAUTH_SECRET değerlerini düzenle

# Prisma client oluştur
npm run db:generate

# Veritabanı tablolarını oluştur
npm run db:push

# Demo verilerini yükle
npm run db:seed

# Geliştirme sunucusunu başlat
npm run dev
```

### Demo Hesaplar

| Rol | E-posta | Şifre |
|-----|---------|-------|
| Öğrenci | ogrenci@edunova.com | 123456 |
| Öğretmen | ogretmen@edunova.com | 123456 |
| Yönetici | admin@edunova.com | 123456 |

## Tasarım Sistemi

Arayüz, logodaki mürekkep mavisi → turkuaz → yaprak yeşili geçişinden türetilen tek bir
belirteç (token) katmanı üzerine kuruludur.

- **Renk belirteçleri:** `src/app/globals.css` içinde açık/koyu tema için HSL değişkenleri
  (`--primary`, `--card`, `--border`, `--shadow-color` …). Marka skalaları
  (`brand`, `ocean`, `leaf`) `tailwind.config.ts` içinde tanımlıdır; doğrudan renk kodu
  yazmak yerine bu belirteçler kullanılır.
- **Tipografi:** Geist değişken yazı tipi `next/font/local` ile yerelden yüklenir
  (ağ bağımlılığı yok). Finansal değerler `.tabular` sınıfıyla hizalanır.
- **Yükseklik ve hareket:** Marka tonuna boyanmış gölge skalası (`shadow-xs … shadow-xl`,
  `shadow-glow`) ve `ease-premium` geçiş eğrisi. `prefers-reduced-motion` desteklenir.
- **Ortak bileşenler:** `src/components/ui/` — `Button`, `Card`, `Badge`, `Input`,
  `Textarea`, `Select`, `Avatar`, `Progress`, `StatCard`, `SectionHeader`, `EmptyState`,
  `Skeleton`, `WeeklyCalendar`. Yeni ekranlarda önce bu bileşenler kullanılmalıdır.
- **Panel çatısı:** `DashboardShell` (yapışkan cam başlık + `eyebrow`/başlık/açıklama),
  `Sidebar`, `PanelSkeleton`, `PanelError`.
- **Tema:** Koyu tema `<html class="dark">` ile çalışır; hidrasyondan önce çalışan küçük
  bir betik sayesinde açılışta tema titremesi olmaz.

## Teknoloji Stack

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Veritabanı:** PostgreSQL + Prisma ORM
- **Auth:** NextAuth.js (Credentials)
- **Stil:** Tailwind CSS
- **Validation:** Zod
- **Icons:** Lucide React

## Proje Yapısı

```
src/
├── app/
│   ├── (auth)/          # Giriş / Kayıt sayfaları
│   ├── api/             # API routes
│   └── panel/
│       ├── ogrenci/     # Öğrenci paneli
│       ├── ogretmen/    # Öğretmen paneli
│       └── yonetici/    # Yönetici paneli
├── components/
│   ├── layout/          # Sidebar, DashboardShell
│   └── ui/              # Button, Card, Input, Badge...
├── lib/                 # DB, Auth, Utils, Validations
└── types/               # TypeScript type augmentations
```

## Sayfa Haritası

### Genel
- `/` — Landing page
- `/giris` — Giriş
- `/kayit` — Kayıt

### Öğrenci (`/panel/ogrenci/`)
- Ana Sayfa — Motivasyon widget'ları, günün odağı, seri takibi
- Ders Programı — Haftalık program görünümü
- Derslerim — Kayıtlı dersler
- İlerleme — Seri, katılım, kilometre taşları
- Hedeflerim — Haftalık hedefler
- Duyurular — Ders ve genel duyurular
- Profil — Hesap bilgileri

### Öğretmen (`/panel/ogretmen/`)
- Ana Sayfa — Ders ve öğrenci istatistikleri
- Ders Programı — Haftalık ders saatleri
- Derslerim — Verdiği dersler
- Öğrencilerim — Tüm öğrenciler
- Duyurular
- Profil

### Yönetici (`/panel/yonetici/`)
- Ana Sayfa — Sistem genel bakış
- Kullanıcılar — Tüm kullanıcı yönetimi
- Dersler — Ders yönetimi
- Ders Programı — Tüm program
- Duyurular — Genel duyuru yönetimi
- İstatistikler — Sistem metrikleri
- Ayarlar
