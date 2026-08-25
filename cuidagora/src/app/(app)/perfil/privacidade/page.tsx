import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Database,
  Lock,
  ShieldCheck,
  Trash2,
  Users,
} from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Alert } from "@/components/ui/Feedback";
import { DeleteAccountForm } from "@/features/account/components/DeleteAccountForm";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Privacidade e Proteção de Dados (LGPD) — CuidAgora" };

const STORED_DATA = [
  "Identificação de conta: Nome completo e e-mail (senhas protegidas via criptografia scrypt com salt individual).",
  "Registros de prescrições: Medicamentos cadastrados, dosagens e horários de tomada.",
  "Histórico de adesão: Cuidados diários concluídos e respectivos registros de data/hora.",
  "Check-ins e sintomas: Registros de humor, dores e notas de áudio/texto.",
  "Sinais vitais: Leituras pontuais de pressão arterial, glicemia capilar e hidratação.",
  "Agendamentos: Consultas médicas agendadas e cadernos de perguntas para o profissional.",
  "Acessibilidade e usabilidade: Preferências salvas de tipografia, contraste e modo simplificado.",
  "Gestão de acessos: Relação de cuidadores autorizados e mapa de permissões granulares.",
];

export default async function PrivacyPage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<Lock className="size-7 text-teal-700" />}
        title="Privacidade, Segurança e LGPD"
        description="Diretrizes de proteção de dados, controle de acessos e direito à eliminação definitiva."
      />

      <Card>
        <CardTitle icon={<Database className="size-5 text-teal-700" />}>
          Dados Coletados e Armazenados
        </CardTitle>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700">
          {STORED_DATA.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle icon={<ShieldCheck className="size-5 text-teal-700" />}>
          Padrões de Segurança Aplicados
        </CardTitle>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-700 mb-4">
          <li>Criptografia de credenciais utilizando derivação de chaves segura via scrypt.</li>
          <li>Sessões autenticadas via cookies HttpOnly com proteção SameSite contra CSRF.</li>
          <li>Autorização em camada de servidor com isolamento estrito por ID de usuário em todas as consultas.</li>
          <li>Princípio do menor privilégio em compartilhamentos com cuidadores.</li>
          <li>Consultas parametrizadas com proteção nativa contra injeção SQL.</li>
          <li>Inexistência de logs de aplicação contendo conteúdo sensível de saúde.</li>
        </ul>
        <Alert tone="neutral" title="Conformidade LGPD">
          O CuidAgora foi arquitetado com base nos princípios de finalidade, minimização e segurança da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
        </Alert>
      </Card>

      <Card>
        <CardTitle icon={<Users className="size-5 text-teal-700" />}>
          Compartilhamento de Registros
        </CardTitle>
        <p className="text-sm text-slate-700 leading-relaxed">
          Nenhum dado é compartilhado publicamente ou com terceiros não autorizados. Somente pessoas expressamente vinculadas em{" "}
          <Link href="/perfil/cuidadores" className="font-bold text-teal-700 hover:text-teal-900 hover:underline">
            Quem pode me acompanhar
          </Link>{" "}
          possuem visualização restrita aos módulos selecionados.
        </p>
      </Card>

      <Card className="border-rose-200 bg-rose-50/40">
        <CardTitle
          icon={<Trash2 className="size-5 text-rose-600" />}
          description="Direito de eliminação definitiva — Ação irreversível."
        >
          Excluir Conta e Apagar Todos os Dados
        </CardTitle>
        <Alert tone="danger" title="Aviso Importante de Exclusão">
          Ao confirmar a exclusão, todos os seus dados clínicos, medicamentos, medições, histórico e permissões vinculadas serão permanentemente destruídos dos nossos bancos de dados.
        </Alert>
        <div className="mt-4">
          <DeleteAccountForm />
        </div>
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
