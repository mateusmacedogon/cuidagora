import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Eye, Users } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/Feedback";
import { requireUser } from "@/lib/auth/session";
import { listSharedWithMe } from "@/lib/permissions";
import { PERMISSION_KEYS, PERMISSION_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Pessoas que Acompanho — CuidAgora" };

export default async function CaregiverHomePage() {
  const user = await requireUser();
  const people = await listSharedWithMe(user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Eye className="size-7 text-teal-700" />}
        title="Pacientes e Familiares que Acompanho"
        description="Painel de visualização autorizada. Exibe apenas as seções e dados previamente liberados por cada paciente."
      />

      <Card>
        <CardTitle icon={<Users className="size-5 text-teal-700" />}>
          Compartilhamentos Ativos
        </CardTitle>
        {people.length === 0 ? (
          <EmptyState
            icon={<Users className="size-8 text-teal-600" />}
            title="Nenhum paciente compartilhou dados com você"
            description="Para acompanhar alguém, solicite que a pessoa acesse Perfil → Quem pode me acompanhar e adicione o seu e-mail cadastrado."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {people.map((person) => (
              <li
                key={person.id}
                className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{person.ownerName}</h3>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {PERMISSION_KEYS.filter((key) => person.permissions[key]).map((key) => (
                    <li key={key}>
                      <Badge tone="success" icon={<Check className="size-3" />}>
                        {PERMISSION_LABELS[key]}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <div className="mt-4">
                  <Link
                    href={`/acompanhando/${person.ownerId}`}
                    className="inline-flex items-center gap-1.5 min-h-9 rounded-lg bg-teal-600 px-4 py-2 text-xs sm:text-sm font-bold text-white hover:bg-teal-700 transition-colors cursor-pointer shadow-xs"
                  >
                    Acessar painel de {person.ownerName}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
