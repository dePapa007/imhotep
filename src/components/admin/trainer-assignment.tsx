"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useTranslations } from "@/i18n/locale-provider";
import {
  addTrainerFromForm,
  removeTrainerFromSession,
  type ActionResult,
} from "@/server/trainings/actions";
import type { TrainerOption } from "@/server/trainings/queries";

const initialState: ActionResult = {};

interface AssignedTrainer {
  id: string;
  trainerId: string;
  trainer: { id: string; name: string };
}

export function TrainerAssignment({
  sessionId,
  assigned,
  availableTrainers,
}: {
  sessionId: string;
  assigned: AssignedTrainer[];
  availableTrainers: TrainerOption[];
}) {
  const t = useTranslations();
  const action = addTrainerFromForm.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const assignedIds = new Set(assigned.map((tr) => tr.trainerId));
  const options = availableTrainers
    .filter((tr) => !assignedIds.has(tr.id))
    .map((tr) => ({ label: tr.name, value: tr.id }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("trainer.trainers")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {assigned.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {t("admin.noTrainersAssignedCard")}
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {assigned.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3"
              >
                <span className="text-sm font-medium">
                  {entry.trainer.name}
                </span>
                <form
                  action={removeTrainerFromSession.bind(
                    null,
                    sessionId,
                    entry.trainerId,
                  )}
                >
                  <Button type="submit" variant="outline" size="sm">
                    {t("common.remove")}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}

        {options.length > 0 ? (
          <form action={formAction} className="flex flex-col gap-3 border-t pt-4">
            <Select
              name="trainerId"
              options={options}
              placeholder={t("admin.addTrainerPlaceholder")}
            />
            {state.error ? (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} size="sm" variant="secondary">
              {pending ? t("forms.adding") : t("admin.addTrainer")}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
