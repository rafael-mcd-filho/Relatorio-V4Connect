"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { groupByDepartment } from "@/lib/analytics";
import { formatNumber } from "@/lib/utils";
import { ChartTooltipContent } from "./chart-tooltip";
import type { Session } from "@/lib/types";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-6))",
];

export function DepartmentsBar({ sessions }: { sessions: Session[] }) {
  const data = groupByDepartment(sessions);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Volume por departamento</CardTitle>
        <CardDescription>
          Atendimentos distribuídos entre equipes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={data}
              margin={{ top: 0, right: 40, bottom: 0, left: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                horizontal={false}
              />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
                axisLine={false}
                tickLine={false}
                width={130}
              />
              <Tooltip
                content={
                  <ChartTooltipContent
                    formatter={(v) => `${formatNumber(Number(v))} atendimentos`}
                  />
                }
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              />
              <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                <LabelList
                  dataKey="value"
                  position="right"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={11}
                  formatter={(v: number) => formatNumber(v)}
                />
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
