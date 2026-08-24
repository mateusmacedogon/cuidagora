"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { href: string; label: string; icon: string };

export const PRIMARY_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: "🏠" },
  { href: "/cuidados", label: "Cuidados", icon: "💚" },
  { href: "/historico", label: "Histórico", icon: "🕓" },
  { href: "/consultas", label: "Consultas", icon: "📅" },
  { href: "/resumo", label: "Resumo", icon: "📄" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

export const SIMPLE_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: "🏠" },
  { href: "/cuidados", label: "Cuidados", icon: "💚" },
  { href: "/consultas", label: "Consultas", icon: "📅" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="no-print hidden lg:block">
      <ul className="sticky top-24 flex flex-col gap-2">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-lg font-semibold ${
                  active
                    ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)]"
                    : "border-transparent bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-line)]"
                }`}
              >
                <span aria-hidden="true" className="text-2xl">
                  {item.icon}
                </span>
                {item.label}
                {active ? <span className="sr-only">(página atual)</span> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const visible = items.slice(0, 5);
  return (
    <nav
      aria-label="Navegação principal (celular)"
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t-2 border-[var(--color-line)] bg-[var(--color-surface)] lg:hidden"
    >
      <ul className="mx-auto flex max-w-3xl">
        {visible.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 py-2 text-xs font-semibold ${
                  active
                    ? "bg-[var(--color-brand-soft)] text-[var(--color-brand-strong)] underline decoration-2 underline-offset-4"
                    : "text-[var(--color-ink-soft)]"
                }`}
              >
                <span aria-hidden="true" className="text-2xl leading-none">
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
