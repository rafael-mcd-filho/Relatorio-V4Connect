"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricLabel } from "@/components/metric-tooltip";
import { groupByStatus } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";
import { ChartTooltipContent } from "@/components/charts/chart-tooltip";
import type { Session } from "@/lib/types";

const STATUS_META: Record<
  string,
  { label: string; color: string }
> = {
  Finished: {
    label: "Concluídas",
    color: "hsl(var(--chart-3))",
  },
  Active: {
    label: "Em andamento",
    color: "hsl(var(--chart-1))",
  },
  Waiting: {
    label: "Aguardando",
    color: "hsl(var(--chart-2))",
  },
  Transferred: {
    label: "Transferidas",
    color: "hsl(var(--chart-4))",
  },
  Abandoned: {
    label: "Abandonadas",
    color: "hsl(var(--chart-6))",
  },
  Hidden: {
    label: "Ocultas",
    color: "hsl(var(--muted-foreground))",
  },
  Other: {
    label: "Indefinidos / outros",
    color: "hsl(var(--chart-5))",
  },
};

export function StatusBreakdown({ sessions }: { sessions: Session[] }) {
  const data = groupByStatus(sessions)
    .sort((a, b) => b.value - a.value)
    .map((item) => ({
      ...item,
      label: STATUS_META[item.name]?.label ?? item.name,
      color: STATUS_META[item.name]?.color ?? "hsl(var(--muted-foreground))",
    }));
  const total = data.reduce((sum, status) => sum + status.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <MetricLabel
            label="Distribuição por status"
            explanation="Agrupa os atendimentos do período pelo status em que eles ficaram ou foram encerrados."
          />
        </CardTitle>
        <CardDescription>
          {formatNumber(total)} atendimentos no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="relative mx-auto h-[190px] w-[190px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={54}
                  outerRadius={84}
                  paddingAngle={2}
                  strokeWidth={0}
                  animationDuration={600}
                  animationEasing="ease-out"
                >
                  {data.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(value) =>
                        `${formatNumber(Number(value))} (${formatPercent(
                          (Number(value) / total) * 100,
                          0,
                        )})`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                Total
              </span>
              <span className="font-display text-3xl font-semibold font-tabular text-foreground">
                {formatNumber(total)}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs transition-all duration-200 hover:bg-muted/30 px-2 py-1.5 rounded-lg"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full transition-transform duration-200 hover:scale-125"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-foreground">
                    <MetricLabel
                      label={item.label}
                      explanation="Mostra quantos atendimentos do período terminaram ou ficaram nesse status."
                    />
                  </span>
                </div>
                <div className="flex items-center gap-2 font-tabular text-muted-foreground/80">
                  <span className="font-medium text-foreground">
                    {formatNumber(item.value)}
                  </span>
                  <span className="w-10 text-right">
                    {formatPercent((item.value / total) * 100, 0)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
