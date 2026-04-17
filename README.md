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

Acesse http://localhost:3000

Sem token configurado o painel usa dados mockados (~520 sessoes geradas com distribuicao realista de horarios, canais, departamentos e status).

## Variaveis de ambiente

Copie `.env.local.example` para `.env.local`:

```env
ANALYTICS_API_BASE=https://api.sua-origem.com
ANALYTICS_API_TOKEN=seu_token_aqui
```

> Em producao, prefira manter o token no servidor via `app/api/sessions/route.ts` para nao expor a credencial no browser.

## Deploy no Vercel

1. `git init && git add -A && git commit -m "feat: initial dashboard"`
2. Crie um repositorio no GitHub e faca o push.
3. Em [vercel.com/new](https://vercel.com/new), importe o repositorio.
4. Configure as variaveis `ANALYTICS_API_BASE` e `ANALYTICS_API_TOKEN` no projeto.
5. Deploy automatico. O `vercel.json` ja define regiao `gru1` (Sao Paulo) e headers basicos de seguranca.

## Estrutura

```text
app/
  layout.tsx        Root layout + fonts + theme provider
  page.tsx          Dashboard principal (client component)
  globals.css       Tokens de cor + utilidades
components/
  charts/           Graficos Recharts
  ui/               Primitivas shadcn (Button, Card, Select, etc.)
  filter-bar.tsx    Barra de filtros + CTA Obter dados
  date-range-picker.tsx
  kpi-card.tsx      Card com sparkline SVG inline
  kpi-grid.tsx
lib/
  api.ts            fetchSessions - chama a API externa ou gera mock
  analytics.ts      Funcoes de agregacao
  mock-data.ts      Gerador deterministico de sessoes
  types.ts
  utils.ts          cn, formatNumber, formatDuration, etc.
```

## Paleta

Light: `#F8FAFC` fundo, `#2563EB` primary, `#F97316` CTA, `#1E293B` texto.
Dark: fundo `#0B1120`, primary `#3B82F6`.

Tokens em `app/globals.css` (`--primary`, `--accent`, `--chart-1` ... `--chart-6`).
