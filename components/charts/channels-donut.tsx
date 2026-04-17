"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupByChannel } from "@/lib/analytics";
import { formatNumber, formatPercent } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import type { Session } from "@/lib/types";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-6))",
];

export function ChannelsDonut({ sessions }: { sessions: Session[] }) {
  const data = groupByChannel(sessions);
  const total = data.reduce((a, c) => a + c.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição por canal</CardTitle>
        <CardDescription>
          Origem dos atendimentos no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative h-[180px] w-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltipContent
                      hideLabel
                      formatter={(v) =>
                        `${formatNumber(Number(v))} (${formatPercent(
                          (Number(v) / total) * 100,
                        )})`
                      }
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Total
              </span>
              <span className="font-display text-xl font-semibold font-tabular">
                {formatNumber(total)}
              </span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            {data.map((item, i) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="truncate text-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground font-tabular">
                  <span className="text-foreground font-medium">
                    {formatNumber(item.value)}
                  </span>
                  <span className="tabular-nums w-10 text-right">
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
