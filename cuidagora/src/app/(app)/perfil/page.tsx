import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Droplets,
  Eye,
  Lock,
  Minus,
  ShieldCheck,
  Sliders,
  User,
  Users,
} from "lucide-react";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Feedback";
import { HydrationGoalForm } from "@/features/care/components/record-forms";
import { listMyCaregivers } from "@/features/caregiver/data";
import { listSharedWithMe } from "@/lib/permissions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Meu Perfil e Configurações — CuidAgora" };

const LINKS = [
  {
    href: "/perfil/cuidadores",
    icon: Users,
    title: "Quem pode me acompanhar",
    text: "Controle de permissões granulares e cuidadores autorizados.",
    color: "bg-teal-50 text-teal-700 border-teal-200",
  },
  {
    href: "/perfil/orientacoes",
    icon: ShieldCheck,
    title: "Orientações do Semáforo Clínico",
    text: "Cadastre limites médicos para alertas preventivos e urgentes.",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    href: "/perfil/privacidade",
    icon: Lock,
    title: "Privacidade e Segurança (LGPD)",
    text: "Gerencie consentimentos, exportação de dados e exclusão de conta.",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    href: "/acompanhando",
    icon: Eye,
    title: "Pessoas que Acompanho",
    text: "Acesse registros compartilhados por outros pacientes com você.",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
];

export default async function ProfilePage() {
  const user = await requireUser();
  const [caregivers, sharedWithMe] = await Promise.all([
    listMyCaregivers(user.id),
    listSharedWithMe(user),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={<User className="size-7 text-teal-700" />}
        title="Meu Perfil e Preferências"
        description="Gerenciamento de dados cadastrais, acessibilidade e compartilhamento familiar."
      />

      <Card>
        <CardTitle icon={<User className="size-5 text-teal-700" />}>
          Dados do Usuário
        </CardTitle>
        <dl className="grid gap-3.5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Cadastrado</dt>
            <dd className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">E-mail Principal</dt>
            <dd className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 break-words">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Perfil de Utilização</dt>
            <dd className="mt-1">
              <Badge
                tone="info"
                icon={user.accountType === "caregiver" ? <Users className="size-3" /> : <User className="size-3" />}
              >
                {user.accountType === "caregiver" ? "Modo Cuidador" : "Paciente / Titular"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-500">Vínculos Ativos</dt>
            <dd className="text-sm font-semibold text-slate-700 mt-1">
              {caregivers.length} cuidador(es) com acesso · Acompanhando {sharedWithMe.length} pessoa(s)
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardTitle
          icon={<Sliders className="size-5 text-teal-700" />}
          description="Ajuste os parâmetros de visualização através do menu 'Acessibilidade' no topo."
        >
          Recursos de Acessibilidade Ativos
        </CardTitle>
        <ul className="flex flex-col gap-2">
          <li>
            <Badge
              tone={user.preferences.elderMode ? "success" : "neutral"}
              icon={user.preferences.elderMode ? <Check className="size-3" /> : <Minus className="size-3" />}
            >
              Tipografia e controles ampliados (Modo Idoso): {user.preferences.elderMode ? "Ativo" : "Inativo"}
            </Badge>
          </li>
          <li>
            <Badge
              tone={user.preferences.highContrast ? "success" : "neutral"}
              icon={user.preferences.highContrast ? <Check className="size-3" /> : <Minus className="size-3" />}
            >
              Modo de alto contraste: {user.preferences.highContrast ? "Ativo" : "Inativo"}
            </Badge>
          </li>
          <li>
            <Badge
              tone={user.preferences.simplifiedMode ? "success" : "neutral"}
              icon={user.preferences.simplifiedMode ? <Check className="size-3" /> : <Minus className="size-3" />}
            >
              Navegação simplificada essencial: {user.preferences.simplifiedMode ? "Ativo" : "Inativo"}
            </Badge>
          </li>
          <li>
            <Badge
              tone={user.preferences.readAloud ? "success" : "neutral"}
              icon={user.preferences.readAloud ? <Check className="size-3" /> : <Minus className="size-3" />}
            >
              Leitura por voz de resumos: {user.preferences.readAloud ? "Ativo" : "Inativo"}
            </Badge>
          </li>
        </ul>
      </Card>

      <Card>
        <CardTitle icon={<Droplets className="size-5 text-teal-700" />}>
          Meta Diária de Hidratação
        </CardTitle>
        <HydrationGoalForm current={user.preferences.hydrationGoalMl} />
      </Card>

      <section aria-labelledby="mais-opcoes" className="space-y-3">
        <h2 id="mais-opcoes" className="text-lg sm:text-xl font-bold text-slate-900">
          Gerenciamento e Configurações Avançadas
        </h2>
        <ul className="grid gap-3.5 sm:grid-cols-2">
          {LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <li
                key={link.href}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-2xs transition-all hover:border-teal-300 hover:shadow-sm"
              >
                <div>
                  <div
                    className={`flex size-11 items-center justify-center rounded-xl border ${link.color} mb-3.5`}
                  >
                    <Icon className="size-5 shrink-0" aria-hidden="true" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                    {link.title}
                  </h3>
                  <p className="mt-1 mb-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {link.text}
                  </p>
                </div>
                <Link
                  href={link.href}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 hover:underline"
                >
                  Configurar
                  <ArrowRight className="size-3.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
