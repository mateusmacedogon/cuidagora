import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "quiet" | "danger" | "success" | "outline";
type Size = "md" | "lg" | "sm";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-60 text-center shadow-xs select-none active:scale-[0.98]";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--color-brand)] text-white hover:bg-[var(--color-brand-strong)] active:bg-[var(--color-brand-dark)] shadow-sm",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-brand-strong)] border border-[var(--color-brand-border)] hover:bg-[var(--color-brand-soft)] hover:border-[var(--color-brand)]",
  outline:
    "bg-transparent text-[var(--color-ink)] border border-[var(--color-line)] hover:bg-[var(--color-surface-muted)] hover:border-[var(--color-line-subtle)]",
  quiet:
    "bg-[var(--color-surface-muted)] text-[var(--color-ink)] hover:bg-[var(--color-line)] shadow-none",
  danger:
    "bg-[var(--color-alert)] text-white hover:brightness-95 active:brightness-90 shadow-sm",
  success:
    "bg-[var(--color-good)] text-white hover:brightness-105 active:brightness-95 shadow-sm",
};

const sizes: Record<Size, string> = {
  sm: "px-3.5 py-2 text-sm min-h-10",
  md: "px-4.5 py-2.5 text-base min-h-11",
  lg: "px-6 py-3.5 text-base sm:text-lg min-h-13 w-full sm:w-auto",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra = ""): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim();
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button {...rest} className={buttonClass(variant, size, className)}>
      {icon ? <span className="shrink-0 [&>svg]:size-5" aria-hidden="true">{icon}</span> : null}
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
      {icon ? <span className="shrink-0 [&>svg]:size-5" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </Link>
  );
}
