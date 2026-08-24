import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { DeleteAccountForm } from "@/features/account/components/DeleteAccountForm";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Privacidade — CuidAgora" };

const STORED_DATA = [
  "Nome e e-mail da conta (a senha é guardada apenas de forma criptografada).",
  "Medicamentos, doses e horários que você mesmo cadastrou.",
  "Cuidados do dia e o horário em que você marcou cada um como concluído.",
  "Check-ins diários, sintomas e observações escritas ou ditadas por você.",
  "Medições de pressão, glicemia e hidratação.",
  "Consultas, perguntas e orientações que você cadastrou.",
  "Preferências de acessibilidade (letras maiores, contraste, modo simplificado).",
  "Lista de cuidadores autorizados e as permissões de cada um.",
];

export default async function PrivacyPage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon="🔒"
        title="Privacidade e seus dados"
        description="Transparência sobre o que guardamos e controle total para apagar."
      />

      <Card>
        <CardTitle icon="🗂️">O que o CuidAgora guarda</CardTitle>
        <ul className="list-disc pl-5">
          {STORED_DATA.map((item) => (
            <li key={item} className="mb-1">
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle icon="🛡️">Como protegemos</CardTitle>
        <ul className="list-disc pl-5">
          <li className="mb-1">Senha guardada com função de derivação lenta (scrypt) — nunca em texto puro.</li>
          <li className="mb-1">Sessão em cookie HttpOnly, com SameSite estrito o suficiente para reduzir CSRF.</li>
          <li className="mb-1">Toda leitura e escrita é verificada no servidor e sempre limitada ao dono dos dados.</li>
          <li className="mb-1">Cuidadores recebem somente as permissões marcadas por você (menor privilégio).</li>
          <li className="mb-1">Consultas ao banco são parametrizadas, evitando injeção de SQL.</li>
          <li className="mb-1">Nenhum registro de log guarda conteúdo de saúde.</li>
        </ul>
        <Alert tone="neutral" title="Sobre a LGPD">
          O CuidAgora foi construído seguindo princípios da LGPD (finalidade, minimização, transparência e
          eliminação). Isso não garante, por si só, conformidade legal: uma operação real exige avaliação
          jurídica, contrato de tratamento de dados e política de privacidade publicada.
        </Alert>
      </Card>

      <Card>
        <CardTitle icon="🤝">Compartilhamento</CardTitle>
        <p className="mb-3">
          Nada é compartilhado automaticamente. Só quem você autorizar em{" "}
          <Link href="/perfil/cuidadores" className="font-semibold underline">
            Quem pode me acompanhar
          </Link>{" "}
          consegue ver seus dados, e apenas nos itens que você marcou.
        </p>
      </Card>

      <Card className="border-2 border-[var(--color-alert)]">
        <CardTitle icon="🗑️" description="Esta ação não pode ser desfeita.">
          Excluir minha conta e meus dados
        </CardTitle>
        <Alert tone="danger" title="Atenção">
          Ao confirmar, sua conta, medicamentos, cuidados, medições, sintomas, consultas, resumos e
          compartilhamentos serão apagados definitivamente.
        </Alert>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
      </Card>

      <p>
        <Link href="/perfil" className="font-semibold underline">
          ← Voltar para o perfil
        </Link>
      </p>
    </div>
  );
}
