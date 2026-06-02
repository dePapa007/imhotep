import { z } from "zod";

export const RECURRENCE_VALUES = [
  "NONE",
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
] as const;

const title = z.string().trim().min(2, "Title must be at least 2 characters");
const categoryId = z.string().min(1, "Category is required");
const dateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date");
const timeString = z.string().regex(/^\d{2}:\d{2}$/, "Enter a valid time");

const optionalText = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().nullable(),
);

const optionalEndDate = z.preprocess(
  (value) => (value === "" || value == null ? undefined : value),
  dateString.optional(),
);

const capacity = z.preprocess(
  (value) => (value === "" || value == null ? undefined : Number(value)),
  z.int().positive("Capacity must be a positive number").optional(),
);

const registrationDeadlineHours = z.preprocess(
  (value) => (value === "" || value == null ? undefined : Number(value)),
  z
    .int()
    .min(0, "Deadline hours cannot be negative")
    .optional(),
);

const trainerIds = z.array(z.string().min(1)).default([]);

const baseFields = {
  title,
  description: optionalText,
  categoryId,
  location: optionalText,
  startTime: timeString,
  endTime: timeString,
  capacity,
  registrationDeadlineHours,
  trainerIds,
};

export const createTrainingSchema = z
  .object({
    ...baseFields,
    startDate: dateString,
    endDate: optionalEndDate,
    recurrenceType: z.enum(RECURRENCE_VALUES),
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
    if (data.recurrenceType !== "NONE") {
      if (!data.endDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date is required for recurring trainings",
        });
      } else if (data.endDate < data.startDate) {
        ctx.addIssue({
          code: "custom",
          path: ["endDate"],
          message: "End date must be on or after the start date",
        });
      }
    }
  });

export const updateSessionSchema = z
  .object({
    ...baseFields,
    date: dateString,
  })
  .superRefine((data, ctx) => {
    if (data.endTime <= data.startTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "End time must be after start time",
      });
    }
  });

export type CreateTrainingInput = z.infer<typeof createTrainingSchema>;
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>;

export interface TrainingFormFieldErrors {
  title?: string[];
  description?: string[];
  categoryId?: string[];
  location?: string[];
  startDate?: string[];
  endDate?: string[];
  date?: string[];
  startTime?: string[];
  endTime?: string[];
  recurrenceType?: string[];
  capacity?: string[];
  registrationDeadlineHours?: string[];
  trainerIds?: string[];
}

export interface TrainingFormState {
  error?: string;
  fieldErrors?: TrainingFormFieldErrors;
}
