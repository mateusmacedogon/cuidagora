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
  return <Tag className={`card p-5 shadow-sm sm:p-6 ${className}`}>{children}</Tag>;
}

export function CardTitle({
  children,
  icon,
  action,
  level = 2,
  description,
}: {
  children: ReactNode;
  icon?: string;
  action?: ReactNode;
  level?: 1 | 2 | 3;
  description?: string;
}) {
  const Heading = (level === 1 ? "h1" : level === 3 ? "h3" : "h2") as "h1" | "h2" | "h3";
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <Heading className="flex items-center gap-2 text-xl font-bold text-[var(--color-ink)] sm:text-2xl">
          {icon ? <span aria-hidden="true">{icon}</span> : null}
          {children}
        </Heading>
        {description ? (
          <p className="mt-1 text-[var(--color-ink-soft)]">{description}</p>
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
  icon?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="flex items-center gap-3 text-2xl font-bold sm:text-3xl">
          {icon ? <span aria-hidden="true">{icon}</span> : null}
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-[var(--color-ink-soft)]">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}

export function Stack({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-5 ${className}`}>{children}</div>;
}
