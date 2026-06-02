"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const roleOptions = [
  { label: "All roles", value: "" },
  { label: "Admin", value: "ADMIN" },
  { label: "Trainer", value: "TRAINER" },
  { label: "Member", value: "USER" },
];

const statusOptions = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export function UserFilters({ lockRole = false }: { lockRole?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const role = searchParams.get("role") ?? "";
  const status = searchParams.get("status") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`?${params.toString()}`);
  }

  // Debounce search updates to the URL.
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
        placeholder="Search by name or email"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        aria-label="Search users"
      />
      <div className="grid grid-cols-2 gap-3">
        {!lockRole ? (
          <Select
            options={roleOptions}
            value={role}
            onChange={(event) => updateParam("role", event.target.value)}
            aria-label="Filter by role"
          />
        ) : null}
        <Select
          options={statusOptions}
          value={status}
          onChange={(event) => updateParam("status", event.target.value)}
          aria-label="Filter by status"
          className={lockRole ? "col-span-2" : undefined}
        />
      </div>
    </div>
  );
}
