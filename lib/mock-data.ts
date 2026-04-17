import type {
  Agent,
  ChannelType,
  Department,
  Session,
  SessionStatus,
} from "./types";

const AGENTS: Agent[] = [
  { id: "a1", name: "Ana Martins" },
  { id: "a2", name: "Bruno Costa" },
  { id: "a3", name: "Camila Reis" },
  { id: "a4", name: "Diego Alves" },
  { id: "a5", name: "Eduarda Lima" },
  { id: "a6", name: "Felipe Souza" },
  { id: "a7", name: "Gabriela Nunes" },
  { id: "a8", name: "Henrique Dias" },
];

const DEPARTMENTS: Department[] = [
  { id: "d1", name: "Suporte Tecnico" },
  { id: "d2", name: "Comercial" },
  { id: "d3", name: "Financeiro" },
  { id: "d4", name: "Retencao" },
  { id: "d5", name: "Pos-venda" },
];

const CHANNEL_TYPES: ChannelType[] = [
  "WhatsApp",
  "Webchat",
  "Instagram",
  "Messenger",
  "Email",
  "Telegram",
];

const STATUSES: SessionStatus[] = [
  "Active",
  "Waiting",
  "Finished",
  "Abandoned",
  "Transferred",
  "Other",
];

const CLASSIFICATIONS = [
  {
    id: "won_andaimes",
    name: "Locacao confirmada - Andaimes",
    category: "WON",
    categoryName: "Ganho",
    description: "Locacao confirmada - Andaimes",
    amountRange: [180, 1800] as const,
  },
  {
    id: "won_renovacao",
    name: "Renovacao da locacao",
    category: "WON",
    categoryName: "Ganho",
    description: "Renovacao da locacao",
    amountRange: [120, 900] as const,
  },
  {
    id: "lost_preco",
    name: "Preco fora do orcamento",
    category: "LOST",
    categoryName: "Perdido",
    description: "Preco fora do orcamento",
    amountRange: [0, 0] as const,
  },
  {
    id: "lost_sem_resposta",
    name: "Nao respondeu",
    category: "LOST",
    categoryName: "Perdido",
    description: "Nao respondeu",
    amountRange: [0, 0] as const,
  },
  {
    id: "other",
    name: "Outros assuntos",
    category: "OTHER",
    categoryName: "Outros",
    description: "Outros assuntos",
    amountRange: [0, 0] as const,
  },
];

function pick<T>(arr: T[], weights?: number[]): T {
  if (!weights) return arr[Math.floor(Math.random() * arr.length)];
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i];
    if (r <= 0) return arr[i];
  }
  return arr[arr.length - 1];
}

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function hashRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateMockSessions(
  from: Date,
  to: Date,
  count = 420,
): Session[] {
  const sessions: Session[] = [];
  const range = to.getTime() - from.getTime();
  const rnd = hashRandom(from.getTime() + to.getTime() + count);

  for (let i = 0; i < count; i++) {
    const created = new Date(from.getTime() + rnd() * range);
    const hour = created.getHours();
    const businessHourBoost = hour >= 9 && hour <= 18 ? 1.6 : 0.4;

    if (rnd() > businessHourBoost * 0.5) continue;

    const status = pick(STATUSES, [10, 8, 58, 10, 8, 6]);
    const duration =
      status === "Abandoned"
        ? randomBetween(15, 120)
        : randomBetween(90, 1800);
    const firstResponse = randomBetween(5, 180);

    const closedAt =
      status === "Active" || status === "Waiting"
        ? undefined
        : new Date(created.getTime() + duration * 1000).toISOString();

    const channelType = pick(CHANNEL_TYPES, [55, 18, 10, 6, 7, 4]);
    const agent = pick(AGENTS);
    const department = pick(DEPARTMENTS);
    const classification = pick(CLASSIFICATIONS, [18, 14, 16, 18, 34]);
    const contactCreatedAt =
      rnd() < 0.35
        ? created.toISOString()
        : new Date(
            created.getTime() - randomBetween(1, 14) * 24 * 60 * 60 * 1000,
          ).toISOString();
    const hasAdTag = rnd() < 0.28;
    const tagNames = [
      ...(hasAdTag ? ["Anuncio"] : []),
      ...(rnd() < 0.18 ? ["Cliente recorrente"] : []),
    ];
    const utm =
      hasAdTag || rnd() < 0.18
        ? {
            source: pick(["GOOGLE", "INSTAGRAM", "FACEBOOK"]),
            campaign: pick(["TOPO", "ANDAIMES", "CONVERSE CONOSCO"]),
            content: pick(["topo", "andaimes", "remarketing"]),
          }
        : null;
    const amount =
      classification.amountRange[1] > 0
        ? randomBetween(
            classification.amountRange[0],
            classification.amountRange[1],
          )
        : 0;

    sessions.push({
      id: `s_${i}_${created.getTime()}`,
      status,
      rawStatus: status.toUpperCase(),
      createdAt: created.toISOString(),
      updatedAt: closedAt ?? created.toISOString(),
      startedAt: created.toISOString(),
      closedAt,
      durationSeconds: duration,
      firstResponseSeconds: firstResponse,
      firstResponseAt: new Date(
        created.getTime() + firstResponse * 1000,
      ).toISOString(),
      agent,
      department,
      channelType,
      channel: {
        id: `c_${channelType}`,
        name: channelType,
        humanId: channelType === "WhatsApp" ? "(11) 99999-0000" : undefined,
        type: channelType,
      },
      classification: {
        id: `cls_${classification.id}`,
        name: classification.name,
        category: classification.category,
        categoryName: classification.categoryName,
        description: classification.description,
        amount,
      },
      contact: {
        id: `ct_${i}`,
        name: `Contato ${i + 1}`,
        createdAt: contactCreatedAt,
        tagNames,
        utm,
      },
      utm,
      messageCount: randomBetween(2, 40),
      rating:
        status === "Finished"
          ? Math.min(5, Math.max(1, Math.round(3.5 + (rnd() - 0.3) * 2)))
          : undefined,
    });
  }

  return sessions.sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

export { AGENTS, DEPARTMENTS, CHANNEL_TYPES, STATUSES, CLASSIFICATIONS };
