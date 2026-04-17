"use client";

import type { SelectedAuthContext } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AuthContextBannerProps {
  requestedCompanyId?: string;
  selectedAuth?: SelectedAuthContext | null;
}

export function AuthContextBanner({
  requestedCompanyId,
  selectedAuth,
}: AuthContextBannerProps) {
  if (!requestedCompanyId && !selectedAuth) return null;

  const sourceLabel =
    selectedAuth?.source === "query"
      ? "Mapeado pela URL"
      : selectedAuth?.source === "manual"
        ? "Selecionado na tela"
        : selectedAuth?.source === "env"
          ? "Token padrão do ambiente"
          : selectedAuth?.source === "mock"
            ? "Modo mock"
            : "Aguardando consulta";

  const toneClassName =
    selectedAuth?.source === "query"
      ? "border-primary/30 bg-primary/5"
      : selectedAuth?.source === "manual"
        ? "border-[hsl(var(--chart-1)/0.30)] bg-[hsl(var(--chart-1)/0.08)]"
        : selectedAuth?.source === "env"
          ? "border-[hsl(var(--chart-4)/0.30)] bg-[hsl(var(--chart-4)/0.08)]"
          : selectedAuth?.source === "mock"
            ? "border-[hsl(var(--chart-5)/0.30)] bg-[hsl(var(--chart-5)/0.08)]"
            : "border-border bg-muted/20";

  return (
    <div className={cn("rounded-xl border px-4 py-3", toneClassName)}>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Credencial carregada
          </span>
          <span className="text-sm font-medium text-foreground">
            {selectedAuth?.companyName ?? "Aguardando leitura da conta"}
          </span>
          <span className="text-xs text-muted-foreground">{sourceLabel}</span>
        </div>

        <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-3">
          <InfoRow label="Conta na URL" value={requestedCompanyId ?? "Nenhuma"} />
          <InfoRow
            label="Company ID usado"
            value={selectedAuth?.companyId ?? "Padrão do ambiente / mock"}
          />
          <InfoRow
            label="Token usado"
            value={selectedAuth?.token ?? "Sem token"}
          />
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border/60 bg-background/80 px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 break-all font-mono text-[11px] text-foreground">
        {value}
      </div>
    </div>
  );
}
