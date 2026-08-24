import Link from "next/link";
import type { ReactNode } from "react";

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

      <header className="no-print sticky top-0 z-30 border-b border-[var(--color-line)] bg-[var(--color-surface)]/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link href="/inicio" className="flex items-center gap-2 text-xl font-extrabold text-[var(--color-brand-strong)]">
            <span aria-hidden="true">💚</span>
            CuidAgora
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
                className="min-h-11 rounded-full border-2 border-[var(--color-line)] px-4 py-2 text-sm font-semibold hover:bg-[var(--color-surface-muted)]"
              >
                <span aria-hidden="true">🚪 </span>Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 pb-28 lg:grid-cols-[240px_1fr] lg:pb-10">
        <SideNav items={items} />
        <main id="conteudo" tabIndex={-1}>
          {children}
          <footer className="no-print mt-10 border-t border-[var(--color-line)] pt-4 text-sm text-[var(--color-ink-soft)]">
            <p>
              <span aria-hidden="true">🛟 </span>
              {SAFETY_NOTICE}
            </p>
            <p className="mt-2">
              <Link href="/perfil/privacidade" className="font-semibold underline">
                Privacidade e seus dados
              </Link>
            </p>
          </footer>
        </main>
      </div>

      <BottomNav items={items} />
    </>
  );
}
