import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { MedicationForm } from "@/features/care/components/medication-forms";
import { getMedication } from "@/features/care/data";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Editar medicamento — CuidAgora" };

export default async function EditMedicationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const medication = await getMedication(user.id, id);
  if (!medication) notFound();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon="✏️" title={`Editar ${medication.name}`} description="Altere apenas o que mudou na sua receita." />
      <Link href="/cuidados/medicamentos" className="font-semibold underline">
        ← Voltar para meus medicamentos
      </Link>
      <Card>
        <CardTitle icon="💊">Dados do medicamento</CardTitle>
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
