"use client";

import { useActionState, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "@/i18n/locale-provider";
import type { TrainingFormState } from "@/lib/validators/training";

interface Option {
  id: string;
  name: string;
}

export interface TrainingFormDefaults {
  title?: string;
  description?: string | null;
  categoryId?: string;
  location?: string | null;
  date?: string;
  startTime?: string;
  endTime?: string;
  capacity?: number | null;
  registrationDeadlineHours?: number | null;
  trainerIds?: string[];
}

interface TrainingFormProps {
  action: (
    prevState: TrainingFormState,
    formData: FormData,
  ) => Promise<TrainingFormState>;
  mode: "create" | "edit";
  categories: Option[];
  trainers: Option[];
  defaults?: TrainingFormDefaults;
}

const initialState: TrainingFormState = {};

export function TrainingForm({
  action,
  mode,
  categories,
  trainers,
  defaults,
}: TrainingFormProps) {
  const t = useTranslations();
  const [state, formAction, pending] = useActionState(action, initialState);
  const [recurrence, setRecurrence] = useState("NONE");

  const recurrenceOptions = useMemo(
    () => [
      { label: t("forms.oneTime"), value: "NONE" },
      { label: t("forms.weekly"), value: "WEEKLY" },
      { label: t("forms.biweekly"), value: "BIWEEKLY" },
      { label: t("forms.monthly"), value: "MONTHLY" },
    ],
    [t],
  );

  const categoryOptions = categories.map((c) => ({
    label: c.name,
    value: c.id,
  }));
  const selectedTrainers = new Set(defaults?.trainerIds ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label={t("forms.title")}
        name="title"
        type="text"
        required
        defaultValue={defaults?.title}
        error={state.fieldErrors?.title?.[0]}
      />
      <Textarea
        label={t("forms.description")}
        name="description"
        placeholder={t("forms.optionalDetails")}
        defaultValue={defaults?.description ?? ""}
        error={state.fieldErrors?.description?.[0]}
      />
      <Select
        label={t("forms.category")}
        name="categoryId"
        options={categoryOptions}
        placeholder={t("forms.selectCategory")}
        defaultValue={defaults?.categoryId ?? ""}
        required
        error={state.fieldErrors?.categoryId?.[0]}
      />
      <Input
        label={t("forms.location")}
        name="location"
        type="text"
        placeholder={t("forms.locationPlaceholder")}
        defaultValue={defaults?.location ?? ""}
        error={state.fieldErrors?.location?.[0]}
      />

      {mode === "create" ? (
        <>
          <Select
            label={t("forms.recurrence")}
            name="recurrenceType"
            options={recurrenceOptions}
            defaultValue="NONE"
            onChange={(event) => setRecurrence(event.target.value)}
            error={state.fieldErrors?.recurrenceType?.[0]}
          />
          <Input
            label={recurrence === "NONE" ? t("forms.date") : t("forms.startDate")}
            name="startDate"
            type="date"
            required
            error={state.fieldErrors?.startDate?.[0]}
          />
          {recurrence !== "NONE" ? (
            <Input
              label={t("forms.endDate")}
              name="endDate"
              type="date"
              required
              error={state.fieldErrors?.endDate?.[0]}
            />
          ) : null}
        </>
      ) : (
        <Input
          label={t("forms.date")}
          name="date"
          type="date"
          required
          defaultValue={defaults?.date}
          error={state.fieldErrors?.date?.[0]}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("forms.startTime")}
          name="startTime"
          type="time"
          required
          defaultValue={defaults?.startTime}
          error={state.fieldErrors?.startTime?.[0]}
        />
        <Input
          label={t("forms.endTime")}
          name="endTime"
          type="time"
          required
          defaultValue={defaults?.endTime}
          error={state.fieldErrors?.endTime?.[0]}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t("forms.capacityOptional")}
          name="capacity"
          type="number"
          min={1}
          defaultValue={defaults?.capacity ?? undefined}
          error={state.fieldErrors?.capacity?.[0]}
        />
        <Input
          label={t("forms.closeRegistrationHours")}
          name="registrationDeadlineHours"
          type="number"
          min={0}
          defaultValue={defaults?.registrationDeadlineHours ?? undefined}
          error={state.fieldErrors?.registrationDeadlineHours?.[0]}
        />
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-foreground mb-1 text-sm font-medium">
          {t("forms.trainers")}
        </legend>
        {trainers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.noActiveTrainers")}
          </p>
        ) : (
          trainers.map((trainer) => (
            <label
              key={trainer.id}
              className="flex items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                name="trainerIds"
                value={trainer.id}
                defaultChecked={selectedTrainers.has(trainer.id)}
                className="border-input h-4 w-4 rounded"
              />
              {trainer.name}
            </label>
          ))
        )}
        {state.fieldErrors?.trainerIds?.[0] ? (
          <p className="text-destructive text-sm" role="alert">
            {state.fieldErrors.trainerIds[0]}
          </p>
        ) : null}
      </fieldset>

      {state.error ? (
        <p className="text-destructive text-sm" role="alert">
          {state.error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="w-full">
        {pending
          ? t("common.saving")
          : mode === "create"
            ? t("forms.createTraining")
            : t("forms.saveChanges")}
      </Button>
    </form>
  );
}
