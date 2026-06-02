"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import {
  addRegistrationFromForm,
  type ActionResult,
} from "@/server/trainings/actions";
import type { EligibleUser } from "@/server/trainings/queries";

const initialState: ActionResult = {};

export function AddRegistrationForm({
  sessionId,
  eligibleUsers,
  disabled,
}: {
  sessionId: string;
  eligibleUsers: EligibleUser[];
  disabled: boolean;
}) {
  const action = addRegistrationFromForm.bind(null, sessionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (disabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Add member</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Cannot add members to a cancelled training or when at capacity.
          </p>
        </CardContent>
      </Card>
    );
  }

  const options = eligibleUsers.map((user) => ({
    label: user.name,
    value: user.id,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add member</CardTitle>
      </CardHeader>
      <CardContent>
        {eligibleUsers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No eligible members available for this category.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-3">
            <Select
              name="userId"
              options={options}
              placeholder="Select a member"
              required
            />
            {state.error ? (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            ) : null}
            <Button type="submit" disabled={pending} size="sm">
              {pending ? "Adding…" : "Add user"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
