"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";

export function UserFilters({ lockRole = false }: { lockRole?: boolean }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  const roleOptions = useMemo(
    () => [
      { label: t("common.allRoles"), value: "" },
      { label: t("roles.ADMIN"), value: "ADMIN" },
      { label: t("roles.TRAINER"), value: "TRAINER" },
      { label: t("roles.USER"), value: "USER" },
    ],
    [t],
  );

  const statusOptions = useMemo(
    () => [
      { label: t("common.allStatuses"), value: "" },
      { label: t("common.active"), value: "active" },
      { label: t("common.inactive"), value: "inactive" },
    ],
    [t],
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`);
  }

  useEffect(() => {
    const current = searchParams.get("search") ?? "";
    if (search === current) return;
    const timer = setTimeout(() => updateParam("search", search), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="flex flex-col gap-3">
      <Input
        type="search"
        placeholder={t("forms.searchNameEmail")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label={t("common.search")}
      />
      <div className="grid grid-cols-2 gap-3">
        {!lockRole ? (
          <Select
            options={roleOptions}
            value={role}
            onChange={(event) => updateParam("role", event.target.value)}
            aria-label={t("common.filterByRole")}
          />
        ) : null}
        <Select
          options={statusOptions}
          value={status}
          onChange={(event) => updateParam("status", event.target.value)}
          aria-label={t("common.filterByStatus")}
          className={lockRole ? "col-span-2" : undefined}
        />
      </div>
    </div>
  );
}
