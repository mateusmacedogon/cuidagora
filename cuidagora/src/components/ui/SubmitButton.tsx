"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Feedback";
import type { ActionState } from "@/lib/action-state";

export function SubmitButton({
  children,
  pendingLabel = "Salvando…",
  variant = "primary",
  size = "md",
  icon,
  className,
}: {
  children: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "quiet" | "danger" | "success" | "outline";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      icon={pending ? <Loader2 className="animate-spin" /> : icon}
      disabled={pending}
      className={className}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function FormFeedback({ state }: { state: ActionState }) {
  if (state.status === "idle") return null;
  const generic = state.errors.form;
  return (
    <Alert tone={state.status === "success" ? "success" : "danger"} live>
      {generic || state.message}
    </Alert>
  );
}
