import type { Metadata } from "next";

import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireRole } from "@/server/auth/dal";

export const metadata: Metadata = {
  title: "Trainer",
};

export default async function TrainerDashboardPage() {
  await requireRole("TRAINER");

  return (
    <div>
      <PageHeading
        title="Trainer dashboard"
        description="Placeholder area. Your assigned trainings will appear here."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Trainers will see their schedule and registered players here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
