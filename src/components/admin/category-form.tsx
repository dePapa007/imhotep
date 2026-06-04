"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n/locale-provider";
import type { CategoryFormState } from "@/lib/validators/category";

export interface CategoryFormDefaults {
  name?: string;
  description?: string | null;
  active?: boolean;
}

interface CategoryFormProps {
  action: (
    prevState: CategoryFormState,
    formData: FormData,
  ) => Promise<CategoryFormState>;
  mode: "create" | "edit";
  defaults?: CategoryFormDefaults;
}

const initialState: CategoryFormState = {};

export function CategoryForm({ action, mode, defaults }: CategoryFormProps) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={t("forms.name")}
        name="name"
        type="text"
        required
        defaultValue={defaults?.name}
        error={state.fieldErrors?.name?.[0]}
      />
      <Textarea
        label={t("forms.description")}
        name="description"
        placeholder={t("forms.optionalCategoryDetails")}
        defaultValue={defaults?.description ?? ""}
        error={state.fieldErrors?.description?.[0]}
      />
      {mode === "edit" ? (
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="border-input h-4 w-4 rounded"
          />
          {t("common.active")}
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
            ? t("forms.createCategory")
            : t("forms.saveChanges")}
      </Button>
    </form>
  );
}
