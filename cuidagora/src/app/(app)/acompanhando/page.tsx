import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge, EmptyState } from "@/components/ui/Feedback";
import { requireUser } from "@/lib/auth/session";
import { listSharedWithMe } from "@/lib/permissions";
import { PERMISSION_KEYS, PERMISSION_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Pessoas que acompanho — CuidAgora" };

export default async function CaregiverHomePage() {
  const user = await requireUser();
  const people = await listSharedWithMe(user);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="👀"
        title="Pessoas que acompanho"
        description="Aqui aparecem apenas as pessoas que autorizaram você, e somente o que elas liberaram."
      />

      <Card>
        <CardTitle icon="👥">Acessos recebidos</CardTitle>
        {people.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="Ninguém compartilhou dados com você ainda"
            description="Peça para a pessoa abrir o CuidAgora, ir em Perfil → Quem pode me acompanhar e liberar o seu e-mail."
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {people.map((person) => (
              <li key={person.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                <h3 className="text-lg font-bold">{person.ownerName}</h3>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {PERMISSION_KEYS.filter((key) => person.permissions[key]).map((key) => (
                    <li key={key}>
                      <Badge tone="success" icon="✔️">
                        {PERMISSION_LABELS[key]}
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3">
                  <Link
                    href={`/acompanhando/${person.ownerId}`}
                    className="inline-block min-h-12 rounded-full bg-[var(--color-brand)] px-5 py-3 font-semibold text-white"
                  >
                    Ver informações de {person.ownerName}
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
