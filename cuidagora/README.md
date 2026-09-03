# CuidAgora — Gestão Humanizada e Acessível de Cuidados de Saúde

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=flat&logo=vercel)](https://vercel.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16.2.6_(Turbopack)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.6-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.17-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_/_PGlite_Dual--Engine-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-C5F74F?style=flat&logo=drizzle)](https://orm.drizzle.team/)
[![Vitest](https://img.shields.io/badge/Vitest-41_testes_passando-6E9F18?style=flat&logo=vitest)](https://vitest.dev/)
[![Acessibilidade WCAG](https://img.shields.io/badge/Acessibilidade-WCAG_2.1_AA-success?style=flat)](#acessibilidade-universal-e-inclusão-a11y)
[![LGPD Compliance](https://img.shields.io/badge/LGPD-Compliant-success?style=flat)](#privacidade-segurança-e-lgpd)

> **CuidAgora** é uma aplicação web completa, resiliente, segura e profundamente inclusiva desenvolvida para organizar rotinas de saúde e bem-estar. Projetada com foco prioritário em idosos, pessoas com condições crônicas e seus familiares/cuidadores, a plataforma simplifica a gestão diária de medicamentos, sinais vitais, sintomas, consultas, hidratação e orientações médicas combinadas.

---

## Sumário

- [Deploy no Vercel](#deploy-no-vercel)
- [Visão Geral e Proposta de Valor](#visão-geral-e-proposta-de-valor)
- [Principais Funcionalidades](#principais-funcionalidades)
- [Acessibilidade Universal e Inclusão (a11y)](#acessibilidade-universal-e-inclusão-a11y)
- [Semáforo do Cuidado e Segurança Clínica](#semáforo-do-cuidado-e-segurança-clínica)
- [Modo Cuidador e Menor Privilégio](#modo-cuidador-e-menor-privilégio)
- [Arquitetura de Alta Performance e Resiliência](#arquitetura-de-alta-performance-e-resiliência)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Arquitetura e Estrutura de Pastas](#arquitetura-e-estrutura-de-pastas)
- [Modelo de Dados (PostgreSQL + Drizzle ORM)](#modelo-de-dados-postgresql--drizzle-orm)
- [Privacidade, Segurança e LGPD](#privacidade-segurança-e-lgpd)
- [Como Instalar e Executar](#como-instalar-e-executar)
- [Contas de Demonstração (Seed)](#contas-de-demonstração-seed)
- [Testes Automatizados](#testes-automatizados)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Aviso de Responsabilidade](#aviso-de-responsabilidade)

---

## Deploy no Vercel

O projeto está pronto para publicação instantânea na **Vercel**:
1. Conecte o repositório na **Vercel** (`mateusmacedogon/cuidagora`).
2. Clique em **Deploy**.
3. O build roda de forma 100% automatizada com Turbopack. Graças à arquitetura **Dual-Engine**, se nenhuma `DATABASE_URL` for informada, o sistema inicializa automaticamente com banco em memória PGlite pré-populado, funcionando imediatamente sem necessidade de configuração prévia de infraestrutura externa!
4. Para conectar ao PostgreSQL em produção (Vercel Postgres, Neon, Supabase, etc.), basta definir a variável de ambiente `DATABASE_URL`.
5. Consulte o guia detalhado em [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).

---

## Visão Geral e Proposta de Valor

Acompanhar rotinas de saúde, gerenciar múltiplos horários de medicamentos e memorizar sinais vitais para consultas são desafios complexos que frequentemente resultam em descontinuidade de tratamentos ou estresse familiar. O **CuidAgora** resolve essa dor através de:

1. **Simplicidade e Clareza**: Telas limpas, botões grandes com alvos de toque generosos, vocabulário acolhedor em português e ausência de jargões técnicos.
2. **Latência Zero Percebida (Optimistic UI)**: Interações diárias (como marcar remédios tomados ou registrar copos de água) respondem em **0ms** com reconciliação assíncrona segura no servidor.
3. **Acessibilidade Nativa (WCAG 2.1 AA)**: Modos dedicados para idosos, alto contraste cromático, modo simplificado cognitivo, leitura de tela em voz alta (TTS) e ditado por voz.
4. **Relatórios Prontos para Consultas**: Elimina cadernos de papel e anotações soltas, gerando sínteses claras com dados objetivos e versão otimizada para impressão ou salvamento em PDF.
5. **Cuidado Compartilhado sem Invasão**: Familiares e cuidadores autorizados acompanham a rotina em modo somente-leitura com permissões modulares decididas pelo titular.
6. **Segurança Ética**: O sistema nunca gera diagnósticos automáticos nem substitui médicos — seu semáforo é estritamente baseado em orientações cadastradas pelo próprio usuário ou profissional de confiança.

---

## Principais Funcionalidades

### 1. Gestão de Medicamentos com Reconciliação Segura
- Cadastro de medicamentos (nome, dosagem livre, horários diários, frequência e observações).
- Geração automática de tarefas no checklist diário.
- **Reconciliação Não-Destrutiva**: Alterações de horários ou dosagens atualizam e arquivam registros sem disparar deleções em cascata, preservando 100% do histórico de adesão anterior.

### 2. Checklist Diário com Resposta Instantânea (Optimistic UI)
- Visualização cronológica dos cuidados do dia organizados por horário.
- Marcação de conclusão/desmarcação com resposta visual em 0ms (`useOptimistic` + `useTransition`), com rollback automático em caso de falha de conexão.
- Barra de progresso de adesão aos cuidados calculada dinamicamente.

### 3. Sinais Vitais com Gráficos Sparkline Interativos
- **Pressão Arterial**: Registro de valores sistólicos/diastólicos com cálculo de médias do período, linha de referência saudável (120/80 mmHg) e curva visual de evolução temporal.
- **Glicemia Capilar**: Registro com contexto clínico (em jejum, pós-prandial, pré-refeição, etc.), média do período e curva de tendência com faixa de referência visual (70 a 140 mg/dL).
- **Hidratação**: Controle de consumo com meta diária personalizável (em ml) e atalhos rápidos de adição (+200ml, +300ml, +500ml).

### 4. Hub de Registro Rápido (`<QuickLogHub />`)
- Painel unificado com abas rápidas na tela inicial para registro expresso de água, aferição de pressão arterial, teste de glicemia ou relato de sintomas sem trocar de página.

### 5. Cartão de Emergência & Apoio Rápido (`<EmergencyCard />`)
- Botão de ligação expressa para o **SAMU 192** com animação de alerta.
- Acesso imediato a números de utilidade pública: **Bombeiros (193)** e **Disque Saúde SUS (136)**.
- Exibição do contato do cuidador principal vinculado para aviso imediato.

### 6. Check-in Diário e Sintomas
- **Check-in de Humor e Bem-Estar**: Registro do humor do dia e indicador de dor com anotações em menos de 1 minuto.
- **Registro de Sintomas**: Escala simplificada de intensidade (1 = Leve, 2 = Moderado, 3 = Forte), data, hora, duração aproximada e suporte a relato por voz.

### 7. Consultas Médicas e Caderno de Perguntas
- Agendamento de consultas com especialidade, médico e local.
- **Caderno de Perguntas**: Lista de dúvidas preparadas antecipadamente para levar à consulta, marcando quais já foram esclarecidas. Perguntas vinculadas a consultas canceladas são desvinculadas automaticamente sem perda do texto.

### 8. Resumo Estruturado para o Médico
- Filtro por períodos (últimos 7, 15, 30 dias ou intervalo personalizado).
- Compilação automática de taxa de adesão a remédios, médias vitais, sintomas, check-ins e dúvidas pendentes.
- Estilização completa para impressão em papel ou exportação para PDF (`@media print`).

### 9. Portabilidade de Dados e LGPD (`/api/exportar-dados`)
- Exportação completa e estruturada em formato JSON contendo titular, preferências, remédios, tarefas, histórico de adesão (`taskCompletions`), medições, sintomas, check-ins, consultas e autorizações de cuidadores.
- Nome de arquivo sanitizado em ASCII puro para download seguro em qualquer dispositivo.

---

## Acessibilidade Universal e Inclusão (a11y)

O CuidAgora foi planejado desde a base em conformidade com as diretrizes **WCAG 2.1 nível AA**:

| Recurso | Como Funciona | Impacto |
| :--- | :--- | :--- |
| **Modo Idoso** | Ativa a flag `data-elder="true"`, elevando a fonte base para `21px` e expandindo proporcionalmente espaçamentos, campos e botões. | Facilita a leitura para pessoas com presbiopia, vista cansada ou baixa visão. |
| **Alto Contraste** | Ativa a flag `data-contrast="true"`, aplicando paleta de contraste máximo (`#000000` em `#ffffff` e bordas grossas de 2px). | Atende pessoas com catarata, daltonismo ou perda de sensibilidade ao contraste. |
| **Modo Simplificado** | Ativa a flag `data-simple="true"`, ocultando elementos decorativos e garantindo botões com altura mínima de `3.5rem` (56px). | Reduz a sobrecarga cognitiva e previne toques acidentais na tela. |
| **Leitura em Voz Alta (TTS)** | Componente `<SpeakButton />` baseado na **Web Speech API** (`SpeechSynthesis`) que vocaliza resumos, orientações e tarefas. | Concede autonomia a pessoas não alfabetizadas ou com deficiência visual severa. |
| **Ditado por Voz (STT)** | Componente `<VoiceTextArea />` com a **Web Speech API** (`SpeechRecognition`), permitindo ditar observações com pré-visualização e confirmação antes de salvar. | Elimina a barreira de digitação em teclados virtuais reduzidos de celulares. |
| **Navegação por Teclado** | Contorno de foco visível de 3px (`:focus-visible`), _Skip Link_ para o conteúdo principal e vínculos `aria-describedby` para anúncios em leitores de tela (NVDA, TalkBack, VoiceOver). | Operabilidade total sem mouse ou toque. |

---

## Semáforo do Cuidado e Segurança Clínica

O **Semáforo do Cuidado** é uma ferramenta de triagem preventiva baseada em três estados:

- 🟢 **Verde (Estável)**: Rotina dentro dos parâmetros normais.
- 🟡 **Amarelo (Atenção)**: Algum registro atingiu um limite preventivo cadastrado.
- 🔴 **Vermelho (Urgente)**: Registro atingiu um limite de urgência (ex.: recomendação para buscar pronto atendimento).

### Princípios Éticos e Clínicos
1. **Zero Diagnóstico Autônomo**: A plataforma **nunca cria hipóteses diagnósticas ou altera tratamentos**.
2. **Baseado em Regras Combinadas**: O semáforo só opera quando o usuário (ou seu profissional de saúde) cadastra orientações explícitas (ex.: _"Se pressão sistólica >= 160, tomar medicamento SOS e repousar — Dr. Silva"_).
3. **Apresentação Multimodal**: A informação nunca depende apenas de cor — inclui ícones com semântica distinta, textos por extenso, descrição clara do parâmetro observado e transcrição literal da recomendação do médico.

---

## Modo Cuidador e Menor Privilégio

O titular mantém controle absoluto sobre o compartilhamento de seus dados:
- **Vínculo por E-mail**: O paciente autoriza o cuidador indicando o e-mail cadastrado.
- **Permissões Granulares por Módulo**: Escolha individual entre `tasks`, `medications`, `measurements`, `symptoms`, `appointments` e `timeline`.
- **Acesso Estritamente Somente-Leitura**: Cuidadores não possuem permissão para criar, editar ou excluir registros do paciente.
- **Isolamento de Estado**: Cookies de sincronização rápida do navegador são isolados por `userId`, garantindo que ações locais do cuidador nunca contaminem a visualização clínica do paciente.

---

## Arquitetura de Alta Performance e Resiliência

Para oferecer uma experiência rápida e estável tanto em conexões lentas de celular quanto em servidores serverless, implementamos as seguintes otimizações estruturais:

1. **Dual-Engine de Banco de Dados**:
   - Conexão nativa com **PostgreSQL** via `pg` quando `DATABASE_URL` estiver configurada.
   - Fallback automático transparente para **PGlite** (PostgreSQL compilado para WebAssembly) em memória quando executado sem variáveis externas, garantindo que o app rode de primeira em qualquer máquina ou preview.
2. **Memoização de Sessão por Requisição com React `cache()`**:
   - As chamadas `requireUser()` e `getSessionUser()` executam a consulta ao banco apenas **uma vez por ciclo HTTP**, reutilizando o usuário em memória entre `layout.tsx`, páginas e componentes de navegação.
3. **Formatadores `Intl.DateTimeFormat` Estáticos**:
   - Eliminação de instanciações repetidas de `Intl` dentro de loops de formatação de datas, acelerando renderizações de listas e execução de testes em até 50%.
4. **Verificação Instantânea de Conexão (`isDbInitialized`)**:
   - Flag em memória que retorna imediatamente (0ms) após a primeira validação do banco, evitando checagens assíncronas repetidas em todas as queries.
5. **Índices Compostos Estratégicos**:
   - Índices em `caregiver_access (caregiver_id)` e `care_tasks (user_id, archived_at, time_of_day)` para buscas imediatas no dashboard.
6. **Fontes Otimizadas com Zero CLS**:
   - Fonte Inter carregada via `next/font/google` com subconjunto latino e `display: swap`.
7. **Compressão Nativa no Next.js**:
   - `compress: true` e cabeçalhos de `Cache-Control` no `next.config.ts`.

---

## Tecnologias Utilizadas

```
┌───────────────────────────────────────────────────────────┐
│                        FRONTEND                           │
│  Next.js 16 (App Router + Turbopack) • React 19           │
│  Tailwind CSS 4 • Web Speech API (TTS & Speech-to-Text)   │
│  Optimistic UI (useOptimistic + useTransition)            │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                     BACKEND & REGRAS                      │
│  Server Components & Server Actions • Zod 4 Validation    │
│  React cache() • Timing-Safe HMAC Sessions                │
└─────────────────────────────┬─────────────────────────────┘
                              │
┌─────────────────────────────▼─────────────────────────────┐
│                    BANCO DE DADOS & ORM                   │
│  PostgreSQL 16 / PGlite (Wasm) Dual-Engine • Drizzle ORM  │
└───────────────────────────────────────────────────────────┘
```

- **Framework**: [Next.js 16.2.6](https://nextjs.org/) (App Router, Turbopack, Server Actions).
- **Linguagem**: [TypeScript 5.9.3](https://www.typescriptlang.org/).
- **Interface & Estilos**: [React 19.2.6](https://react.dev/), [Tailwind CSS 4.1.17](https://tailwindcss.com/), Lucide Icons.
- **Banco de Dados**: [PostgreSQL 16](https://www.postgresql.org/) e [@electric-sql/pglite](https://pglite.dev/) (Wasm).
- **ORM & Migrações**: [Drizzle ORM 0.45.2](https://orm.drizzle.team/) e [Drizzle Kit](https://orm.drizzle.team/kit-docs/overview).
- **Validação de Dados**: [Zod 4](https://zod.dev/).
- **Testes**: [Vitest 4.1.11](https://vitest.dev/).
- **Segurança Criptográfica**: Módulo nativo `node:crypto` (`scrypt`, `timingSafeEqual`, `randomBytes`, `createHmac`).

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
│   │   │   │   └── [ownerId]/    # Painel detalhado do paciente acompanhado
│   │   │   ├── consultas/        # Gestão de consultas e caderno de perguntas
│   │   │   ├── cuidados/         # Submódulos de cuidados, remédios e sinais
│   │   │   │   ├── check-in/     # Registro de bem-estar diário
│   │   │   │   ├── medicamentos/ # Gestão de medicamentos
│   │   │   │   ├── medicoes/     # Registro de pressão, glicemia e água
│   │   │   │   └── sintomas/     # Anotação de sintomas
│   │   │   ├── historico/        # Linha do tempo unificada de acontecimentos
│   │   │   ├── inicio/           # Dashboard principal com semáforo, tarefas e hub
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
│   │   │   └── redefinir-senha/  # Redefinição de senha com revogação de sessões
│   │   ├── api/
│   │   │   ├── exportar-dados/   # Portabilidade completa de dados LGPD (JSON)
│   │   │   └── health/           # Endpoint de healthcheck da aplicação
│   │   ├── globals.css           # Design system, temas e tokens de acessibilidade
│   │   ├── layout.tsx            # HTML Root Layout com injeção de fontes
│   │   └── page.tsx              # Landing page informativa
│   ├── components/               # Componentes visuais reutilizáveis
│   │   ├── a11y/                 # Componentes dedicados de acessibilidade
│   │   │   ├── AccessibilityMenu.tsx # Menu flutuante de preferências visuais
│   │   │   ├── SpeakButton.tsx   # Botão de sintetizador de voz (TTS)
│   │   │   └── VoiceTextArea.tsx # Campo de texto com reconhecimento de voz (STT)
│   │   ├── charts/               # Gráficos SVG interativos (VitalSparklines)
│   │   ├── layout/               # Componentes estruturais (Nav, Header, Shell)
│   │   └── ui/                   # Botões, Cards, Badges, Alertas e Campos
│   ├── db/                       # Camada de banco de dados
│   │   ├── index.ts              # Conexão Dual-Engine (Postgres + PGlite)
│   │   ├── schema.ts             # Schemas Drizzle e índices compostos
│   │   ├── schema-sql.ts         # DDL SQL de fallback nativo
│   │   └── seed-data.ts          # Dados de demonstração tipados
│   ├── features/                 # Módulos encapsulados por domínio funcional
│   │   ├── account/              # Ações de conta e exclusão LGPD
│   │   ├── appointments/         # Lógica e formulários de consultas
│   │   ├── auth/                 # Server actions e formulários de autenticação
│   │   ├── care/                 # Ações, queries, widgets e componentes otimistas
│   │   │   └── components/
│   │   │       ├── OptimisticTaskRow.tsx    # Checklist diário em 0ms
│   │   │       ├── OptimisticHydration.tsx  # Ingestão de água em 0ms
│   │   │       ├── EmergencyCard.tsx        # SOS rápido e telefones úteis
│   │   │       └── QuickLogHub.tsx          # Abas rápidas de registro
│   │   ├── caregiver/            # Gestão de autorizações e menor privilégio
│   │   ├── guidelines/           # Regras e limites do Semáforo do Cuidado
│   │   ├── preferences/          # Persistência de opções de acessibilidade
│   │   ├── summary/              # Geração do relatório médico e filtros de data
│   │   └── timeline/             # Serviço de registro unificado de eventos
│   └── lib/                      # Utilitários, regras de negócio e validações
│       ├── auth/
│       │   ├── password.ts       # Hash seguro via scrypt
│       │   └── session.ts        # Sessões assinadas com timingSafeEqual e cache()
│       ├── sync/
│       │   └── client-state.ts   # Sincronização rápida isolada por usuário
│       ├── action-state.ts       # Padrão tipado de retorno para Server Actions
│       ├── care-status.ts        # Avaliador multimodal do Semáforo do Cuidado
│       ├── date.ts               # Formatadores estáticos memoizados de data e hora
│       ├── domain.ts             # Constantes de domínio, enums e metadados
│       ├── permissions.ts        # Resolução e aplicação do menor privilégio
│       └── validation.ts         # Schemas de validação Zod para todos os forms
├── tests/                        # 8 suítes de testes automatizados com Vitest
│   ├── auth-actions.test.ts      # Testes de autenticação e fluxos de sessão
│   ├── bug-fixes.test.ts         # Validação das correções críticas da auditoria
│   ├── care-status.test.ts       # Testes da lógica do Semáforo do Cuidado
│   ├── db-fallback.test.ts       # Testes do motor Dual-Engine PGlite
│   ├── full-flow.test.ts         # Teste de fluxo completo de ponta a ponta
│   ├── improvements.test.ts      # Testes de gráficos sparkline e exportação LGPD
│   ├── security.test.ts          # Testes de hash, senhas e autorizações
│   └── validation.test.ts        # Testes de schemas Zod e cálculos de datas
├── drizzle.config.ts             # Configuração do Drizzle Kit
├── next.config.ts                # Configuração do Next.js (compressão e headers)
├── package.json                  # Dependências e scripts npm
├── tsconfig.json                 # Configuração do compilador TypeScript
└── vitest.config.ts              # Configuração do executor de testes
```

---

## Modelo de Dados (PostgreSQL + Drizzle ORM)

O banco de dados é modelado com integridade referencial estrita e índices compostos estratégicos para garantir alta performance e isolamento total entre pacientes:

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

---

## Privacidade, Segurança e LGPD

- **Hashing Criptográfico de Senhas**: Utiliza derivação de chaves `scrypt` com salt aleatório de 16 bytes e 64 bytes de saída (alta resistência a ataques por força bruta).
- **Prevenção contra Timing Attacks**: Verificação de senhas e tokens de sessão via `crypto.timingSafeEqual` com conferência prévia de comprimento de buffers.
- **Sessões Protegidas e Stateless**: Cookies `httpOnly`, `sameSite: "lax"`, criptograficamente assinados com HMAC-SHA256 e revogação automática na alteração de senhas.
- **Isolamento de Estado**: Cookies de sync de interface vinculados estritamente ao `userId`, impedindo contaminação de dados quando um cuidador visualiza o prontuário de um paciente.
- **Validação de Entrada Estrita**: Todos os formulários e rotas passam por validação tipada Zod antes de atingir a camada de dados.
- **Direito à Eliminação e Esquecimento (LGPD Art. 18)**: O usuário pode solicitar a eliminação completa e irreversível da sua conta em `Perfil -> Privacidade`. A confirmação exige a senha e a digitação da palavra `EXCLUIR`, acionando a remoção imediata em cascata (`ON DELETE CASCADE`) de todos os seus dados clínicos.

---

## Como Instalar e Executar

### Pré-requisitos
- **Node.js**: Versão 20.x ou superior.
- **PostgreSQL** (Opcional): Instância local ou em nuvem. Se não fornecido, o app utiliza o motor PGlite em memória automaticamente!

### Passo a Passo

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/mateusmacedogon/cuidagora.git
   cd cuidagora/cuidagora
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente (Opcional)**:
   Se desejar conectar ao seu banco PostgreSQL, crie um arquivo `.env` na raiz do projeto:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cuidagora_db"
   NODE_ENV="development"
   ```
   *(Caso não crie o `.env`, o sistema executará com o PGlite em memória com dados pré-carregados).*

4. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```

5. Abra no navegador: [http://localhost:3000](http://localhost:3000)

---

## Contas de Demonstração (Seed)

O sistema inclui duas contas pré-configuradas com histórico clínico completo para avaliação imediata:

| Perfil | E-mail | Senha Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| **Titular (Paciente)** | `maria@exemplo.com` | `cuidagora123` | Histórico completo de 30 dias: medicamentos, tarefas, medições de pressão/glicemia, hidratação, check-ins e regras do semáforo cadastradas. |
| **Cuidador Autorizado** | `joao@exemplo.com` | `cuidagora123` | Cuidador vinculado à Maria Aparecida com permissões granulares ativas para acompanhamento compartilhado. |

*(Você também pode clicar no botão de login rápido com demonstração diretamente na tela de login).*

---

## Testes Automatizados

O projeto conta com **8 suítes de testes** automatizados com **Vitest** totalizando **41 testes** com 100% de aprovação:

```bash
# Executar todos os testes
npm run test
```

### Cobertura das Suítes:
- `bug-fixes.test.ts`: Validação de hidratação padrão 0, isolamento do sync cookie por usuário, filtragem de perguntas órfãs e sanitização de nomes LGPD.
- `auth-actions.test.ts`: Cadastro, login, credenciais inválidas e criação de sessão.
- `db-fallback.test.ts`: Inicialização e resiliência do motor Dual-Engine (PGlite).
- `full-flow.test.ts`: Fluxo completo de usuário, recuperação de dados e avaliação do Semáforo.
- `improvements.test.ts`: Consulta de séries temporais para sparklines e estrutura de exportação LGPD.
- `care-status.test.ts`: Avaliação do Semáforo do Cuidado (atenção/urgência, limites e multimodalidade).
- `security.test.ts`: Hashing de senhas, validação de tokens e princípio do menor privilégio.
- `validation.test.ts`: Schemas Zod de cadastro, medicamentos, check-in, pressão arterial e filtros de datas.

---

## Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Next.js na porta 3000. |
| `npm run build` | Gera o build de produção otimizado com Turbopack. |
| `npm run start` | Inicia o servidor em modo de produção. |
| `npm run typecheck` | Executa a checagem estática de tipos com o compilador TypeScript. |
| `npm run lint` | Executa o linter ESLint em todo o código. |
| `npm run test` | Roda os 41 testes automatizados com Vitest. |
| `npm run db:migrate` | Executa migrações DDL no banco PostgreSQL. |
| `npm run db:seed` | Popula o banco com os dados de demonstração. |
| `npm run db:setup` | Executa migração e seed sequencialmente. |
| `npm run db:push` | Sincroniza o schema Drizzle diretamente com o banco. |

---

## Aviso de Responsabilidade

> **Aviso Importante**: O **CuidAgora** é uma plataforma de suporte à organização pessoal e acompanhamento compartilhado da rotina de saúde. O aplicativo **não realiza diagnósticos, não recomenda medicamentos ou dosagens e não substitui a avaliação, o acompanhamento e as orientações de médicos ou profissionais de saúde qualificados**. Em situações de emergência clínica ou mal-estar súbito, procure imediatamente o serviço médico da sua região (como o SAMU 192 no Brasil).

---

<div align="center">
  <p>Desenvolvido para transformar o cuidado em um ato simples, acessível e compartilhado.</p>
</div>
