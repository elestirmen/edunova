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
