import { z } from "zod";

export const attendanceMarkSchema = z.object({
  registrationId: z.string().min(1),
  status: z.enum(["UNMARKED", "PRESENT", "ABSENT"]),
  notes: z
    .string()
    .max(500)
    .optional()
    .transform((value) => {
      if (value == null || value.trim() === "") return null;
      return value.trim();
    }),
});

export const saveSessionAttendanceSchema = z.object({
  sessionId: z.string().min(1),
  marks: z.array(attendanceMarkSchema).min(1),
});

export type AttendanceMarkInput = z.infer<typeof attendanceMarkSchema>;
