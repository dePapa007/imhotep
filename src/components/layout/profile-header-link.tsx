import Link from "next/link";

import { roleProfile } from "@/lib/roles";
import type { Role } from "@prisma/client";

export function ProfileHeaderLink({
  name,
  role,
  roleLabel,
  ariaLabel,
}: {
  name: string;
  role: Role;
  roleLabel: string;
  ariaLabel: string;
}) {
  return (
    <Link
      href={roleProfile(role)}
      aria-label={ariaLabel}
      className="focus-visible:ring-ring flex flex-col items-end leading-tight rounded-sm focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="text-sm font-medium">{name}</span>
      <span className="text-muted-foreground text-xs">{roleLabel}</span>
    </Link>
  );
}
