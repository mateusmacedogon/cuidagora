import Link from "next/link";
import type { ReactNode } from "react";
import { HeartHandshake, LogOut, Shield } from "lucide-react";

import { AccessibilityMenu } from "@/components/a11y/AccessibilityMenu";
import { BottomNav, PRIMARY_NAV, SIMPLE_NAV, SideNav } from "@/components/layout/AppNav";
import { signOutAction } from "@/features/auth/actions";
import { requireUser } from "@/lib/auth/session";
import { SAFETY_NOTICE } from "@/lib/domain";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await requireUser();
  const prefs = user.preferences;
  const items = prefs.simplifiedMode ? SIMPLE_NAV : PRIMARY_NAV;

  const bootScript = `document.documentElement.dataset.elder=${JSON.stringify(String(prefs.elderMode))};document.documentElement.dataset.contrast=${JSON.stringify(String(prefs.highContrast))};document.documentElement.dataset.simple=${JSON.stringify(String(prefs.simplifiedMode))};`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo principal
      </a>

      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-2.5">
          <Link
            href="/inicio"
            className="flex items-center gap-2.5 text-lg sm:text-xl font-black text-teal-800 hover:text-teal-900 transition-colors"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
              <HeartHandshake className="size-5" aria-hidden="true" />
            </div>
            <span>CuidAgora</span>
          </Link>
          <div className="flex items-center gap-2">
            <AccessibilityMenu
              initial={{
                simplifiedMode: prefs.simplifiedMode,
                elderMode: prefs.elderMode,
                highContrast: prefs.highContrast,
                readAloud: prefs.readAloud,
              }}
            />
            <form action={signOutAction}>
              <button
                type="submit"
                className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="size-3.5 text-slate-500" aria-hidden="true" />
                <span>Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 pb-28 lg:grid-cols-[230px_1fr] lg:pb-10">
        <SideNav items={items} />
        <main id="conteudo" tabIndex={-1}>
          {children}
          <footer className="no-print mt-10 border-t border-slate-200 pt-4 text-xs sm:text-sm text-slate-500">
            <div className="flex items-start gap-2">
              <Shield className="size-4 text-teal-600 shrink-0 mt-0.5" aria-hidden="true" />
              <p>{SAFETY_NOTICE}</p>
            </div>
            <p className="mt-2 text-xs">
              <Link
                href="/perfil/privacidade"
                className="font-semibold text-teal-700 hover:text-teal-900 hover:underline"
              >
                Privacidade, Segurança e LGPD
              </Link>
            </p>
          </footer>
        </main>
      </div>

      <BottomNav items={items} />
    </>
  );
}
