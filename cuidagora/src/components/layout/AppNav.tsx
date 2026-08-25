"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import {
  Calendar,
  Clock,
  FileText,
  HeartPulse,
  Home,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: ElementType;
};

export const PRIMARY_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/cuidados", label: "Cuidados", icon: HeartPulse },
  { href: "/historico", label: "Histórico", icon: Clock },
  { href: "/consultas", label: "Consultas", icon: Calendar },
  { href: "/resumo", label: "Resumo", icon: FileText },
  { href: "/perfil", label: "Perfil", icon: User },
];

export const SIMPLE_NAV: NavItem[] = [
  { href: "/inicio", label: "Início", icon: Home },
  { href: "/cuidados", label: "Cuidados", icon: HeartPulse },
  { href: "/consultas", label: "Consultas", icon: Calendar },
  { href: "/perfil", label: "Perfil", icon: User },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Navegação principal" className="no-print hidden lg:block">
      <ul className="sticky top-20 flex flex-col gap-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex min-h-12 items-center gap-3.5 rounded-xl border px-4 py-3 text-base font-semibold transition-all duration-150 ${
                  active
                    ? "border-teal-200 bg-teal-50/90 text-teal-800 shadow-xs font-bold"
                    : "border-transparent bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`size-5 transition-transform duration-150 group-hover:scale-105 shrink-0 ${
                    active ? "text-teal-700" : "text-slate-500 group-hover:text-slate-700"
                  }`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
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
      className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md lg:hidden shadow-lg"
    >
      <ul className="mx-auto flex max-w-lg items-center">
        {visible.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 px-1 py-2 text-xs font-semibold transition-colors ${
                  active
                    ? "text-teal-800 font-bold bg-teal-50/70"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`size-5 shrink-0 ${
                    active ? "text-teal-700" : "text-slate-400"
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
