import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "success";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 text-center";

const variants: Record<Variant, string> = {
  primary: "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)]",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-brand-strong)] border-2 border-[var(--color-brand)] hover:bg-[var(--color-brand-soft)]",
  quiet: "bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-line)]",
  danger: "bg-[var(--color-alert)] text-white hover:brightness-90",
  success: "bg-[var(--color-good)] text-white hover:brightness-110",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm min-h-11",
  md: "px-5 py-3 text-base min-h-12",
  lg: "px-7 py-4 text-lg min-h-14 w-full sm:w-auto",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function Button({ variant = "primary", size = "md", icon, className = "", children, ...rest }: ButtonProps) {
  return (
    <button {...rest} className={buttonClass(variant, size, className)}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link {...rest} className={buttonClass(variant, size, className)}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
