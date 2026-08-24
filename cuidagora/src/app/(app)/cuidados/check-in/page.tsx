import type { Metadata } from "next";

import { SpeakButton } from "@/components/a11y/SpeakButton";
import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { CheckinForm } from "@/features/care/components/record-forms";
import { getCheckin } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";
import { formatLongDate, todayIso } from "@/lib/date";
import { MOOD_LABELS, type MoodValue } from "@/lib/domain";

export const metadata: Metadata = { title: "Check-in diário — CuidAgora" };

export default async function CheckinPage() {
  const user = await requireUser();
  const dateIso = todayIso();
  const checkin = await getCheckin(user.id, dateIso);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="😊"
        title="Check-in de hoje"
        description={`${formatLongDate(dateIso)} — leva menos de um minuto.`}
      />

      {user.preferences.readAloud ? (
        <SpeakButton
          text="Check-in de hoje. Como você está se sentindo? Escolha entre bem, normal, mais ou menos, e não estou bem. Depois conte se sentiu dor e se conseguiu fazer seus cuidados."
          label="Ouvir as perguntas"
        />
      ) : null}

      {checkin ? (
        <Alert tone="success" title="Você já fez o check-in de hoje">
          Registrado como: {MOOD_LABELS[checkin.mood as MoodValue]}. Pode alterar abaixo se quiser.
        </Alert>
      ) : null}

      <Card>
        <CardTitle icon="✍️" description="Suas respostas ficam guardadas só para você e para quem você autorizar.">
          Contar como estou
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
