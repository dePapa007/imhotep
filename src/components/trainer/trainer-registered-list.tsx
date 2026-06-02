import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TrainerSessionDetail } from "@/server/trainer/queries";

export function TrainerRegisteredList({
  session,
}: {
  session: TrainerSessionDetail;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Registered members ({session.registrations.length}
          {session.capacity ? ` / ${session.capacity}` : ""})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No members registered yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {session.registrations.map((registration) => (
              <li
                key={registration.id}
                className="flex items-start justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {registration.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {registration.user.category?.name ?? "No category"}
                  </p>
                </div>
                <Badge variant="success">{registration.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
