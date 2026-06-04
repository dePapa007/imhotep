"use client";

import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-md flex-1">
      <ErrorState
        title="Something went wrong"
        description="An unexpected error occurred. Please try again."
        action={
          <Button
            onClick={() => unstable_retry()}
            className="w-full sm:w-auto"
          >
            Try again
          </Button>
        }
      />
    </main>
  );
}
