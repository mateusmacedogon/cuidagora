"use client";

import { useEffect, useState, useTransition, type ElementType } from "react";
import {
  Accessibility,
  Check,
  Contrast,
  LayoutGrid,
  Volume2,
  ZoomIn,
} from "lucide-react";

import { saveAccessibilityPreferences } from "@/features/preferences/actions";

type Prefs = {
  simplifiedMode: boolean;
  elderMode: boolean;
  highContrast: boolean;
  readAloud: boolean;
};

const OPTIONS: {
  key: keyof Prefs;
  label: string;
  icon: ElementType;
  description: string;
}[] = [
  {
    key: "elderMode",
    label: "Letras e botões maiores",
    icon: ZoomIn,
    description: "Aumenta o tamanho dos textos e alvos de toque na tela.",
  },
  {
    key: "highContrast",
    label: "Alto contraste",
    icon: Contrast,
    description: "Cores e bordas mais nítidas para melhorar a visibilidade.",
  },
  {
    key: "simplifiedMode",
    label: "Modo simplificado",
    icon: LayoutGrid,
    description: "Exibe apenas as funções essenciais para a rotina diária.",
  },
  {
    key: "readAloud",
    label: "Recurso de áudio",
    icon: Volume2,
    description: "Habilita os botões para leitura do conteúdo em voz alta.",
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
        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-3.5 py-1.5 text-sm font-semibold text-teal-900 transition-colors hover:bg-teal-100/90 shadow-2xs cursor-pointer"
      >
        <Accessibility className="size-4 text-teal-700" aria-hidden="true" />
        <span>Acessibilidade</span>
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="accessibility-panel"
            className="absolute right-0 z-50 mt-2 w-84 max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5"
          >
            <div className="mb-3">
              <h2 className="text-base font-bold text-slate-900">Ajustes de Acessibilidade</h2>
              <p className="text-xs text-slate-500">
                Suas preferências são salvas automaticamente na sua conta.
              </p>
            </div>
            <ul className="flex flex-col gap-2">
              {OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = prefs[option.key];
                return (
                  <li key={option.key}>
                    <button
                      type="button"
                      onClick={() => toggle(option.key)}
                      aria-pressed={active}
                      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                        active
                          ? "border-teal-300 bg-teal-50/70"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <div
                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                          active ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </div>
                      <span className="flex-1">
                        <span className="block text-sm font-bold text-slate-900 leading-tight">
                          {option.label}
                        </span>
                        <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                          {option.description}
                        </span>
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${
                          active
                            ? "bg-teal-100 text-teal-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {active ? (
                          <>
                            <Check className="size-3" aria-hidden="true" /> Ativo
                          </>
                        ) : (
                          "Inativo"
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p aria-live="polite" className="mt-3 text-xs text-center font-medium text-slate-400">
              {pending ? "Salvando alterações…" : "Tudo pronto e sincronizado."}
            </p>
          </div>
        </>
      ) : null}
    </div>
  );
}
