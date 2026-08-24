import type { Metadata } from "next";

import { PageHeader, Card, CardTitle } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { HydrationCard, TodayTasksCard } from "@/features/care/components/care-widgets";
import { CareTaskForm } from "@/features/care/components/medication-forms";
import { getHydrationTotal, listTasksForDate } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { todayIso } from "@/lib/date";

export const metadata: Metadata = { title: "Cuidados — CuidAgora" };

const AREAS = [
  { href: "/cuidados/medicamentos", icon: "💊", title: "Medicamentos", text: "Cadastre nomes, doses e horários." },
  { href: "/cuidados/medicoes", icon: "🩺", title: "Medições", text: "Pressão, glicemia e água." },
  { href: "/cuidados/check-in", icon: "😊", title: "Check-in diário", text: "Conte como você está hoje." },
  { href: "/cuidados/sintomas", icon: "📝", title: "Sintomas", text: "Anote o que você sentiu." },
];

export default async function CarePage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const [tasks, hydration] = await Promise.all([
    listTasksForDate(user.id, dateIso),
    getHydrationTotal(user.id, dateIso),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="💚"
        title="Cuidados"
        description="Tudo o que você combinou de fazer hoje, em um lugar só."
      />

      <TodayTasksCard tasks={tasks} dateIso={dateIso} />

      <section aria-labelledby="areas-cuidado">
        <h2 id="areas-cuidado" className="mb-3 text-2xl font-bold">
          Onde você quer registrar?
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {AREAS.map((area) => (
            <li key={area.href} className="card p-5">
              <p aria-hidden="true" className="text-3xl">
                {area.icon}
              </p>
              <h3 className="mt-2 text-lg font-bold">{area.title}</h3>
              <p className="mt-1 mb-3 text-[var(--color-ink-soft)]">{area.text}</p>
              <ButtonLink href={area.href} variant="secondary">
                Abrir {area.title.toLowerCase()}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </section>

      <HydrationCard totalMl={hydration} goalMl={user.preferences.hydrationGoalMl} />

      <Card>
        <CardTitle icon="➕" description="Ex.: caminhar, medir a pressão, tomar sol.">
          Adicionar um cuidado à rotina
        </CardTitle>
        <CareTaskForm />
      </Card>
    </div>
  );
}
