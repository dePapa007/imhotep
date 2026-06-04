"use client";

import { useActionState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";
import type { CategoryOption } from "@/server/users/queries";
import type { UserFormState } from "@/lib/validators/user";

type Role = "ADMIN" | "TRAINER" | "USER";

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
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, initialState);

  const roleOptions = useMemo(
    () => [
      { label: t("roles.USER"), value: "USER" },
      { label: t("roles.TRAINER"), value: "TRAINER" },
      { label: t("roles.ADMIN"), value: "ADMIN" },
    ],
    [t],
  );

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={t("forms.name")}
        name="name"
        type="text"
        autoComplete="name"
        required
        defaultValue={defaults?.name}
        error={state.fieldErrors?.name?.[0]}
      />
      <Input
        label={t("forms.email")}
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={defaults?.email}
        error={state.fieldErrors?.email?.[0]}
      />
      <Select
        label={t("forms.role")}
        name="role"
        options={roleOptions}
        defaultValue={defaults?.role ?? "USER"}
        error={state.fieldErrors?.role?.[0]}
      />
      <Select
        label={t("forms.category")}
        name="categoryId"
        options={categoryOptions}
        placeholder={t("common.noCategory")}
        defaultValue={defaults?.categoryId ?? ""}
        error={state.fieldErrors?.categoryId?.[0]}
      />
      <Input
        label={
          mode === "create"
            ? t("forms.setPassword")
            : t("forms.newPasswordOptional")
        }
        name="password"
        type="password"
        autoComplete="new-password"
        required={mode === "create"}
        placeholder={
          mode === "edit" ? t("forms.passwordKeepBlank") : undefined
        }
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
          {t("forms.accountActive")}
        </label>
      ) : null}
      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? t("common.saving")
          : mode === "create"
            ? t("forms.createUser")
            : t("forms.saveChanges")}
      </Button>
    </form>
  );
}
