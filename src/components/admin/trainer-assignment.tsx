"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
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
  const action = addTrainerFromForm.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  const assignedIds = new Set(assigned.map((t) => t.trainerId));
  const options = availableTrainers
    .filter((t) => !assignedIds.has(t.id))
    .map((t) => ({ label: t.name, value: t.id }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trainers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {assigned.length === 0 ? (
          <p className="text-muted-foreground text-sm">No trainers assigned.</p>
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
                    Remove
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
              placeholder="Add a trainer"
            />
            {state.error ? (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} size="sm" variant="secondary">
              {pending ? "Adding…" : "Add trainer"}
            </Button>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
