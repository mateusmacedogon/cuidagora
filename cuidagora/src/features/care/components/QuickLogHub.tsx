"use client";

import { useState } from "react";
import { Activity, Droplets, FileText, HeartPulse, Plus, Zap } from "lucide-react";
import { BloodPressureForm, GlucoseForm } from "./record-forms";
import { addHydrationAction } from "@/features/care/actions";

export function QuickLogHub() {
  const [activeTab, setActiveTab] = useState<"none" | "pressure" | "glucose" | "water">("none");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4.5 sm:p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <Zap className="size-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Registro Rápido no Painel
            </h3>
            <p className="text-xs text-slate-500">
              Adicione medições ou água em 1 toque sem sair da tela inicial
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "pressure" ? "none" : "pressure")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === "pressure"
                ? "bg-teal-600 text-white border-teal-600"
                : "bg-teal-50/70 text-teal-800 border-teal-200 hover:bg-teal-100/80"
            }`}
          >
            <Activity className="size-3.5" />
            + Pressão
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "glucose" ? "none" : "glucose")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === "glucose"
                ? "bg-amber-600 text-white border-amber-600"
                : "bg-amber-50/70 text-amber-800 border-amber-200 hover:bg-amber-100/80"
            }`}
          >
            <Activity className="size-3.5" />
            + Glicemia
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "water" ? "none" : "water")}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer border ${
              activeTab === "water"
                ? "bg-cyan-600 text-white border-cyan-600"
                : "bg-cyan-50/70 text-cyan-800 border-cyan-200 hover:bg-cyan-100/80"
            }`}
          >
            <Droplets className="size-3.5" />
            + Água
          </button>
        </div>
      </div>

      {activeTab === "pressure" && (
        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/60 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 mb-3">
            Aferição Rápida de Pressão Arterial
          </h4>
          <BloodPressureForm />
        </div>
      )}

      {activeTab === "glucose" && (
        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/60 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-3">
            Aferição Rápida de Glicemia
          </h4>
          <GlucoseForm />
        </div>
      )}

      {activeTab === "water" && (
        <div className="mt-4 pt-4 border-t border-slate-200 bg-slate-50/60 p-4 rounded-xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-800 mb-3">
            Adicionar Consumo de Água
          </h4>
          <div className="flex flex-wrap gap-2.5">
            {[200, 300, 500].map((amount) => (
              <form key={amount} action={addHydrationAction}>
                <input type="hidden" name="amountMl" value={amount} />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 min-h-10 rounded-xl border border-cyan-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-cyan-900 hover:bg-cyan-50 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  + {amount} ml (copo/garrafa)
                </button>
              </form>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
