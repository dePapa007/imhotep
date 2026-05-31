import Link from "next/link";

import { BottomNav } from "@/components/layout/bottom-nav";
import type { NavItem } from "@/types";

// Placeholder navigation. In Epic 2 this will be derived from the
// authenticated user's role instead of showing every area at once.
const navItems: NavItem[] = [
  { label: "Admin", href: "/admin" },
  { label: "Trainer", href: "/trainer" },
  { label: "User", href: "/user" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-border bg-card sticky top-0 z-40 border-b">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-5 py-3">
          <Link href="/" className="font-semibold tracking-tight">
            Soccer Academy
          </Link>
          <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-medium">
            Dashboard
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-md flex-1 px-5 py-6">
        {children}
      </main>

      <BottomNav items={navItems} />
    </div>
  );
}
