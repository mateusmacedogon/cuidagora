# CuidAgora — Gestão Humanizada e Acessível de Cuidados de Saúde

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://vercel.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.6-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-8.20.0-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1.11-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)
[![Acessibilidade WCAG](https://img.shields.io/badge/Acessibilidade-WCAG_2.1_AA-success?style=flat)](#acessibilidade-universal--inclusao-a11y)
[![LGPD Compliance](https://img.shields.io/badge/LGPD-Compliant-success?style=flat)](#privacidade-seguranca--lgpd)

> **CuidAgora** é uma aplicação web completa, segura e profundamente inclusiva desenvolvida para organizar rotinas de saúde e bem-estar. Projetada com foco prioritário em idosos, pessoas com condições crônicas de saúde e seus familiares/cuidadores, a plataforma simplifica o acompanhamento de medicamentos, sinais vitais, sintomas, consultas e orientações médicas.

---

## Sumário

- [Deploy no Vercel](#deploy-no-vercel)
- [Visão Geral e Proposta de Valor](#visao-geral--proposta-de-valor)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Acessibilidade Universal e Inclusão (a11y)](#acessibilidade-universal--inclusao-a11y)
- [Semáforo do Cuidado e Segurança Clínica](#semaforo-do-cuidado--seguranca-clinica)
- [Modo Cuidador e Menor Privilégio](#modo-cuidador--menor-privilegio)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura e Estrutura de Pastas](#arquitetura--estrutura-de-pastas)
- [Modelo de Dados (PostgreSQL + Drizzle ORM)](#modelo-de-dados-postgresql--drizzle-orm)
- [Privacidade, Segurança e LGPD](#privacidade-seguranca--lgpd)
- [Como Instalar e Executar](#como-instalar-e-executar)
- [Contas de Demonstração (Seed)](#contas-de-demonstracao-seed)
- [Testes Automatizados](#testes-automatizados)
- [Scripts Disponíveis](#scripts-disponiveis)
- [Aviso de Responsabilidade](#aviso-de-responsabilidade)

---

## Deploy no Vercel

O projeto está pronto para publicação instantânea na **Vercel**:
1. Conecte o repositório na **Vercel** (`mateusmacedogon/cuidagora`).
2. Clique em **Deploy**.
3. O build roda de forma automatizada com fallback em memória pré-populado ou conectado ao **Vercel Postgres** / **Neon**.
4. Consulte o guia detalhado em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).

---

## Visão Geral e Proposta de Valor

A adesão a tratamentos contínuos e o acompanhamento de sinais vitais costumam ser tarefas difíceis e fragmentadas. O **CuidAgora** foi criado para preencher essa lacuna, proporcionando:

1. **Simplicidade Radical**: Interfaces limpas, textos em linguagem natural, botões grandes e navegação intuitiva.
2. **Acessibilidade Nativa**: Modos visuais para idosos e baixa visão, leitura de tela em voz alta e comandos/ditado por voz.
3. **Resumos Prontos para Consultas**: Elimina cadernos de anotações manuais, gerando relatórios completos e otimizados para impressão.
4. **Cuidado Colaborativo sem Invasão de Privacidade**: Compartilhamento granular com cuidadores sem perda da autonomia do paciente.
5. **Segurança Ética**: Ausência de diagnósticos automatizados ou substituição de orientação profissional.

---

## Principais Funcionalidades

### 1. Gestão de Medicamentos e Rotina Diária

- Cadastro detalhado de medicamentos (nome, dosagem livre, horários e observações).
- Geração automática de tarefas diárias vinculadas aos horários cadastrados.
- Checklist interativo de cuidados do dia com confirmação de conclusão em tempo real.

### 2. Medições e Sinais Vitais

- **Pressão Arterial**: Registro de valores sistólicos e diastólicos com conferência de faixas plausíveis.
- **Glicemia**: Acompanhamento com contexto do teste (em jejum, pós-refeição, antes de dormir, etc.).
- **Hidratação**: Controle de consumo diário de água com barra de progresso em relação à meta estabelecida.

### 3. Check-in Diário e Sintomas

- **Check-in Rápido**: Registro em menos de 1 minuto sobre o estado geral de humor e presença de dor.
- **Anotação de Sintomas**: Escala simplificada de intensidade (1 = Leve, 2 = Moderado, 3 = Forte), data, hora, duração e notas livres com suporte a ditado por voz.

### 4. Consultas Médicas e Caderno de Perguntas

- Agendamento de consultas com especialidade, profissional e local.
- **Caderno de Perguntas**: Espaço para o paciente listar previamente dúvidas para não esquecer durante o atendimento médico.

### 5. Resumo Estruturado para a Consulta

- Filtros rápidos por período (últimos 7, 15, 30 dias ou intervalo personalizado).
- Compilação automática de:
  - Taxa de adesão aos cuidados e medicamentos.
  - Médias e variações de pressão arterial e glicemia.
  - Histórico de sintomas e check-ins no período.
  - Perguntas não respondidas preparadas para o médico.
- **Layout para Impressão**: Estilizado com `@media print` para ser impresso em papel ou salvo em PDF.

### 6. Linha do Tempo Unificada

- Histórico cronológico de todos os eventos registrados no sistema (tarefas concluídas, medições, sintomas e anotações).

---

## Acessibilidade Universal e Inclusão (a11y)

O CuidAgora foi planejado desde o primeiro rascunho com conformidade **WCAG 2.1 nível AA**, integrando recursos diretamente no menu de acessibilidade e salvando as preferências no perfil do usuário:

| Recurso | Como Funciona | Impacto |
| :--- | :--- | :--- |
| **Modo Idoso** | Ativa a flag `data-elder="true"`, aumentando a tipografia base de `17px` para `21px` e expandindo proporcionalmente todos os espaçamentos e alvos de toque (`rem`). | Facilita a leitura para pessoas com presbiopia ou baixa visão. |
| **Alto Contraste** | Ativa a flag `data-contrast="true"`, redefinindo a paleta de cores para contraste máximo (`#000000` em `#ffffff` e bordas grossas de 2px). | Atende usuários com catarata, daltonismo ou dificuldades de diferenciação cromática. |
| **Modo Simplificado** | Ativa a flag `data-simple="true"`, ocultando elementos secundários e expandindo a altura mínima de botões e links para `3.5rem` (56px). | Reduz a carga cognitiva e evita toques acidentais em telas sensíveis ao toque. |
| **Leitura em Voz Alta** | Utiliza a **Web Speech API (SpeechSynthesis)** no componente `<SpeakButton />` para vocalizar resumos do dia, mensagens e orientações. | Proporciona autonomia para pessoas não alfabetizadas ou com deficiência visual severa. |
| **Entrada por Voz** | Componente `<VoiceTextArea />` que utiliza a **Web Speech API (SpeechRecognition)** para transcrição direta de relatos e sintomas. | Elimina a barreira de digitação em teclados virtuais pequenos. |
| **Foco e Teclado** | Foco visível de 3px com contorno contrastante em todos os elementos interativos (`:focus-visible`) e _Skip Link_ para navegação rápida. | Totalmente operável via teclado e leitores de tela externos (NVDA, TalkBack, VoiceOver). |

---

## Semáforo do Cuidado e Segurança Clínica

O **Semáforo do Cuidado** é uma ferramenta visual que classifica o estado geral do paciente em três níveis:

- **Verde**: Tudo dentro da rotina combinada.
- **Amarelo (Atenção)**: Algum registro disparou uma orientação médica preventiva cadastrada.
- **Vermelho (Urgência)**: Registro atingiu critério urgente cadastrado (ex.: buscar pronto atendimento).

### Princípios Fundamentais de Segurança

1. **Zero Inteligência Médica Não Autorizada**: O sistema **não diagnostica** nem toma decisões clínicas por conta própria.
2. **Baseado Apenas em Regras Cadastradas**: O semáforo só é acionado caso o paciente ou seu médico tenham cadastrado previamente orientações e limites específicos (ex.: _"Se pressão sistólica >= 180, procurar emergência — Dra. Fictícia"_).
3. **Comunicação Multimodal**: O status **nunca é comunicado exclusivamente por cor** — são exibidos ícones, nomes literais por extenso, títulos e a transcrição exata da orientação prescrita.

---

## Modo Cuidador e Menor Privilégio

O CuidAgora permite que familiares e profissionais acompanhem um paciente com segurança máxima:

- **Convite e Vínculo por E-mail**: O paciente autoriza o cuidador informando seu e-mail.
- **Permissões Granulares**: O titular escolhe individualmente quais módulos o cuidador pode visualizar:
  - `tasks`: Ver cuidados do dia
  - `medications`: Ver medicamentos
  - `measurements`: Ver medições (pressão, glicemia, água)
  - `symptoms`: Ver sintomas
  - `appointments`: Ver consultas
  - `timeline`: Ver linha do tempo
- **Privilégio Exclusivo de Escrita**: Cuidadores têm acesso estritamente de **leitura** aos dados liberados. Apenas o próprio paciente pode alterar ou excluir seus registros.

---

## Tecnologias Utilizadas

```
┌───────────────────────────────────────────────────────────┐
│                        FRONTEND                           │
│  Next.js 16 (App Router) • React 19 • Tailwind CSS 4      │
│  TypeScript 5.9 • Web Speech API (TTS & Speech-to-Text)   │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                     BACKEND & REGRAS                      │
│  Server Components & Server Actions • Zod 4 Validation    │
│  Node.js Crypto (scrypt KDF + SHA-256 Sessions)           │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                    BANCO DE DADOS & ORM                   │
│  PostgreSQL 16 • Drizzle ORM • Drizzle Kit Migrations     │
└───────────────────────────────────────────────────────────┘
```

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Server Components e Server Actions).
- **Linguagem**: [TypeScript 5.9](https://www.typescriptlang.org/).
- **Interface & Estilos**: [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), PostCSS e Tokens CSS dinâmicos.
- **Banco de Dados**: [PostgreSQL](https://www.postgresql.org/).
- **ORM & Migrações**: [Drizzle ORM](https://orm.drizzle.team/) e [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview).
- **Validação de Dados**: [Zod 4](https://zod.dev/).
- **Testes**: [Vitest](https://vitest.dev/).
- **Segurança Criptográfica**: Módulos nativos `node:crypto` (`scrypt`, `timingSafeEqual`, `randomBytes`, `createHash`).

---

## Arquitetura e Estrutura de Pastas

```
cuidagora/
├── scripts/                      # Scripts de infraestrutura e dados
│   ├── migrate.mjs               # Executor de migrações PostgreSQL
│   ├── schema.sql                # DDL completo com índices relacionais
│   └── seed.mjs                  # Povoamento com dados fictícios de teste
├── src/
│   ├── app/                      # Rotas da aplicação (Next.js App Router)
│   │   ├── (app)/                # Rotas autenticadas da plataforma
│   │   │   ├── acompanhando/     # Área do cuidador (pacientes vinculados)
│   │   │   ├── consultas/        # Gestão de consultas e perguntas ao médico
│   │   │   ├── cuidados/         # Submódulos de cuidados, remédios e sinais
│   │   │   │   ├── check-in/     # Registro de bem-estar diário
│   │   │   │   ├── medicamentos/ # Gestão de medicamentos
│   │   │   │   ├── medicoes/     # Registro de pressão, glicemia e água
│   │   │   │   └── sintomas/     # Anotação de sintomas
│   │   │   ├── historico/        # Linha do tempo de acontecimentos
│   │   │   ├── inicio/           # Dashboard principal com semáforo e tarefas
│   │   │   ├── perfil/           # Configurações de conta, cuidadores e LGPD
│   │   │   │   ├── cuidadores/   # Gestão de permissões de acesso
│   │   │   │   ├── orientacoes/  # Cadastro de regras do semáforo
│   │   │   │   └── privacidade/  # Exclusão total de dados (LGPD)
│   │   │   ├── resumo/           # Relatório estruturado para consulta médica
│   │   │   ├── layout.tsx        # Shell da aplicação (navegação e acessibilidade)
│   │   │   └── error.tsx         # Tratamento humanizado de erros
│   │   ├── (auth)/               # Fluxo de autenticação
│   │   │   ├── criar-conta/      # Cadastro de novos usuários
│   │   │   ├── entrar/           # Login com seleção de credenciais
│   │   │   ├── recuperar-senha/  # Solicitação de recuperação
│   │   │   └── redefinir-senha/  # Redefinição de senha
│   │   ├── api/
│   │   │   └── health/           # Endpoint de healthcheck da aplicação
│   │   ├── globals.css           # Design system e tokens de acessibilidade
│   │   ├── layout.tsx            # HTML Root Layout
│   │   └── page.tsx              # Landing page informativa
│   ├── components/               # Componentes visuais reutilizáveis
│   │   ├── a11y/                 # Componentes dedicados de acessibilidade
│   │   │   ├── AccessibilityMenu.tsx # Menu flutuante de configurações visuais
│   │   │   ├── SpeakButton.tsx   # Botão de sintetizador de voz (TTS)
│   │   │   └── VoiceTextArea.tsx # Campo de texto com reconhecimento de voz
│   │   ├── layout/               # Componentes estruturais (Nav, Header, Shell)
│   │   └── ui/                   # Botões, Cards, Badges, Alertas e Campos
│   ├── db/                       # Camada de banco de dados
│   │   ├── index.ts              # Conexão Drizzle ORM com pool pg
│   │   └── schema.ts             # Schemas Drizzle e tipagens TypeScript
│   ├── features/                 # Módulos encapsulados por domínio funcional
│   │   ├── account/              # Ações de conta e exclusão LGPD
│   │   ├── appointments/         # Lógica e formulários de consultas
│   │   ├── auth/                 # Server actions e formulários de autenticação
│   │   ├── care/                 # Ações, queries e widgets de cuidados diários
│   │   ├── caregiver/            # Gestão de autorizações e permissões
│   │   ├── guidelines/           # Regras e limites do Semáforo do Cuidado
│   │   ├── preferences/          # Persistência de opções de acessibilidade
│   │   ├── summary/              # Geração do relatório médico e filtros de data
│   │   └── timeline/             # Serviço de registro unificado de eventos
│   └── lib/                      # Utilitários, regras de negócio e validações
│       ├── auth/
│       │   ├── password.ts       # Hash seguro via scrypt e timingSafeEqual
│       │   └── session.ts        # Gerenciamento de sessões seguras em cookies
│       ├── action-state.ts       # Padrão tipado de retorno para Server Actions
│       ├── care-status.ts        # Mecanismo avaliador do Semáforo do Cuidado
│       ├── date.ts               # Formatações locais e manipulação de datas
│       ├── domain.ts             # Constantes de domínio, enums e metadados
│       ├── permissions.ts        # Resolução e aplicação do menor privilégio
│       └── validation.ts         # Schemas de validação Zod para todos os forms
├── tests/                        # Testes automatizados com Vitest
│   ├── care-status.test.ts       # Testes da lógica do Semáforo do Cuidado
│   ├── security.test.ts          # Testes de hash, senhas e autorizações
│   └── validation.test.ts        # Testes de schemas Zod e cálculos de datas
├── drizzle.config.ts             # Configuração do Drizzle Kit
├── next.config.ts                # Configuração do Next.js
├── package.json                  # Dependências e scripts npm
├── tsconfig.json                 # Configuração do compilador TypeScript
└── vitest.config.ts              # Configuração do executor de testes
```

---

## Modelo de Dados (PostgreSQL + Drizzle ORM)

O banco de dados é modelado com integridade referencial estrita e índices compostos por `(user_id, data)` para garantir alta performance e isolamento total entre pacientes:

```mermaid
erDiagram
    users ||--|| user_preferences : "possui"
    users ||--o{ sessions : "autentica"
    users ||--o{ password_reset_tokens : "solicita"
    users ||--o{ caregiver_access : "autoriza"
    users ||--o{ medications : "consome"
    medications ||--o{ medication_schedules : "horários"
    users ||--o{ care_tasks : "agenda"
    care_tasks ||--o{ task_completions : "completa"
    users ||--o{ daily_checkins : "registra"
    users ||--o{ symptoms : "apresenta"
    users ||--o{ measurements : "mede"
    users ||--o{ appointments : "marca"
    appointments ||--o{ appointment_questions : "contém"
    users ||--o{ care_guidelines : "orientações"
    users ||--o{ timeline_events : "histórico"
```

### Entidades Principais:

1. `users`: Cadastro de usuário (`account_type`: `person` ou `caregiver`).
2. `user_preferences`: Configurações de acessibilidade (`simplifiedMode`, `elderMode`, `highContrast`, `readAloud`, `hydrationGoalMl`).
3. `sessions`: Sessões ativas indexadas por hash SHA-256.
4. `caregiver_access`: Vínculo de acompanhamento com objeto `permissions` em JSONB.
5. `medications` & `medication_schedules`: Medicamentos e seus respectivos horários diários.
6. `care_tasks` & `task_completions`: Cuidados previstos e histórico diário de realização.
7. `daily_checkins`: Humor do dia, reporte de dor e anotações.
8. `measurements`: Pressão arterial (sistólica/diastólica), glicemia com contexto e ingestão de água.
9. `symptoms`: Sintomas ocorridos com intensidade (1 a 3) e duração.
10. `appointments` & `appointment_questions`: Consultas médicas e dúvidas para o atendimento.
11. `care_guidelines`: Regras que alimentam o Semáforo do Cuidado (`metric`, `comparator`, `threshold`, `instruction`).
12. `timeline_events`: Eventos cronológicos agregados.

---

## Privacidade, Segurança e LGPD

- **Hashing de Senhas**: Utiliza `scrypt` com salt criptográfico aleatório de 16 bytes e 64 bytes de derivação (resistente a ataques de força bruta por GPU) e verificação com `timingSafeEqual` contra timing attacks.
- **Sessões Opaque**: Cookies `httpOnly`, `sameSite: "lax"`, com token criptograficamente aleatório e armazenamento no banco em formato SHA-256 (o token puro nunca toca o banco).
- **Validação Estrita**: Todas as entradas do usuário passam por validação com Zod antes de qualquer execução de banco.
- **Exclusão de Conta e Direito ao Esquecimento (LGPD)**: O usuário pode solicitar a eliminação total de sua conta em `Perfil -> Privacidade`. A exclusão exige confirmação explícita digitando a palavra `EXCLUIR` e a senha atual, acionando a remoção imediata em cascata (`ON DELETE CASCADE`) de todos os registros clínicos.

---

## Como Instalar e Executar

### Pré-requisitos

- **Node.js**: Versão 20.x ou superior.
- **PostgreSQL**: Instância em execução localmente ou na nuvem (ex.: Neon, Supabase, Docker).

### Passo a Passo

1. **Clone o repositório**:

   ```bash
   git clone <URL_DO_REPOSITORIO>
   cd cuidagora/cuidagora
   ```

2. **Instale as dependências**:

   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente**:
   Crie um arquivo `.env` na raiz do projeto `cuidagora/` com a sua string de conexão:

   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cuidagora_db"
   NODE_ENV="development"
   ```

4. **Execute as migrações do banco de dados**:

   ```bash
   npm run db:migrate
   ```

5. **Popule o banco com dados de demonstração (Opcional, mas recomendado)**:

   ```bash
   npm run db:seed
   ```

   _(Ou execute `npm run db:setup` para rodar a migração e o seed juntos)._

6. **Inicie o servidor de desenvolvimento**:

   ```bash
   npm run dev
   ```

7. Abra o navegador em: [http://localhost:3000](http://localhost:3000)

---

## Contas de Demonstração (Seed)

Ao rodar o script `npm run db:seed`, duas contas pré-configuradas com dados clínicos fictícios são criadas:

| Perfil | E-mail | Senha Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| **Titular (Paciente)** | `maria@exemplo.com` | `cuidagora123` | Conta com histórico completo de 30 dias: medicamentos, tarefas, medições de pressão/glicemia, hidratação, check-ins e orientações do semáforo cadastradas. |
| **Cuidador Autorizado** | `joao@exemplo.com` | `cuidagora123` | Conta de cuidador vinculada à Maria Aparecida com permissões granulares ativas para visualização. |

---

## Testes Automatizados

O projeto conta com uma suíte de testes com **Vitest** cobrindo regras de negócio críticas, validações de formulário e segurança:

```bash
# Executar todos os testes
npm run test
# ou via Vitest diretamente:
npx vitest run
```

### O que é testado:

- `care-status.test.ts`: Avaliação do Semáforo do Cuidado (regras de atenção/urgência, limites, ausência de regras e acessibilidade multimodal).
- `security.test.ts`: Hashing de senhas, validação de tokens e resolução do princípio de menor privilégio de permissões.
- `validation.test.ts`: Schemas Zod de cadastro, medicamentos, check-in, pressão arterial, intensidade de sintomas e períodos do resumo médico.

---

## Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js na porta 3000. |
| `npm run build` | Gera o bundle otimizado para produção. |
| `npm run start` | Inicia o servidor Next.js em modo de produção. |
| `npm run typecheck` | Executa a verificação estática de tipos com o compilador TypeScript. |
| `npm run lint` | Executa o linter ESLint no projeto. |
| `npm run test` | Roda os testes unitários e de integração com Vitest. |
| `npm run db:migrate` | Executa a criação de tabelas e índices no PostgreSQL. |
| `npm run db:seed` | Insere usuários e dados fictícios de exemplo no banco. |
| `npm run db:setup` | Executa a migração e o seed sequencialmente. |
| `npm run db:push` | Sincroniza o schema Drizzle diretamente com o banco de dados. |

---

## Aviso de Responsabilidade

> **Aviso Importante**: O **CuidAgora** é uma ferramenta de organização pessoal de cuidados e suporte à rotina. O aplicativo **não realiza diagnósticos, não recomenda medicamentos ou dosagens e não substitui a avaliação, acompanhamento e orientação de médicos ou profissionais de saúde qualificados**. Em situações de emergência, procure imediatamente o serviço de atendimento médico da sua região (como o SAMU 192 no Brasil).

---

<div align="center">
  <p>Desenvolvido para transformar o cuidado em um ato simples, acessível e compartilhado.</p>
</div>
