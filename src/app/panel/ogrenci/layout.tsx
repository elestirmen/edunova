import { requireAuth } from "@/lib/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth(["STUDENT"]);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={session.user.role}
        firstName={session.user.firstName}
        lastName={session.user.lastName}
        email={session.user.email}
      />
      {children}
    </div>
  );
}
