import type { ReactNode } from "react";

import { ButtonLink } from "@/components/ui/Button";
import { SAFETY_NOTICE } from "@/lib/domain";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<Tone, { box: string; icon: string; word: string }> = {
  info: { box: "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]", icon: "ℹ️", word: "Informação" },
  success: { box: "border-[var(--color-good)] bg-[var(--color-good-soft)] text-[var(--color-good)]", icon: "✅", word: "Tudo certo" },
  warning: { box: "border-[var(--color-warn)] bg-[var(--color-warn-soft)] text-[var(--color-warn)]", icon: "⚠️", word: "Atenção" },
  danger: { box: "border-[var(--color-alert)] bg-[var(--color-alert-soft)] text-[var(--color-alert)]", icon: "🚨", word: "Importante" },
  neutral: { box: "border-[var(--color-line)] bg-[var(--color-surface-muted)] text-[var(--color-ink)]", icon: "💬", word: "Aviso" },
};

/** Nunca comunica estado apenas pela cor: sempre ícone + palavra + texto. */
export function Alert({
  tone = "info",
  title,
  children,
  live,
}: {
  tone?: Tone;
  title?: string;
  children: ReactNode;
  live?: boolean;
}) {
  const style = toneStyles[tone];
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border-2 p-4 ${style.box}`}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={live ? "polite" : undefined}
    >
      <span aria-hidden="true" className="text-xl leading-none">
        {style.icon}
      </span>
      <div className="text-base">
        <p className="font-bold">{title ?? style.word}</p>
        <div className="mt-0.5 font-medium">{children}</div>
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "neutral",
  icon,
}: {
  children: ReactNode;
  tone?: Tone;
  icon?: string;
}) {
  const style = toneStyles[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold ${style.box}`}>
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  max,
  label,
}: {
  value: number;
  max: number;
  label: string;
}) {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.round((value / safeMax) * 100));
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm font-semibold">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className="h-4 w-full overflow-hidden rounded-full bg-[var(--color-surface-muted)] ring-1 ring-[var(--color-line)]"
      >
        <div className="h-full rounded-full bg-[var(--color-brand)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({
  icon = "🌱",
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-[var(--color-line)] bg-[var(--color-surface)] p-8 text-center">
      <span aria-hidden="true" className="text-4xl">
        {icon}
      </span>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-md text-[var(--color-ink-soft)]">{description}</p>
      {actionLabel && actionHref ? (
        <ButtonLink href={actionHref} size="md">
          {actionLabel}
        </ButtonLink>
      ) : null}
    </div>
  );
}

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="rounded-xl bg-[var(--color-surface-muted)] p-3 text-sm text-[var(--color-ink-soft)]">
        <span aria-hidden="true">🛟 </span>
        {SAFETY_NOTICE}
      </p>
    );
  }
  return (
    <Alert tone="neutral" title="O CuidAgora não faz diagnósticos">
      {SAFETY_NOTICE} Em caso de emergência, procure atendimento imediatamente.
    </Alert>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse p-6" aria-hidden="true">
      <div className="mb-4 h-6 w-1/3 rounded bg-[var(--color-surface-muted)]" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="mb-2 h-4 w-full rounded bg-[var(--color-surface-muted)]" />
      ))}
    </div>
  );
}

export function LoadingScreen({ label = "Carregando informações…" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <p className="text-[var(--color-ink-soft)]">{label}</p>
      <SkeletonCard />
      <SkeletonCard lines={2} />
    </div>
  );
}
