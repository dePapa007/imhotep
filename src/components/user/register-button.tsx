"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import {
  cancelMyRegistrationFromForm,
  registerForSessionFromForm,
  type ActionResult,
} from "@/server/registrations/actions";

const initialState: ActionResult = {};

export function RegisterButton({
  sessionId,
  isRegistered,
  canRegister,
  canCancel,
  cannotRegisterReason,
}: {
  sessionId: string;
  isRegistered: boolean;
  canRegister: boolean;
  canCancel: boolean;
  cannotRegisterReason: string | null;
}) {
  const registerAction = registerForSessionFromForm.bind(null, sessionId);
  const cancelAction = cancelMyRegistrationFromForm.bind(null, sessionId);
  const [registerState, registerFormAction, registerPending] = useActionState(
    registerAction,
    initialState,
  );
  const [cancelState, cancelFormAction, cancelPending] = useActionState(
    cancelAction,
    initialState,
  );

  if (isRegistered && canCancel) {
    return (
      <div className="flex flex-col gap-2">
        {cancelState.error ? (
          <p className="text-destructive text-sm" role="alert">
            {cancelState.error}
          </p>
        ) : null}
        <form action={cancelFormAction}>
          <Button
            type="submit"
            variant="destructive"
            disabled={cancelPending}
            className="w-full"
          >
            {cancelPending ? "Cancelling…" : "Cancel registration"}
          </Button>
        </form>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <p className="text-muted-foreground text-sm">
        You are registered for this training.
      </p>
    );
  }

  if (!canRegister) {
    return (
      <p className="text-muted-foreground text-sm">
        {cannotRegisterReason ?? "Registration is not available."}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {registerState.error ? (
        <p className="text-destructive text-sm" role="alert">
          {registerState.error}
        </p>
      ) : null}
      <form action={registerFormAction}>
        <Button type="submit" disabled={registerPending} className="w-full">
          {registerPending ? "Registering…" : "Register"}
        </Button>
      </form>
    </div>
  );
}
