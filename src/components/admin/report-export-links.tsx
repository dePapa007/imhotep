import { buttonClasses } from "@/components/ui/button";
import { createTranslator } from "@/i18n/get-messages";
import type { Locale } from "@/i18n/locales";
import type { ReportRangeType } from "@/lib/report-range";

export function ReportExportLinks({
  range,
  locale,
}: {
  range: ReportRangeType;
  locale: Locale;
}) {
  const t = createTranslator(locale);
  const exports = [
    { label: t("admin.exportTrainings"), href: "/api/admin/export/trainings" },
    { label: t("admin.exportUsers"), href: "/api/admin/export/users" },
    { label: t("admin.exportAttendance"), href: "/api/admin/export/attendance" },
  ] as const;
  const query = range === "month" ? "" : `?range=${range}`;

  return (
    <div className="flex flex-col gap-2">
      {exports.map(({ label, href }) => (
        <a
          key={href}
          href={`${href}${query}`}
          className={buttonClasses({ variant: "outline" })}
          download
        >
          {label}
        </a>
      ))}
    </div>
  );
}
