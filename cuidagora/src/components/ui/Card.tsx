import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article" | "li";
}) {
  return <Tag className={`card p-5 sm:p-6 ${className}`}>{children}</Tag>;
}

export function CardTitle({
  children,
  icon,
  action,
  level = 2,
  description,
}: {
  children: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  description?: string;
}) {
  const Heading = (level === 1 ? "h1" : level === 3 ? "h3" : "h2") as "h1" | "h2" | "h3";
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Heading className="flex items-center gap-2.5 text-lg sm:text-xl font-bold text-slate-900">
          {icon ? <span className="text-teal-700 shrink-0 [&>svg]:size-5" aria-hidden="true">{icon}</span> : null}
          <span>{children}</span>
        </Heading>
        {description ? (
          <p className="mt-1 text-xs sm:text-sm text-slate-500">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {icon ? <span className="text-teal-700 shrink-0 [&>svg]:size-7" aria-hidden="true">{icon}</span> : null}
          <span>{title}</span>
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Stack({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-4 sm:gap-5 ${className}`}>{children}</div>;
}
