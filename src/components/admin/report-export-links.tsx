import { buttonClasses } from "@/components/ui/button";
import type { ReportRangeType } from "@/lib/report-range";

const exports = [
  { label: "Export trainings", href: "/api/admin/export/trainings" },
  { label: "Export users", href: "/api/admin/export/users" },
  { label: "Export attendance", href: "/api/admin/export/attendance" },
] as const;

export function ReportExportLinks({ range }: { range: ReportRangeType }) {
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
