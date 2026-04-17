"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupByDay } from "@/lib/analytics";
import { formatDate, formatDateShort, formatNumber } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import type { Session } from "@/lib/types";

export function SessionsTimeline({ sessions }: { sessions: Session[] }) {
  const data = groupByDay(sessions);
  const [view, setView] = React.useState<"total" | "split">("total");

  const total = data.reduce((sum, bucket) => sum + bucket.total, 0);
  const peak = data.reduce(
    (max, bucket) => (bucket.total > max ? bucket.total : max),
    0,
  );

  return (
    <Card className="col-span-full">
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <div>
          <CardTitle>Atendimentos ao longo do tempo</CardTitle>
          <CardDescription>
            Volume diário de sessões no período selecionado
          </CardDescription>
          <div className="mt-2 flex items-center gap-3 text-xs font-tabular text-muted-foreground">
            <Badge variant="default">{formatNumber(total)} sessões</Badge>
            <span>Pico: {formatNumber(peak)}/dia</span>
            <span>
              Média: {formatNumber(Math.round(total / (data.length || 1)))}/dia
            </span>
          </div>
        </div>

        <Tabs value={view} onValueChange={(value) => setView(value as "total" | "split")}>
          <TabsList>
            <TabsTrigger value="total">Total</TabsTrigger>
            <TabsTrigger value="split">Concluídas x demais</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      <CardContent>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
            >
              <defs>
                <linearGradient id="timeline-total" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-1))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="timeline-finished" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="timeline-other" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor="hsl(var(--chart-6))"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="hsl(var(--chart-6))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />

              <XAxis
                dataKey="date"
                tickFormatter={(date) => formatDateShort(date)}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={false}
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
                    labelFormatter={(date) =>
                      formatDate(date, {
                        weekday: "short",
                        day: "2-digit",
                        month: "short",
                      })
                    }
                    formatter={(value) => formatNumber(Number(value))}
                  />
                }
                cursor={{
                  stroke: "hsl(var(--primary))",
                  strokeWidth: 1,
                  strokeDasharray: "3 3",
                }}
              />

              {view === "total" ? (
                <Area
                  type="monotone"
                  dataKey="total"
                  name="Atendimentos"
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  fill="url(#timeline-total)"
                  activeDot={{
                    r: 5,
                    strokeWidth: 2,
                    stroke: "hsl(var(--background))",
                  }}
                />
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="finished"
                    name="Concluídas"
                    stackId="1"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    fill="url(#timeline-finished)"
                  />
                  <Area
                    type="monotone"
                    dataKey="other"
                    name="Demais status"
                    stackId="1"
                    stroke="hsl(var(--chart-6))"
                    strokeWidth={2}
                    fill="url(#timeline-other)"
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
