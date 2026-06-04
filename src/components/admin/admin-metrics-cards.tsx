import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DashboardMetrics } from "@/server/reports/queries";

export function AdminMetricsCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    { label: "Sessions", value: metrics.sessionCount },
    { label: "Registrations", value: metrics.registrationCount },
    {
      label: "Attendance rate",
      value:
        metrics.attendanceRate !== null
          ? `${metrics.attendanceRate}%`
          : "—",
    },
    { label: "Active members", value: metrics.activeParticipants },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="items-center text-center">
            <CardTitle className="text-2xl">{stat.value}</CardTitle>
            <CardDescription>{stat.label}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
