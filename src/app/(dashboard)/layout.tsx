import { AppLogo } from "@/components/layout/app-logo";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Button } from "@/components/ui/button";
import { roleHome } from "@/lib/roles";
import { logout } from "@/server/auth/actions";
import { requireUser } from "@/server/auth/dal";
import type { NavItem, Role } from "@/types";

const navByRole: Record<Role, NavItem[]> = {
  ADMIN: [
    { label: "Home", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Trainers", href: "/admin/trainers" },
    { label: "Categories", href: "/admin/categories" },
    { label: "Trainings", href: "/admin/trainings" },
  ],
  TRAINER: [
    { label: "Home", href: "/trainer" },
    { label: "Schedule", href: "/trainer/schedule" },
  ],
  USER: [
    { label: "Home", href: "/user" },
    { label: "Browse", href: "/user/browse" },
    { label: "My trainings", href: "/user/my-trainings" },
  ],
};

const roleLabel: Record<Role, string> = {
  ADMIN: "Admin",
  TRAINER: "Trainer",
  USER: "Member",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border bg-card sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-3">
          <AppLogo href={roleHome(user.role)} size="sm" priority />
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end leading-tight">
              <span className="text-sm font-medium">{user.name}</span>
              <span className="text-muted-foreground text-xs">
                {roleLabel[user.role]}
              </span>
            </div>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                Log out
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
        {children}
      </main>

      <BottomNav items={navByRole[user.role]} />
    </div>
  );
}
