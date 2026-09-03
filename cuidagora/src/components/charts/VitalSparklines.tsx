import type { Measurement } from "@/db/schema";
import { formatDateTime, formatTime } from "@/lib/date";

type Point = {
  x: number;
  y: number;
  label: string;
  value: number;
  date: Date;
};

/**
 * Componente SVG leve para exibição gráfica de curvas de pressão arterial.
 * Mostra a evolução da pressão sistólica (máxima) e diastólica (mínima).
 */
export function BloodPressureChart({
  measurements,
}: {
  measurements: Measurement[];
}) {
  // Ordena cronologicamente (do mais antigo para o mais recente)
  const items = [...measurements]
    .filter((m) => typeof m.systolic === "number" && typeof m.diastolic === "number")
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());

  if (items.length === 0) return null;

  const width = 600;
  const height = 220;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Escala Y: valor mínimo 50, máximo 200 (ou o valor máximo observado + 10)
  const maxVal = Math.max(180, ...items.map((m) => m.systolic ?? 120)) + 10;
  const minVal = Math.min(50, ...items.map((m) => m.diastolic ?? 80)) - 10;

  const getY = (val: number) =>
    padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  const getX = (index: number) =>
    padding.left + (items.length === 1 ? chartWidth / 2 : (index / (items.length - 1)) * chartWidth);

  const systolicPoints = items.map((m, i) => ({
    x: getX(i),
    y: getY(m.systolic!),
    value: m.systolic!,
    date: new Date(m.measuredAt),
    label: `${m.systolic} mmHg`,
  }));

  const diastolicPoints = items.map((m, i) => ({
    x: getX(i),
    y: getY(m.diastolic!),
    value: m.diastolic!,
    date: new Date(m.measuredAt),
    label: `${m.diastolic} mmHg`,
  }));

  const systolicPath = systolicPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const diastolicPath = diastolicPoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Médias
  const avgSys = Math.round(items.reduce((acc, cur) => acc + (cur.systolic ?? 0), 0) / items.length);
  const avgDia = Math.round(items.reduce((acc, cur) => acc + (cur.diastolic ?? 0), 0) / items.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Curva de Pressão Arterial
          </h4>
          <p className="text-xs text-slate-500">
            Histórico das últimas {items.length} aferições realizadas
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-teal-600" />
            <span className="text-slate-700">Sistólica (Média: <strong>{avgSys}</strong>)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-full bg-blue-600" />
            <span className="text-slate-700">Diastólica (Média: <strong>{avgDia}</strong>)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[340px] h-auto text-xs"
          role="img"
          aria-label="Gráfico de evolução da pressão arterial sistólica e diastólica"
        >
          {/* Faixa de referência saudável (120 / 80) */}
          <line
            x1={padding.left}
            y1={getY(120)}
            x2={width - padding.right}
            y2={getY(120)}
            stroke="#0d9488"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <text x={padding.left - 6} y={getY(120) + 4} textAnchor="end" fill="#0d9488" className="text-[10px] font-bold">
            120
          </text>

          <line
            x1={padding.left}
            y1={getY(80)}
            x2={width - padding.right}
            y2={getY(80)}
            stroke="#2563eb"
            strokeDasharray="4 4"
            strokeOpacity="0.4"
            strokeWidth="1.5"
          />
          <text x={padding.left - 6} y={getY(80) + 4} textAnchor="end" fill="#2563eb" className="text-[10px] font-bold">
            80
          </text>

          {/* Linha da Pressão Sistólica */}
          {items.length > 1 && (
            <path d={systolicPath} fill="none" stroke="#0d9488" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Linha da Pressão Diastólica */}
          {items.length > 1 && (
            <path d={diastolicPath} fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Pontos Sistólica */}
          {systolicPoints.map((p, i) => (
            <g key={`sys-${i}`} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="#0f172a"
                className="text-[10px] font-extrabold"
              >
                {p.value}
              </text>
            </g>
          ))}

          {/* Pontos Diastólica */}
          {diastolicPoints.map((p, i) => (
            <g key={`dia-${i}`} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="5" fill="#2563eb" stroke="#ffffff" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y + 16}
                textAnchor="middle"
                fill="#0f172a"
                className="text-[10px] font-extrabold"
              >
                {p.value}
              </text>
            </g>
          ))}

          {/* Rótulos de data no eixo X */}
          {items.map((m, i) => {
            const x = getX(i);
            const d = new Date(m.measuredAt);
            const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fill="#64748b"
                className="text-[10px] font-semibold"
              >
                {dateStr}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/**
 * Componente SVG leve para exibição da curva de glicemia capilar.
 */
export function GlucoseChart({
  measurements,
}: {
  measurements: Measurement[];
}) {
  const items = [...measurements]
    .filter((m) => m.value !== null && m.value !== "" && !isNaN(Number(m.value)))
    .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime());

  if (items.length === 0) return null;

  const width = 600;
  const height = 190;
  const padding = { top: 20, right: 30, bottom: 40, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const maxVal = Math.max(160, ...items.map((m) => Number(m.value))) + 15;
  const minVal = Math.min(60, ...items.map((m) => Number(m.value))) - 10;

  const getY = (val: number) =>
    padding.top + chartHeight - ((val - minVal) / (maxVal - minVal)) * chartHeight;

  const getX = (index: number) =>
    padding.left + (items.length === 1 ? chartWidth / 2 : (index / (items.length - 1)) * chartWidth);

  const points = items.map((m, i) => ({
    x: getX(i),
    y: getY(Number(m.value)),
    value: Number(m.value),
    date: new Date(m.measuredAt),
    context: m.context || "",
  }));

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const avg = Math.round(items.reduce((acc, cur) => acc + Number(cur.value), 0) / items.length);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <h4 className="text-sm sm:text-base font-bold text-slate-900">
            Curva de Glicemia Capilar (mg/dL)
          </h4>
          <p className="text-xs text-slate-500">
            Média do período: <strong>{avg} mg/dL</strong> · Faixa alvo sugerida: 70 a 140 mg/dL
          </p>
        </div>
      </div>

      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full min-w-[340px] h-auto text-xs"
          role="img"
          aria-label="Gráfico de evolução da glicemia"
        >
          {/* Linha de referência 100 mg/dL */}
          <line
            x1={padding.left}
            y1={getY(100)}
            x2={width - padding.right}
            y2={getY(100)}
            stroke="#f59e0b"
            strokeDasharray="4 4"
            strokeOpacity="0.5"
            strokeWidth="1.5"
          />
          <text x={padding.left - 6} y={getY(100) + 4} textAnchor="end" fill="#f59e0b" className="text-[10px] font-bold">
            100
          </text>

          {/* Linha da Glicemia */}
          {items.length > 1 && (
            <path d={path} fill="none" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          )}

          {/* Pontos */}
          {points.map((p, i) => (
            <g key={`glu-${i}`}>
              <circle cx={p.x} cy={p.y} r="5" fill="#d97706" stroke="#ffffff" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y - 8}
                textAnchor="middle"
                fill="#0f172a"
                className="text-[10px] font-extrabold"
              >
                {p.value}
              </text>
            </g>
          ))}

          {/* Rótulos do eixo X */}
          {items.map((m, i) => {
            const x = getX(i);
            const d = new Date(m.measuredAt);
            const dateStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
            return (
              <text
                key={`label-${i}`}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fill="#64748b"
                className="text-[10px] font-semibold"
              >
                {dateStr}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
