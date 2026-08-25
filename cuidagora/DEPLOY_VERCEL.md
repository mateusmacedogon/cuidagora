# Guia Oficial de Deploy no Vercel — CuidAgora

O **CuidAgora** foi arquitetado e otimizado para deploy instantâneo na **Vercel**, com suporte nativo a:
- **Next.js 16 (App Router + Turbopack)** com compilação ultra-rápida.
- **Headers de Segurança HTTP** configurados via `vercel.json` e `next.config.ts`.
- **Dual-Mode Database**:
  1. **PostgreSQL Serverless** (Vercel Postgres, Neon, Supabase, AWS RDS, Railway, Render).
  2. **In-Memory Fallback Resiliente (PGlite)** com dados de demonstração pré-carregados (funciona sem precisar de banco externo configurado!).
- **Progressive Web App (PWA) e SEO** com `manifest.ts`, `robots.ts` e `sitemap.ts`.
- **Conformidade WCAG 2.1 AA** e acessibilidade universal (Modo Idoso, Alto Contraste, Leitura por Voz).

---

## Opcao 1: Deploy com 1 Clique (Zero-Configuracao)

Você pode publicar o CuidAgora na Vercel mesmo sem cadastrar nenhum banco PostgreSQL externo. A aplicação inicializará automaticamente em **Modo Demonstração Seguro**, disponibilizando as contas de teste imediatas (**Maria - Paciente** e **João - Cuidador**).

1. Acesse [vercel.com](https://vercel.com) e clique em **"Add New..." > "Project"**.
2. Importe o repositório do GitHub (`mateusmacedogon/cuidagora`).
3. Caso a Vercel pergunte pelo **Root Directory**:
   - Se importar a raiz do repositório, o arquivo `vercel.json` e o `package.json` da raiz já orquestram o build automaticamente!
   - (Opcional) Você também pode selecionar a pasta `cuidagora` como **Root Directory**.
4. Clique em **"Deploy"**.
5. Em menos de 1 minuto, sua aplicação estará no ar!

---

## Opcao 2: Conectar com Vercel Postgres ou Neon (Producao Real)

Para persistência permanente de dados entre usuários em produção:

### 1. Criando o Banco na Vercel
1. No painel do seu projeto na Vercel, acesse a aba **"Storage"**.
2. Clique em **"Create Database"** e selecione **"Postgres"** (powered by Neon).
3. Conecte o banco ao seu projeto (Environments: *Production, Preview, Development*).
4. A Vercel criará automaticamente as variáveis `POSTGRES_URL`, `DATABASE_URL`, `POSTGRES_PRISMA_URL`, etc.

### 2. Inicializando as Tabelas e Dados Iniciais (Seed)
Execute uma única vez no seu terminal local apontando para a URL do seu banco na Vercel:
```bash
# Executa a criação das 16 tabelas e índices
DATABASE_URL="postgres://..." npm run db:migrate

# (Opcional) Popula com usuários e registros de demonstração
DATABASE_URL="postgres://..." npm run db:seed
```

> **Dica**: Mesmo que você conecte um banco novo e não execute o `seed.mjs`, o botão de **"Acesso Rápido de Demonstração"** cria automaticamente os perfis de teste na primeira utilização!

---

## Variaveis de Ambiente (Opcionais)

No painel da Vercel (**Settings > Environment Variables**), você pode configurar:

| Variável | Descrição | Padrão |
| :--- | :--- | :--- |
| `DATABASE_URL` / `POSTGRES_URL` | String de conexão com banco PostgreSQL remoto | Fallback em memória |
| `NEXT_PUBLIC_APP_URL` | URL pública da aplicação para canonical SEO e PWA | `https://cuidagora.vercel.app` |
| `NODE_ENV` | Ambiente de execução | `production` |

---

## Monitoramento e Verificacao de Saude

O CuidAgora possui um endpoint de diagnóstico de alta velocidade para monitorar status e latência:
- **URL**: `https://seu-dominio.vercel.app/api/health`
- **Exemplo de Retorno**:
```json
{
  "status": "healthy",
  "ok": true,
  "database": {
    "connected": true,
    "provider": "postgresql",
    "isRemote": true,
    "latencyMs": 18
  },
  "environment": "production",
  "vercel": {
    "deployed": true,
    "region": "iad1"
  },
  "timestamp": "2026-08-25T14:00:00.000Z"
}
```

---

## Contas de Acesso Rapido para Avaliadores

Ao acessar a tela de login (`/entrar`), clique em qualquer um dos botões de demonstração:
- **Maria Aparecida (Paciente)**: Acesso completo com medicamentos cadastrados, histórico de pressão arterial, glicemia e consultas.
- **João Fictício (Cuidador)**: Acesso compartilhado supervisionando os cuidados da paciente.

---

## Comandos Locais de Validacao

Antes de subir para o Git, você pode rodar localmente:
```bash
# Validar tipos TypeScript
npm run typecheck

# Executar suite completa de testes unitários e de integração
npm test

# Testar build idêntico ao da Vercel
npm run build
```
