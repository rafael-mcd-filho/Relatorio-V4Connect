"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { groupByHour } from "@/lib/analytics";
import { formatNumber } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import type { Session } from "@/lib/types";

export function HourlyActivity({ sessions }: { sessions: Session[] }) {
  const data = groupByHour(sessions);
  const max = Math.max(...data.map((d) => d.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade por hora</CardTitle>
        <CardDescription>
          Distribuição de atendimentos no dia (todos os dias agregados)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(l) => `${l} – ${l.replace("h", "")}:59h`}
                    formatter={(v) => `${formatNumber(Number(v))} sessões`}
                  />
                }
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {data.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.total === max
                        ? "hsl(var(--accent))"
                        : d.total > max * 0.6
                          ? "hsl(var(--primary))"
                          : "hsl(var(--chart-2) / 0.55)"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
