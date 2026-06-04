"use client";

import { useMemo, useState, useTransition } from "react";

import { attendanceStatusLabel } from "@/lib/attendance";
import type { AttendanceMarkInput } from "@/lib/validators/attendance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { AttendanceActionResult } from "@/server/attendance/actions";
import type { AttendanceStatus } from "@prisma/client";

export interface AttendanceRegistrationRow {
  id: string;
  attendanceStatus: AttendanceStatus;
  attendanceNotes: string | null;
  user: {
    name: string;
    category?: { name: string } | null;
  };
}

interface AttendanceListProps {
  sessionId: string;
  registrations: AttendanceRegistrationRow[];
  canEdit: boolean;
  lockedMessage?: string | null;
  saveAction: (
    sessionId: string,
    prev: AttendanceActionResult,
    formData: FormData,
  ) => Promise<AttendanceActionResult>;
}

type RowState = {
  status: AttendanceStatus;
  notes: string;
};

const statusBadgeVariant = {
  UNMARKED: "muted",
  PRESENT: "success",
  ABSENT: "destructive",
} as const;

export function AttendanceList({
  sessionId,
  registrations,
  canEdit,
  lockedMessage,
  saveAction,
}: AttendanceListProps) {
  const [rows, setRows] = useState<Record<string, RowState>>(() =>
    Object.fromEntries(
      registrations.map((r) => [
        r.id,
        { status: r.attendanceStatus, notes: r.attendanceNotes ?? "" },
      ]),
    ),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const summary = useMemo(() => {
    const values = Object.values(rows);
    return {
      present: values.filter((r) => r.status === "PRESENT").length,
      absent: values.filter((r) => r.status === "ABSENT").length,
      unmarked: values.filter((r) => r.status === "UNMARKED").length,
    };
  }, [rows]);

  function updateRow(
    registrationId: string,
    patch: Partial<RowState>,
  ) {
    setRows((prev) => {
      const current = prev[registrationId] ?? {
        status: "UNMARKED" as AttendanceStatus,
        notes: "",
      };
      return {
        ...prev,
        [registrationId]: { ...current, ...patch },
      };
    });
  }

  function setStatus(registrationId: string, status: AttendanceStatus) {
    updateRow(registrationId, { status });
  }

  function setNotes(registrationId: string, notes: string) {
    updateRow(registrationId, { notes });
  }

  function markAllPresent() {
    setRows((prev) => {
      const next: Record<string, RowState> = { ...prev };
      for (const id of Object.keys(next)) {
        const current = next[id];
        next[id] = {
          status: "PRESENT",
          notes: current?.notes ?? "",
        };
      }
      return next;
    });
  }

  function handleSubmit() {
    setMessage(null);
    const marks: AttendanceMarkInput[] = registrations.map((r) => {
      const row = rows[r.id] ?? {
        status: r.attendanceStatus,
        notes: r.attendanceNotes ?? "",
      };
      return {
        registrationId: r.id,
        status: row.status,
        notes: row.notes,
      };
    });

    const formData = new FormData();
    formData.set("marks", JSON.stringify(marks));

    startTransition(async () => {
      const result = await saveAction(sessionId, {}, formData);
      if (result.error) {
        setMessage(result.error);
      } else {
        setMessage("Attendance saved.");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
        <CardDescription>
          {canEdit
            ? "Mark who attended this training."
            : lockedMessage ?? "Attendance overview."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {registrations.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No registered members to mark.
          </p>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              {summary.present} present · {summary.absent} absent ·{" "}
              {summary.unmarked} unmarked
            </p>
            <ul className="flex flex-col gap-4">
              {registrations.map((registration) => {
                const row = rows[registration.id] ?? {
                  status: registration.attendanceStatus,
                  notes: registration.attendanceNotes ?? "",
                };
                return (
                  <li
                    key={registration.id}
                    className="border-border flex flex-col gap-2 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">
                          {registration.user.name}
                        </p>
                        {registration.user.category ? (
                          <p className="text-muted-foreground text-xs">
                            {registration.user.category.name}
                          </p>
                        ) : null}
                      </div>
                      {!canEdit ? (
                        <Badge
                          variant={statusBadgeVariant[row.status]}
                        >
                          {attendanceStatusLabel[row.status]}
                        </Badge>
                      ) : null}
                    </div>
                    {canEdit ? (
                      <>
                        <div className="flex flex-wrap gap-2">
                          {(
                            ["PRESENT", "ABSENT", "UNMARKED"] as const
                          ).map((status) => (
                            <Button
                              key={status}
                              type="button"
                              size="sm"
                              variant={
                                row.status === status ? "primary" : "outline"
                              }
                              onClick={() =>
                                setStatus(registration.id, status)
                              }
                            >
                              {attendanceStatusLabel[status]}
                            </Button>
                          ))}
                        </div>
                        <Textarea
                          label="Notes"
                          rows={2}
                          value={row.notes}
                          onChange={(e) =>
                            setNotes(registration.id, e.target.value)
                          }
                          placeholder="Optional note"
                        />
                      </>
                    ) : row.notes ? (
                      <p className="text-muted-foreground text-xs">
                        {row.notes}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            {canEdit ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={markAllPresent}
                  disabled={pending}
                >
                  Mark all present
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSubmit}
                  disabled={pending}
                >
                  {pending ? "Saving…" : "Save attendance"}
                </Button>
              </div>
            ) : null}
          </>
        )}
        {message ? (
          <p
            className={
              message === "Attendance saved."
                ? "text-primary text-sm"
                : "text-destructive text-sm"
            }
          >
            {message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
