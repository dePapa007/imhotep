"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { CategoryOption } from "@/server/users/queries";
import type { UserFormState } from "@/lib/validators/user";

type Role = "ADMIN" | "TRAINER" | "USER";

const roleOptions = [
  { label: "Member", value: "USER" },
  { label: "Trainer", value: "TRAINER" },
  { label: "Admin", value: "ADMIN" },
];

export interface UserFormDefaults {
  name?: string;
  email?: string;
  role?: Role;
  categoryId?: string | null;
  active?: boolean;
}

interface UserFormProps {
  action: (
    prevState: UserFormState,
    formData: FormData,
  ) => Promise<UserFormState>;
  categories: CategoryOption[];
  mode: "create" | "edit";
  defaults?: UserFormDefaults;
}

const initialState: UserFormState = {};

export function UserForm({
  action,
  categories,
  mode,
  defaults,
}: UserFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Name"
        name="name"
        type="text"
        autoComplete="name"
        required
        defaultValue={defaults?.name}
        error={state.fieldErrors?.name?.[0]}
      />
      <Input
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={defaults?.email}
        error={state.fieldErrors?.email?.[0]}
      />
      <Select
        label="Role"
        name="role"
        options={roleOptions}
        defaultValue={defaults?.role ?? "USER"}
        error={state.fieldErrors?.role?.[0]}
      />
      <Select
        label="Category"
        name="categoryId"
        options={categoryOptions}
        placeholder="No category"
        defaultValue={defaults?.categoryId ?? ""}
        error={state.fieldErrors?.categoryId?.[0]}
      />
      <Input
        label={mode === "create" ? "Set password" : "New password (optional)"}
        name="password"
        type="password"
        autoComplete="new-password"
        required={mode === "create"}
        placeholder={mode === "edit" ? "Leave blank to keep current" : undefined}
        error={state.fieldErrors?.password?.[0]}
      />
      {mode === "edit" ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="h-4 w-4 rounded border-input"
          />
          Account active
        </label>
      ) : null}
      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create user"
            : "Save changes"}
      </Button>
    </form>
  );
}
