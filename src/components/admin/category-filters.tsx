"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";

export function CategoryFilters() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const status = searchParams.get("status") ?? "";

  const statusOptions = useMemo(
    () => [
      { label: t("common.allStatuses"), value: "" },
      { label: t("common.active"), value: "active" },
      { label: t("common.archived"), value: "archived" },
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
        placeholder={t("forms.searchNameDesc")}
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label={t("common.search")}
      />
      <Select
        options={statusOptions}
        value={status}
        onChange={(event) => updateParam("status", event.target.value)}
        aria-label={t("common.filterByStatus")}
      />
    </div>
  );
}
