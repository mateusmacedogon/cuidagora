import type { Metadata } from "next";
import Link from "next/link";

import { Card, CardTitle, PageHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Feedback";
import { HydrationGoalForm } from "@/features/care/components/record-forms";
import { listMyCaregivers } from "@/features/caregiver/data";
import { listSharedWithMe } from "@/lib/permissions";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Perfil — CuidAgora" };

const LINKS = [
  { href: "/perfil/cuidadores", icon: "🤝", title: "Quem pode me acompanhar", text: "Libere e controle o que cada cuidador vê." },
  { href: "/perfil/orientacoes", icon: "🧭", title: "Orientações do Semáforo", text: "Cadastre o que seu profissional orientou." },
  { href: "/perfil/privacidade", icon: "🔒", title: "Privacidade e meus dados", text: "Veja o que guardamos e exclua quando quiser." },
  { href: "/acompanhando", icon: "👀", title: "Pessoas que acompanho", text: "Dados que outras pessoas compartilharam com você." },
];

export default async function ProfilePage() {
  const user = await requireUser();
  const [caregivers, sharedWithMe] = await Promise.all([
    listMyCaregivers(user.id),
    listSharedWithMe(user),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader icon="👤" title="Meu perfil" description="Suas informações e a forma como o CuidAgora funciona para você." />

      <Card>
        <CardTitle icon="🪪">Meus dados</CardTitle>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-[var(--color-ink-soft)]">Nome</dt>
            <dd className="text-lg font-bold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--color-ink-soft)]">E-mail</dt>
            <dd className="text-lg font-bold break-words">{user.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--color-ink-soft)]">Tipo de conta</dt>
            <dd>
              <Badge tone="info" icon={user.accountType === "caregiver" ? "🤝" : "💚"}>
                {user.accountType === "caregiver" ? "Acompanho outra pessoa" : "Cuido de mim"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-[var(--color-ink-soft)]">Compartilhamentos</dt>
            <dd>
              {caregivers.length} cuidador(es) autorizado(s) · você acompanha {sharedWithMe.length} pessoa(s)
            </dd>
          </div>
        </dl>
      </Card>

      <Card>
        <CardTitle icon="♿" description="Use também o botão “Acessibilidade” no topo da tela.">
          Como o CuidAgora aparece para você
        </CardTitle>
        <ul className="flex flex-col gap-2">
          <li>
            <Badge tone={user.preferences.elderMode ? "success" : "neutral"} icon={user.preferences.elderMode ? "✔️" : "➖"}>
              Letras e botões maiores: {user.preferences.elderMode ? "ligado" : "desligado"}
            </Badge>
          </li>
          <li>
            <Badge tone={user.preferences.highContrast ? "success" : "neutral"} icon={user.preferences.highContrast ? "✔️" : "➖"}>
              Alto contraste: {user.preferences.highContrast ? "ligado" : "desligado"}
            </Badge>
          </li>
          <li>
            <Badge tone={user.preferences.simplifiedMode ? "success" : "neutral"} icon={user.preferences.simplifiedMode ? "✔️" : "➖"}>
              Modo simplificado: {user.preferences.simplifiedMode ? "ligado" : "desligado"}
            </Badge>
          </li>
          <li>
            <Badge tone={user.preferences.readAloud ? "success" : "neutral"} icon={user.preferences.readAloud ? "✔️" : "➖"}>
              Botões de ouvir: {user.preferences.readAloud ? "ligado" : "desligado"}
            </Badge>
          </li>
        </ul>
      </Card>

      <Card>
        <CardTitle icon="💧">Meta de hidratação</CardTitle>
        <HydrationGoalForm current={user.preferences.hydrationGoalMl} />
      </Card>

      <section aria-labelledby="mais-opcoes">
        <h2 id="mais-opcoes" className="mb-3 text-2xl font-bold">
          Mais opções
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {LINKS.map((link) => (
            <li key={link.href} className="card p-5">
              <p aria-hidden="true" className="text-3xl">
                {link.icon}
              </p>
              <h3 className="mt-2 text-lg font-bold">
                <Link href={link.href} className="underline">
                  {link.title}
                </Link>
              </h3>
              <p className="mt-1 text-[var(--color-ink-soft)]">{link.text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
