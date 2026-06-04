import { AppLogo } from "@/components/layout/app-logo";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProfileHeaderLink } from "@/components/layout/profile-header-link";
import { SkipLink } from "@/components/layout/skip-link";
import { LocaleProvider } from "@/i18n/locale-provider";
import { createTranslator } from "@/i18n/get-messages";
import { roleHome } from "@/lib/roles";
import { requireUser } from "@/server/auth/dal";
import type { NavItem, Role } from "@/types";

function navItems(role: Role, t: ReturnType<typeof createTranslator>): NavItem[] {
  switch (role) {
    case "ADMIN":
      return [
        { label: t("nav.home"), href: "/admin" },
        { label: t("nav.users"), href: "/admin/users" },
        { label: t("nav.trainers"), href: "/admin/trainers" },
        { label: t("nav.categories"), href: "/admin/categories" },
        { label: t("nav.sessions"), href: "/admin/trainings" },
      ];
    case "TRAINER":
      return [
        { label: t("nav.home"), href: "/trainer" },
        { label: t("nav.schedule"), href: "/trainer/schedule" },
      ];
    case "USER":
      return [
        { label: t("nav.home"), href: "/user" },
        { label: t("nav.browse"), href: "/user/browse" },
        { label: t("nav.myTrainings"), href: "/user/my-trainings" },
      ];
  }
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const t = createTranslator(user.preferredLocale);

  return (
    <LocaleProvider locale={user.preferredLocale}>
      <div className="flex min-h-dvh flex-col">
        <SkipLink label={t("nav.skipToContent")} />
        <header className="border-border bg-card sticky top-0 z-40 border-b">
          <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-3">
            <AppLogo href={roleHome(user.role)} size="sm" priority />
            <ProfileHeaderLink
              name={user.name}
              role={user.role}
              roleLabel={t(`roles.${user.role}`)}
              ariaLabel={t("profile.openProfile")}
            />
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto w-full max-w-md flex-1 px-5 pt-6 pb-24"
        >
          {children}
        </main>

        <BottomNav
          items={navItems(user.role, t)}
          ariaLabel={t("nav.mainNavigation")}
        />
      </div>
    </LocaleProvider>
  );
}
