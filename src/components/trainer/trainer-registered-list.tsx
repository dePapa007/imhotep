import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { TrainerSessionDetail } from "@/server/trainer/queries";

export function TrainerRegisteredList({
  session,
  locale,
}: {
  session: TrainerSessionDetail;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const capacitySuffix = session.capacity ? ` / ${session.capacity}` : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {t("admin.registeredMembers", {
            count: session.registrations.length,
            capacity: capacitySuffix,
          })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session.registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.noMembersRegistered")}
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
                    {registration.user.category?.name ?? t("common.noCategory")}
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
