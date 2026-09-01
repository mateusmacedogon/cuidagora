"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print inline-flex min-h-11 items-center gap-2 rounded-xl border border-teal-200 bg-teal-50/80 px-4 py-2 text-sm font-semibold text-teal-800 hover:bg-teal-100/90 transition-colors shadow-2xs cursor-pointer"
    >
      <Printer className="size-4 text-teal-700" aria-hidden="true" />
      <span>Imprimir ou exportar PDF</span>
    </button>
  );
}
