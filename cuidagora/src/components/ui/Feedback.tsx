import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HeartPulse,
  Info,
  Shield,
  ShieldAlert,
} from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { SAFETY_NOTICE } from "@/lib/domain";

type Tone = "info" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<
  Tone,
  { box: string; icon: ReactNode; word: string; text: string }
> = {
  info: {
    box: "border-teal-200 bg-teal-50/80 text-teal-900",
    icon: <Info className="size-5 text-teal-700 shrink-0" />,
    word: "Informação",
    text: "text-teal-900",
  },
  success: {
    box: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
    icon: <CheckCircle2 className="size-5 text-emerald-700 shrink-0" />,
    word: "Confirmado",
    text: "text-emerald-900",
  },
  warning: {
    box: "border-amber-200 bg-amber-50/80 text-amber-900",
    icon: <AlertTriangle className="size-5 text-amber-700 shrink-0" />,
    word: "Atenção",
    text: "text-amber-900",
  },
  danger: {
    box: "border-rose-200 bg-rose-50/80 text-rose-900",
    icon: <AlertCircle className="size-5 text-rose-700 shrink-0" />,
    word: "Importante",
    text: "text-rose-900",
  },
  neutral: {
    box: "border-slate-200 bg-slate-50/90 text-slate-800",
    icon: <ShieldAlert className="size-5 text-slate-700 shrink-0" />,
    word: "Aviso",
    text: "text-slate-800",
  },
};

/** Nunca comunica estado apenas pela cor: sempre ícone + palavra + texto claro. */
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
      className={`flex items-start gap-3.5 rounded-xl border p-4 shadow-xs ${style.box}`}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={live ? "polite" : undefined}
    >
      <span aria-hidden="true" className="mt-0.5">
        {style.icon}
      </span>
      <div className="text-sm sm:text-base leading-relaxed">
        <p className="font-bold text-[var(--color-ink)]">{title ?? style.word}</p>
        <div className={`mt-0.5 font-medium ${style.text}`}>{children}</div>
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
  icon?: ReactNode;
}) {
  const style = toneStyles[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${style.box}`}
    >
      {icon ? <span className="[&>svg]:size-3.5 shrink-0" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
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
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-semibold text-[var(--color-ink)]">
        <span>{label}</span>
        <span className="text-[var(--color-brand-strong)] font-bold">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={label}
        className="h-3.5 w-full overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionHref,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
        {icon ?? <HeartPulse className="size-7 stroke-[1.75]" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <p className="max-w-md text-sm text-slate-600 leading-relaxed">{description}</p>
      {actionLabel && actionHref ? (
        <div className="mt-2">
          <ButtonLink href={actionHref} size="sm">
            {actionLabel}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

export function SafetyNotice({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/90 p-3 text-xs sm:text-sm text-slate-600">
        <Shield className="size-4 text-teal-600 shrink-0" aria-hidden="true" />
        <p>{SAFETY_NOTICE}</p>
      </div>
    );
  }
  return (
    <Alert tone="neutral" title="O CuidAgora não faz diagnósticos médicos">
      {SAFETY_NOTICE} Em caso de emergência clínica, procure atendimento médico presencial imediatamente.
    </Alert>
  );
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card animate-pulse p-6" aria-hidden="true">
      <div className="mb-4 h-6 w-1/3 rounded-lg bg-slate-200" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="mb-2.5 h-4 w-full rounded bg-slate-100" />
      ))}
    </div>
  );
}

export function LoadingScreen({ label = "Carregando informações…" }: { label?: string }) {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <SkeletonCard />
      <SkeletonCard lines={2} />
    </div>
  );
}
