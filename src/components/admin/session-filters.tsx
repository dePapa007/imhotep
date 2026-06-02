"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Select } from "@/components/ui/select";

interface Option {
  id: string;
  name: string;
}

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Cancelled", value: "CANCELLED" },
  { label: "Completed", value: "COMPLETED" },
];

export function SessionFilters({
  categories,
  trainers,
}: {
  categories: Option[];
  trainers: Option[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const category = searchParams.get("category") ?? "";
  const trainer = searchParams.get("trainer") ?? "";
  const status = searchParams.get("status") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`);
  }

  const categoryOptions = [
    { label: "All categories", value: "" },
    ...categories.map((c) => ({ label: c.name, value: c.id })),
  ];

  const trainerOptions = [
    { label: "All trainers", value: "" },
    ...trainers.map((t) => ({ label: t.name, value: t.id })),
  ];

  return (
    <div className="flex flex-col gap-3">
      <Select
        options={categoryOptions}
        value={category}
        onChange={(event) => updateParam("category", event.target.value)}
        aria-label="Filter by category"
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          options={trainerOptions}
          value={trainer}
          onChange={(event) => updateParam("trainer", event.target.value)}
          aria-label="Filter by trainer"
        />
        <Select
          options={statusOptions}
          value={status}
          onChange={(event) => updateParam("status", event.target.value)}
          aria-label="Filter by status"
        />
      </div>
    </div>
  );
}
