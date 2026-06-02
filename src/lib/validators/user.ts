import { z } from "zod";

export const ROLE_VALUES = ["ADMIN", "TRAINER", "USER"] as const;

const name = z.string().trim().min(2, "Name must be at least 2 characters");
const email = z.string().trim().toLowerCase().pipe(z.email("Enter a valid email"));
const role = z.enum(ROLE_VALUES);
const password = z
  .string()
  .min(8, "Password must be at least 8 characters");

// "", "none" -> null; otherwise the category id string.
const categoryId = z.preprocess(
  (value) => (value === "" || value === "none" ? null : value),
  z.string().nullable(),
);

const active = z.preprocess(
  (value) => value === "on" || value === "true" || value === true,
  z.boolean(),
);

export const createUserSchema = z.object({
  name,
  email,
  role,
  categoryId,
  password,
});

export const updateUserSchema = z.object({
  name,
  email,
  role,
  categoryId,
  active,
  // Optional on edit: empty string means "keep current password".
  password: z.preprocess(
    (value) => (value === "" || value == null ? undefined : value),
    password.optional(),
  ),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export interface UserFormFieldErrors {
  name?: string[];
  email?: string[];
  role?: string[];
  categoryId?: string[];
  password?: string[];
  active?: string[];
}

export interface UserFormState {
  error?: string;
  fieldErrors?: UserFormFieldErrors;
}
