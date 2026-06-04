"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          textAlign: "center",
          padding: "2rem",
          backgroundColor: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <h1 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
          A critical error occurred. Please try again.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          style={{
            height: "2.75rem",
            padding: "0 1rem",
            borderRadius: "0.75rem",
            border: "none",
            background: "#15803d",
            color: "#f0fdf4",
            fontWeight: 500,
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
