import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit3, Pill } from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { MedicationForm } from "@/features/care/components/medication-forms";
import { getMedication } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar Medicamento — CuidAgora" };

export default async function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const medication = await getMedication(user.id, id);
  if (!medication) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Edit3 className="size-7 text-teal-700" />}
        title={`Editar: ${medication.name}`}
        description="Atualize horários, doses ou recomendações da receita médica."
      />
      <div>
        <Link
          href="/cuidados/medicamentos"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-900 hover:underline"
        >
          <ArrowLeft className="size-4" />
          Voltar para lista de medicamentos
        </Link>
      </div>
      <Card>
        <CardTitle icon={<Pill className="size-5 text-teal-700" />}>
          Parâmetros do medicamento
        </CardTitle>
        <MedicationForm
          medication={{
            id: medication.id,
            name: medication.name,
            dose: medication.dose,
            frequency: medication.frequency,
            notes: medication.notes,
            startDate: medication.startDate,
            endDate: medication.endDate,
            times: medication.times,
          }}
        />
      </Card>
    </div>
  );
}
