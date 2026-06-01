import type { Metadata } from "next";

import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Admin",
};

// Force dynamic rendering so the live database counts are queried on request.
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");

  const [users, categories, sessions] = await Promise.all([
    prisma.user.count(),
    prisma.category.count(),
    prisma.trainingSession.count(),
  ]);

  const stats = [
    { label: "Users", value: users },
    { label: "Categories", value: categories },
    { label: "Sessions", value: sessions },
  ];

  return (
    <div>
      <PageHeading
        title="Admin dashboard"
        description="Placeholder area. Full controls arrive in later epics."
      />

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="items-center text-center">
              <CardTitle className="text-2xl">{stat.value}</CardTitle>
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      <p className="text-muted-foreground mt-4 text-sm">
        These counts are read live from PostgreSQL via Prisma, confirming the
        database connection works.
      </p>
    </div>
  );
}
