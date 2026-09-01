import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Smile, SmilePlus } from "lucide-react";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { CheckinForm } from "@/features/care/components/record-forms";
import { getCheckin } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatLongDate, todayIso } from "@/lib/date";
import { MOOD_LABELS, type MoodValue } from "@/lib/domain";

export const metadata: Metadata = { title: "Check-in Diário — CuidAgora" };

export default async function CheckinPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const checkin = await getCheckin(user.id, dateIso);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/cuidados"
          className="inline-flex items-center gap-2 text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors"
        >
          <ArrowLeft className="size-4" />
          Voltar para Plano de Cuidados
        </Link>
      </div>

      <PageHeader
        icon={<Smile className="size-7 text-teal-700" />}
        title="Check-in Diário de Bem-estar"
        description={`${formatLongDate(dateIso)} — Avaliação simplificada do seu estado geral.`}
      />

      {user.preferences.readAloud ? (
        <SpeakButton
          text="Check-in de hoje. Como você está se sentindo? Escolha entre bem e disposto, normal e estável, mais ou menos, ou indisposto. Depois conte se sentiu dor e se conseguiu fazer seus cuidados."
          label="Ouvir instruções do check-in"
        />
      ) : null}

      {checkin ? (
        <Alert tone="success" title="Check-in de hoje já registrado">
          Estado atual registrado: <strong>{MOOD_LABELS[checkin.mood as MoodValue]}</strong>. Se desejar, você pode atualizar as informações no formulário abaixo.
        </Alert>
      ) : null}

      <Card>
        <CardTitle
          icon={<SmilePlus className="size-5 text-teal-700" />}
          description="Seus registros são protegidos e visíveis apenas para você e seus cuidadores autorizados."
        >
          Registro de Humor e Disposição
        </CardTitle>
        <CheckinForm
          defaults={
            checkin
              ? {
                  mood: checkin.mood,
                  hasPain: checkin.hasPain,
                  painNote: checkin.painNote,
                  didCare: checkin.didCare,
                  note: checkin.note,
                }
              : undefined
          }
        />
      </Card>
    </div>
  );
}
