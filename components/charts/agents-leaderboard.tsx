"use client";

import { TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { groupByAgent } from "@/lib/analytics";
import { formatDuration, formatNumber, formatPercent } from "@/lib/utils";
import type { Session } from "@/lib/types";

export function AgentsLeaderboard({ sessions }: { sessions: Session[] }) {
  const data = groupByAgent(sessions, 8);
  const max = Math.max(...data.map((d) => d.total), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ranking de agentes</CardTitle>
        <CardDescription>
          Top {data.length} com mais atendimentos no período
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((agent, i) => {
            const pct = (agent.total / max) * 100;
            const resolution = (agent.finished / agent.total) * 100;
            return (
              <div key={agent.name} className="group">
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-semibold text-muted-foreground">
                      {i + 1}
                    </div>
                    <span className="truncate text-foreground font-medium">
                      {agent.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-tabular text-muted-foreground shrink-0">
                    <span title="Tempo médio de 1ª resposta">
                      {formatDuration(agent.avgFirst)}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 text-success"
                      title="Taxa de resolução"
                    >
                      <TrendingUp className="h-3 w-3" />
                      {formatPercent(resolution, 0)}
                    </span>
                    <span className="font-semibold text-foreground w-10 text-right">
                      {formatNumber(agent.total)}
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-[width] duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
