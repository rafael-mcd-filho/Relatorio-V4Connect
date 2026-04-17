# V4Connect Analytics

Painel de analise de atendimentos consumindo uma API externa (`chat/v2/session`).

## Stack

- Next.js 15 (App Router) + React 19
- TypeScript
- Tailwind CSS + componentes shadcn/ui customizados
- Recharts para os graficos
- `react-day-picker` + `date-fns` para o seletor de datas
- `next-themes` para dark mode
- Lucide Icons

## Desenvolvimento

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

Sem token configurado o painel usa dados mockados (~520 sessoes geradas com distribuicao realista de horarios, canais, departamentos e status).

## Variaveis de ambiente

Copie `.env.local.example` para `.env.local`:

```env
ANALYTICS_API_BASE=https://api.sua-origem.com
ANALYTICS_API_TOKEN=seu_token_aqui
```

> Em producao, prefira manter o token no servidor via `app/api/sessions/route.ts` para nao expor a credencial no browser.

## Deploy no Vercel

1. Importe o repositorio no Vercel.
2. Configure as variaveis `ANALYTICS_API_BASE` e `ANALYTICS_API_TOKEN`.
3. Faça o deploy.

O projeto define a regiao `gru1` (Sao Paulo) em `vercel.json`.

## Embed em iframe

O projeto esta configurado para aceitar iframe em qualquer dominio. O header enviado e:

```text
Content-Security-Policy: frame-ancestors *;
```

Isso deixa o painel embutivel em qualquer sistema externo.

## Estrutura

```text
app/
  layout.tsx        Root layout + fonts + theme provider
  page.tsx          Dashboard principal
  globals.css       Tokens de cor + utilidades
components/
  charts/           Graficos Recharts
  ui/               Primitivas shadcn (Button, Card, Select, etc.)
  kpi-card.tsx      Card com sparkline SVG inline
  kpi-grid.tsx
lib/
  api.ts            fetchSessions - chama a API externa ou gera mock
  analytics.ts      Funcoes de agregacao
  company-auth.ts   Resolucao server-side dos tokens por companyId
  company-catalog.ts Lista publica de empresas para selecao
  mock-data.ts      Gerador deterministico de sessoes
  types.ts
  utils.ts          cn, formatNumber, formatDuration, etc.
```
