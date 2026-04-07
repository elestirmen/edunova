"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Save,
  Search,
  Shield,
  UserPlus,
  X,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn, getRoleLabel } from "@/lib/utils";

type AdminRole = "STUDENT" | "TEACHER" | "ADMIN";

interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  phone: string | null;
  bio: string | null;
  createdAt: string;
  enrollmentCount: number;
  teachingCourseCount: number;
}

interface UserFormState {
  firstName: string;
  lastName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  phone: string;
  bio: string;
  password: string;
}

interface AdminUsersManagerProps {
  users: AdminUser[];
}

const selectClassName =
  "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

const emptyCreateForm: UserFormState = {
  firstName: "",
  lastName: "",
  email: "",
  role: "STUDENT",
  isActive: true,
  phone: "",
  bio: "",
  password: "",
};

function getUserDraft(user: AdminUser): UserFormState {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    phone: user.phone ?? "",
    bio: user.bio ?? "",
    password: "",
  };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function getRoleBadgeVariant(role: AdminRole) {
  if (role === "ADMIN") return "default";
  if (role === "TEACHER") return "secondary";
  return "outline";
}

export function AdminUsersManager({ users }: AdminUsersManagerProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | AdminRole>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PASSIVE">("ALL");
  const [createForm, setCreateForm] = useState<UserFormState>(emptyCreateForm);
  const [drafts, setDrafts] = useState<Record<string, UserFormState>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setDrafts(Object.fromEntries(users.map((user) => [user.id, getUserDraft(user)])));
  }, [users]);

  useEffect(() => {
    if (notice) {
      const timer = setTimeout(() => setNotice(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notice]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      search.trim().length === 0 ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" ? user.isActive : !user.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  async function submitJson(url: string, method: "POST" | "PATCH", body: unknown) {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) throw new Error(result?.error ?? "İşlem başarısız oldu");
    return result;
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreating(true);
    setNotice(null);
    try {
      await submitJson("/api/admin/users", "POST", createForm);
      setCreateForm(emptyCreateForm);
      setShowCreateForm(false);
      setNotice({ type: "success", message: "Yeni kullanıcı başarıyla oluşturuldu." });
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Kullanıcı oluşturulamadı.") });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSaveUser(userId: string) {
    const draft = drafts[userId];
    if (!draft) return;
    setSavingUserId(userId);
    setNotice(null);
    try {
      await submitJson(`/api/admin/users/${userId}`, "PATCH", draft);
      setNotice({ type: "success", message: "Kullanıcı bilgileri güncellendi." });
      setExpandedUserId(null);
      router.refresh();
    } catch (error) {
      setNotice({ type: "error", message: getApiErrorMessage(error, "Kullanıcı güncellenemedi.") });
    } finally {
      setSavingUserId(null);
    }
  }

  function updateDraft<K extends keyof UserFormState>(userId: string, field: K, value: UserFormState[K]) {
    setDrafts((current) => ({
      ...current,
      [userId]: { ...current[userId], [field]: value },
    }));
  }

  const totalStudents = users.filter((u) => u.role === "STUDENT").length;
  const totalTeachers = users.filter((u) => u.role === "TEACHER").length;
  const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
        <MiniStat label="Toplam" value={users.length} />
        <MiniStat label="Öğrenci" value={totalStudents} />
        <MiniStat label="Öğretmen" value={totalTeachers} />
        <MiniStat label="Pasif" value={inactiveUsers} sub={`${totalAdmins} yönetici`} />
      </div>

      {/* Notice */}
      {notice && (
        <div
          className={cn(
            "flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm",
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          )}
        >
          {notice.message}
          <button onClick={() => setNotice(null)} className="ml-2 shrink-0 rounded p-0.5 hover:bg-black/5">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-9 text-sm" placeholder="Ad veya e-posta ile ara..." />
        </div>
        <select className={cn(selectClassName, "w-auto min-w-[140px]")} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "ALL" | AdminRole)}>
          <option value="ALL">Tüm roller</option>
          <option value="STUDENT">Öğrenciler</option>
          <option value="TEACHER">Öğretmenler</option>
          <option value="ADMIN">Yöneticiler</option>
        </select>
        <select className={cn(selectClassName, "w-auto min-w-[140px]")} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as "ALL" | "ACTIVE" | "PASSIVE")}>
          <option value="ALL">Tüm durumlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="PASSIVE">Pasif</option>
        </select>
        <Button size="sm" className="gap-1.5 h-9" onClick={() => setShowCreateForm(!showCreateForm)}>
          <UserPlus className="h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Create Form (collapsible) */}
      {showCreateForm && (
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Yeni Kullanıcı Oluştur</CardTitle>
              </div>
              <button onClick={() => setShowCreateForm(false)} className="rounded-lg p-1 hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>
            <CardDescription>Öğrenci, öğretmen veya yönetici hesabı oluşturun.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateUser}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Field label="Ad">
                  <Input value={createForm.firstName} onChange={(e) => setCreateForm((c) => ({ ...c, firstName: e.target.value }))} placeholder="Ayşe" className="h-9" />
                </Field>
                <Field label="Soyad">
                  <Input value={createForm.lastName} onChange={(e) => setCreateForm((c) => ({ ...c, lastName: e.target.value }))} placeholder="Yılmaz" className="h-9" />
                </Field>
                <Field label="E-posta">
                  <Input type="email" value={createForm.email} onChange={(e) => setCreateForm((c) => ({ ...c, email: e.target.value }))} placeholder="kullanici@edunova.com" className="h-9" />
                </Field>
                <Field label="Rol">
                  <select className={selectClassName} value={createForm.role} onChange={(e) => setCreateForm((c) => ({ ...c, role: e.target.value as AdminRole }))}>
                    <option value="STUDENT">Öğrenci</option>
                    <option value="TEACHER">Öğretmen</option>
                    <option value="ADMIN">Yönetici</option>
                  </select>
                </Field>
                <Field label="Geçici Şifre">
                  <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((c) => ({ ...c, password: e.target.value }))} placeholder="En az 6 karakter" className="h-9" />
                </Field>
                <Field label="Telefon">
                  <Input value={createForm.phone} onChange={(e) => setCreateForm((c) => ({ ...c, phone: e.target.value }))} placeholder="05XX XXX XX XX" className="h-9" />
                </Field>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={createForm.isActive} onChange={(e) => setCreateForm((c) => ({ ...c, isActive: e.target.checked }))} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                  Hesap aktif olsun
                </label>
                <Button type="submit" size="sm" className="gap-1.5" isLoading={isCreating}>
                  <UserPlus className="h-4 w-4" />
                  Oluştur
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* User List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Kullanıcılar</CardTitle>
            <Badge variant="outline" className="font-normal">{filteredUsers.length} / {users.length}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Filtrelere uyan kullanıcı bulunamadı.
            </div>
          ) : (
            <div className="divide-y">
              {filteredUsers.map((user) => {
                const isExpanded = expandedUserId === user.id;
                const draft = drafts[user.id];

                return (
                  <div key={user.id} className={cn("transition-colors", isExpanded && "bg-muted/30")}>
                    {/* Compact Row */}
                    <button
                      type="button"
                      onClick={() => setExpandedUserId(isExpanded ? null : user.id)}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/40 sm:px-6"
                    >
                      <Avatar firstName={user.firstName} lastName={user.lastName} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-sm font-medium">{user.firstName} {user.lastName}</span>
                          <Badge variant={getRoleBadgeVariant(user.role)} className="text-[10px] px-1.5 py-0">
                            {getRoleLabel(user.role)}
                          </Badge>
                          {!user.isActive && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Pasif</Badge>}
                        </div>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-4 text-xs text-muted-foreground">
                        <span>
                          {user.role === "STUDENT"
                            ? `${user.enrollmentCount} ders`
                            : user.role === "TEACHER"
                              ? `${user.teachingCourseCount} ders`
                              : "Yönetici"}
                        </span>
                        <span>{new Date(user.createdAt).toLocaleDateString("tr-TR")}</span>
                      </div>
                      <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                    </button>

                    {/* Expanded Edit Form */}
                    {isExpanded && draft && (
                      <div className="border-t bg-muted/20 px-4 py-4 sm:px-6">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          <Field label="Ad">
                            <Input value={draft.firstName} onChange={(e) => updateDraft(user.id, "firstName", e.target.value)} className="h-9" />
                          </Field>
                          <Field label="Soyad">
                            <Input value={draft.lastName} onChange={(e) => updateDraft(user.id, "lastName", e.target.value)} className="h-9" />
                          </Field>
                          <Field label="E-posta">
                            <Input type="email" value={draft.email} onChange={(e) => updateDraft(user.id, "email", e.target.value)} className="h-9" />
                          </Field>
                          <Field label="Telefon">
                            <Input value={draft.phone} onChange={(e) => updateDraft(user.id, "phone", e.target.value)} placeholder="Telefon bilgisi" className="h-9" />
                          </Field>
                          <Field label="Rol">
                            <select className={selectClassName} value={draft.role} onChange={(e) => updateDraft(user.id, "role", e.target.value as AdminRole)}>
                              <option value="STUDENT">Öğrenci</option>
                              <option value="TEACHER">Öğretmen</option>
                              <option value="ADMIN">Yönetici</option>
                            </select>
                          </Field>
                          <Field label="Yeni Şifre">
                            <Input type="password" value={draft.password} onChange={(e) => updateDraft(user.id, "password", e.target.value)} placeholder="Boş bırakırsanız değişmez" className="h-9" />
                          </Field>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <Field label="Bio / Not">
                              <Textarea value={draft.bio} onChange={(e) => updateDraft(user.id, "bio", e.target.value)} rows={2} className="min-h-0" />
                            </Field>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={draft.isActive} onChange={(e) => updateDraft(user.id, "isActive", e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
                            Giriş izni aktif
                          </label>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setExpandedUserId(null)}>
                              İptal
                            </Button>
                            <Button size="sm" className="gap-1.5" onClick={() => handleSaveUser(user.id)} isLoading={savingUserId === user.id}>
                              <Save className="h-3.5 w-3.5" />
                              Kaydet
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info */}
      <div className="flex items-start gap-2 rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
        <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <p>
          Bir öğretmenin üzerinde ders varken rolü değiştirilemez. Kendi yönetici
          hesabınızı pasife alamaz veya yönetici dışına çıkaramazsınız.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
      {sub && <p className="mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
