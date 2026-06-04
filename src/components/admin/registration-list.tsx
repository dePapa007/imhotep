import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import { removeRegistration } from "@/server/trainings/actions";
import type { SessionWithRegistrations } from "@/server/trainings/queries";

export function RegistrationList({
  session,
  locale,
}: {
  session: SessionWithRegistrations;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const capacitySuffix = session.capacity ? ` / ${session.capacity}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("admin.registrationsTitle", {
            count: session.registrations.length,
            capacity: capacitySuffix,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.noRegistrationsYet")}
          </p>
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
                    {t("common.remove")}
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
