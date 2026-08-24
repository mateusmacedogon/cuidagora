"use client";

import { useEffect, useState, useTransition } from "react";

import { saveAccessibilityPreferences } from "@/features/preferences/actions";

type Prefs = {
  simplifiedMode: boolean;
  elderMode: boolean;
  highContrast: boolean;
  readAloud: boolean;
};

const OPTIONS: { key: keyof Prefs; label: string; icon: string; description: string }[] = [
  {
    key: "elderMode",
    label: "Letras e botões maiores",
    icon: "🔎",
    description: "Aumenta o tamanho de tudo na tela.",
  },
  {
    key: "highContrast",
    label: "Alto contraste",
    icon: "🌗",
    description: "Cores mais fortes para enxergar melhor.",
  },
  {
    key: "simplifiedMode",
    label: "Modo simplificado",
    icon: "🧩",
    description: "Mostra só o essencial do dia.",
  },
  {
    key: "readAloud",
    label: "Botões de ouvir",
    icon: "🔊",
    description: "Exibe o botão de leitura em voz alta.",
  },
];

export function AccessibilityMenu({ initial }: { initial: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.elder = String(prefs.elderMode);
    root.dataset.contrast = String(prefs.highContrast);
    root.dataset.simple = String(prefs.simplifiedMode);
  }, [prefs]);

  function toggle(key: keyof Prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    startTransition(async () => {
      await saveAccessibilityPreferences({ [key]: next[key] });
    });
  }

  return (
    <div className="relative no-print">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="accessibility-panel"
        className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-surface)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-strong)] hover:bg-[var(--color-brand-soft)]"
      >
        <span aria-hidden="true">♿</span>
        Acessibilidade
      </button>

      {open ? (
        <div
          id="accessibility-panel"
          className="absolute right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl border-2 border-[var(--color-line)] bg-[var(--color-surface)] p-4 shadow-xl"
        >
          <h2 className="mb-1 text-lg font-bold">Deixar mais fácil de usar</h2>
          <p className="mb-3 text-sm text-[var(--color-ink-soft)]">
            As mudanças são salvas na sua conta.
          </p>
          <ul className="flex flex-col gap-2">
            {OPTIONS.map((option) => {
              const active = prefs[option.key];
              return (
                <li key={option.key}>
                  <button
                    type="button"
                    onClick={() => toggle(option.key)}
                    aria-pressed={active}
                    className={`flex w-full items-start gap-3 rounded-xl border-2 p-3 text-left ${
                      active
                        ? "border-[var(--color-brand)] bg-[var(--color-brand-soft)]"
                        : "border-[var(--color-line)] bg-[var(--color-surface)]"
                    }`}
                  >
                    <span aria-hidden="true" className="text-xl">
                      {option.icon}
                    </span>
                    <span className="flex-1">
                      <span className="block font-semibold">{option.label}</span>
                      <span className="block text-sm text-[var(--color-ink-soft)]">
                        {option.description}
                      </span>
                    </span>
                    <span className="text-sm font-bold">{active ? "Ligado ✅" : "Desligado"}</span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p aria-live="polite" className="mt-3 text-sm text-[var(--color-ink-soft)]">
            {pending ? "Salvando preferências…" : "Preferências salvas automaticamente."}
          </p>
        </div>
      ) : null}
    </div>
  );
}
