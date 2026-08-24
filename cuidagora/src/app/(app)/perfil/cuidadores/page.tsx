import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert, Badge, EmptyState } from "@/components/ui/Feedback";
import { revokeCaregiverAction } from "@/features/caregiver/actions";
import { CaregiverInviteForm, CaregiverPermissionsForm } from "@/features/caregiver/components/forms";
import { listMyCaregivers } from "@/features/caregiver/data";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/date";
import { PERMISSION_KEYS, PERMISSION_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Cuidadores — CuidAgora" };

export default async function CaregiversPage() {
  const user = await requireUser();
  const caregivers = await listMyCaregivers(user.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="🤝"
        title="Quem pode me acompanhar"
        description="Você decide exatamente o que cada pessoa consegue ver. Nada é compartilhado sem a sua autorização."
      />

      <Alert tone="info" title="Como funciona">
        A pessoa autorizada entra com a conta dela e vê apenas as informações que você marcou. Ela nunca pode
        alterar seus registros.
      </Alert>

      <Card>
        <CardTitle icon="👥" description={`${caregivers.length} pessoa(s) com acesso`}>
          Acessos ativos
        </CardTitle>

        {caregivers.length === 0 ? (
          <EmptyState
            icon="🤝"
            title="Ninguém tem acesso aos seus dados"
            description="Se quiser, você pode autorizar um familiar ou cuidador a ver parte das suas informações."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {caregivers.map((caregiver) => (
              <li key={caregiver.id} className="rounded-2xl border-2 border-[var(--color-line)] p-4">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold">{caregiver.caregiverName}</h3>
                    <p className="text-[var(--color-ink-soft)] break-words">{caregiver.caregiverEmail}</p>
                    <p className="text-sm text-[var(--color-ink-soft)]">
                      Acesso liberado em {formatDate(caregiver.createdAt)}
                    </p>
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {PERMISSION_KEYS.filter((key) => caregiver.permissions[key]).map((key) => (
                        <li key={key}>
                          <Badge tone="success" icon="✔️">
                            {PERMISSION_LABELS[key]}
                          </Badge>
                        </li>
                      ))}
                      {PERMISSION_KEYS.every((key) => !caregiver.permissions[key]) ? (
                        <li>
                          <Badge tone="neutral" icon="➖">
                            Sem nenhuma permissão marcada
                          </Badge>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <form action={revokeCaregiverAction}>
                    <input type="hidden" name="accessId" value={caregiver.id} />
                    <button
                      type="submit"
                      className="min-h-12 rounded-full border-2 border-[var(--color-alert)] px-4 py-2 font-semibold text-[var(--color-alert)]"
                    >
                      🚫 Remover acesso
                    </button>
                  </form>
                </div>

                <details className="rounded-2xl bg-[var(--color-surface-muted)] p-3">
                  <summary className="cursor-pointer font-semibold">Alterar o que essa pessoa vê</summary>
                  <div className="mt-3">
                    <CaregiverPermissionsForm accessId={caregiver.id} permissions={caregiver.permissions} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon="➕">Autorizar uma nova pessoa</CardTitle>
        <CaregiverInviteForm />
      </Card>

      <p>
        <Link href="/perfil" className="font-semibold underline">
          ← Voltar para o perfil
        </Link>
      </p>
    </div>
  );
}
