"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, Phone, PhoneCall, ShieldAlert, User } from "lucide-react";

export function EmergencyCard({
  caregiverName,
  caregiverEmail,
}: {
  caregiverName?: string;
  caregiverEmail?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section
      aria-labelledby="cartao-emergencia-titulo"
      className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 sm:p-5 shadow-2xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h3 id="cartao-emergencia-titulo" className="text-base sm:text-lg font-bold text-rose-950">
              Cartão de Emergência & Apoio Rápido
            </h3>
            <p className="text-xs text-rose-700">
              Em caso de mal-estar súbito ou emergência clínica
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:192"
            className="inline-flex items-center gap-1.5 min-h-10 rounded-xl bg-rose-600 px-4 py-2 text-xs sm:text-sm font-extrabold text-white shadow-xs hover:bg-rose-700 transition-colors"
          >
            <PhoneCall className="size-4 animate-pulse" />
            Ligar SAMU 192
          </a>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="inline-flex items-center justify-center size-10 rounded-xl border border-rose-300 bg-white text-rose-800 hover:bg-rose-100 transition-colors cursor-pointer"
            aria-expanded={open}
            aria-label={open ? "Ocultar contatos de emergência" : "Ver contatos de apoio e emergência"}
            title={open ? "Ocultar contatos" : "Ver contatos de apoio"}
          >
            {open ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-rose-200/80 grid gap-3 sm:grid-cols-2 text-xs sm:text-sm text-slate-800">
          <div className="rounded-xl border border-rose-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold mb-1">
              <Phone className="size-3.5" />
              <span>Serviços de Resgate</span>
            </div>
            <ul className="space-y-1 text-slate-600 text-xs">
              <li><strong>SAMU:</strong> 192 (Urgência e Emergência)</li>
              <li><strong>Bombeiros:</strong> 193 (Resgate)</li>
              <li><strong>Disque Saúde (SUS):</strong> 136</li>
            </ul>
          </div>

          <div className="rounded-xl border border-rose-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-900 font-bold mb-1">
              <User className="size-3.5" />
              <span>Cuidador Principal Vinculado</span>
            </div>
            {caregiverName ? (
              <div className="text-xs text-slate-700">
                <p className="font-bold">{caregiverName}</p>
                <p className="text-slate-500">{caregiverEmail}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">
                Nenhum cuidador vinculado. Adicione em Perfil → Quem pode me acompanhar.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
