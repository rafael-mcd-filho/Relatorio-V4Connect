"use client";

import { RefreshCcw } from "lucide-react";

export function LoadingModal({
  open,
}: {
  open: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RefreshCcw className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <div className="text-base font-semibold text-foreground">
              Carregando dados
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              Buscando sessoes, cruzando contatos e recalculando as metricas.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
