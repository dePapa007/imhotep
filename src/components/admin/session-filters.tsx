"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";

interface Option {
  id: string;
  name: string;
}

export function SessionFilters({
  categories,
  trainers,
}: {
  categories: Option[];
  trainers: Option[];
}) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const trainer = searchParams.get("trainer") ?? "";
  const status = searchParams.get("status") ?? "";

  const statusOptions = useMemo(
    () => [
      { label: t("common.allStatuses"), value: "" },
      { label: t("admin.statusScheduled"), value: "SCHEDULED" },
      { label: t("admin.statusCancelled"), value: "CANCELLED" },
      { label: t("admin.statusCompleted"), value: "COMPLETED" },
    ],
    [t],
  );

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`);
  }

  const categoryOptions = [
    { label: t("forms.allCategories"), value: "" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const trainerOptions = [
    { label: t("forms.allTrainers"), value: "" },
    ...trainers.map((tr) => ({ label: tr.name, value: tr.id })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <Select
        options={categoryOptions}
        value={category}
        onChange={(event) => updateParam("category", event.target.value)}
        aria-label={t("common.filterByCategory")}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          options={trainerOptions}
          value={trainer}
          onChange={(event) => updateParam("trainer", event.target.value)}
          aria-label={t("common.filterByTrainer")}
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(event) => updateParam("status", event.target.value)}
          aria-label={t("common.filterBySessionStatus")}
        />
      </div>
    </div>
  );
}
