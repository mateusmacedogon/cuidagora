import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Minus, UserPlus, Users, UserX } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert, Badge, EmptyState } from "@/components/ui/Feedback";
import { revokeCaregiverAction } from "@/features/caregiver/actions";
import { CaregiverInviteForm, CaregiverPermissionsForm } from "@/features/caregiver/components/forms";
import { listMyCaregivers } from "@/features/caregiver/data";
import { requireUser } from "@/lib/auth/session";
import { formatDate } from "@/lib/date";
import { PERMISSION_KEYS, PERMISSION_LABELS } from "@/lib/domain";

export const metadata: Metadata = { title: "Cuidadores Autorizados — CuidAgora" };

export default async function CaregiversPage() {
  const user = await requireUser();
  const caregivers = await listMyCaregivers(user.id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Users className="size-7 text-teal-700" />}
        title="Gestão de Cuidadores Autorizados"
        description="Controle rigoroso e granular de quem possui autorização para visualizar seu histórico e cuidados diários."
      />

      <Alert tone="info" title="Controle e Privacidade de Dados">
        A pessoa autorizada acessa exclusivamente as categorias de dados selecionadas por você, em modo de apenas leitura. Ela não tem permissão para alterar, criar ou excluir seus registros.
      </Alert>

      <Card>
        <CardTitle
          icon={<Users className="size-5 text-teal-700" />}
          description={`${caregivers.length} pessoa(s) com autorização ativa`}
        >
          Acessos Ativos
        </CardTitle>

        {caregivers.length === 0 ? (
          <EmptyState
            icon={<Users className="size-8 text-teal-600" />}
            title="Nenhum cuidador vinculado no momento"
            description="Caso queira que um familiar ou profissional acompanhe seus registros, utilize o formulário de autorização abaixo."
          />
        ) : (
          <ul className="flex flex-col gap-4">
            {caregivers.map((caregiver) => (
              <li
                key={caregiver.id}
                className="rounded-xl border border-slate-200 bg-white p-4.5 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">{caregiver.caregiverName}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 break-words">{caregiver.caregiverEmail}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Autorização concedida em {formatDate(caregiver.createdAt)}
                    </p>
                    <ul className="mt-2.5 flex flex-wrap gap-1.5">
                      {PERMISSION_KEYS.filter((key) => caregiver.permissions[key]).map((key) => (
                        <li key={key}>
                          <Badge tone="success" icon={<Check className="size-3" />}>
                            {PERMISSION_LABELS[key]}
                          </Badge>
                        </li>
                      ))}
                      {PERMISSION_KEYS.every((key) => !caregiver.permissions[key]) ? (
                        <li>
                          <Badge tone="neutral" icon={<Minus className="size-3" />}>
                            Nenhum módulo autorizado
                          </Badge>
                        </li>
                      ) : null}
                    </ul>
                  </div>
                  <form action={revokeCaregiverAction}>
                    <input type="hidden" name="accessId" value={caregiver.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 min-h-9 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      <UserX className="size-3.5" />
                      Revogar acesso
                    </button>
                  </form>
                </div>

                <details className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 mt-3">
                  <summary className="cursor-pointer text-xs sm:text-sm font-bold text-teal-800 hover:underline">
                    Editar permissões de visualização deste cuidador
                  </summary>
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <CaregiverPermissionsForm accessId={caregiver.id} permissions={caregiver.permissions} />
                  </div>
                </details>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <CardTitle icon={<UserPlus className="size-5 text-teal-700" />}>
          Autorizar novo cuidador ou familiar
        </CardTitle>
        <CaregiverInviteForm />
      </Card>

      <div>
        <Link
          href="/perfil"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para o perfil
        </Link>
      </div>
    </div>
  );
}
