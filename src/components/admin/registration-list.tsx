import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { removeRegistration } from "@/server/trainings/actions";
import type { SessionWithRegistrations } from "@/server/trainings/queries";

export function RegistrationList({
  session,
}: {
  session: SessionWithRegistrations;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Registrations ({session.registrations.length}
          {session.capacity ? ` / ${session.capacity}` : ""})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No registrations yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {session.registrations.map((registration) => (
              <li
                key={registration.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    {registration.user.name}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {registration.user.email}
                  </p>
                </div>
                <form
                  action={removeRegistration.bind(
                    null,
                    session.id,
                    registration.userId,
                  )}
                >
                  <Button type="submit" variant="outline" size="sm">
                    Remove
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
