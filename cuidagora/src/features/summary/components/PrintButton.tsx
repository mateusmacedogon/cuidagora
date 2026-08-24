"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print min-h-12 rounded-full border-2 border-[var(--color-brand)] bg-[var(--color-surface)] px-6 py-3 font-semibold text-[var(--color-brand-strong)]"
    >
      <span aria-hidden="true">🖨️ </span>
      Imprimir ou salvar em PDF
    </button>
  );
}
