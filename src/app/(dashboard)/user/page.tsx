import type { Metadata } from "next";

import { PageHeading } from "@/components/layout/page-heading";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "My trainings",
};

export default function UserDashboardPage() {
  return (
    <div>
      <PageHeading
        title="My trainings"
        description="Placeholder area. Eligible trainings will appear here."
      />
      <Card>
        <CardHeader>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            You will be able to browse and register for trainings here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
