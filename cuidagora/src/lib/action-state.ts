import type { ZodError } from "zod";

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors: Record<string, string>;
};

export const idleState: ActionState = { status: "idle", message: "", errors: {} };

export function successState(message: string): ActionState {
  return { status: "success", message, errors: {} };
}

export function errorState(message: string, errors: Record<string, string> = {}): ActionState {
  return { status: "error", message, errors };
}

export function zodErrorState(error: ZodError, message = "Confira os campos destacados."): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!errors[key]) errors[key] = issue.message;
  }
  return { status: "error", message, errors };
}

/** Converte FormData em objeto simples, tratando checkboxes e campos repetidos. */
export function formToObject(formData: FormData): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    const cleanKey = key.endsWith("[]") ? key.slice(0, -2) : key;
    const existing = result[cleanKey];
    if (key.endsWith("[]")) {
      result[cleanKey] = Array.isArray(existing) ? [...existing, value] : [value];
    } else if (existing !== undefined) {
      result[cleanKey] = Array.isArray(existing) ? [...existing, value] : [existing, value];
    } else {
      result[cleanKey] = value;
    }
  }
  return result;
}

export function checkbox(formData: FormData, name: string): boolean {
  const value = formData.get(name);
  return value === "on" || value === "true" || value === "1";
}
