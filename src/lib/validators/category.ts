import { z } from "zod";

const name = z.string().trim().min(2, "Name must be at least 2 characters");

// "" -> null; otherwise the trimmed description.
const description = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? null : value,
  z.string().trim().nullable(),
);

const active = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const createCategorySchema = z.object({
  name,
  description,
});

export const updateCategorySchema = z.object({
  name,
  description,
  active,
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export interface CategoryFormFieldErrors {
  name?: string[];
  description?: string[];
  active?: string[];
}

export interface CategoryFormState {
  error?: string;
  fieldErrors?: CategoryFormFieldErrors;
}
