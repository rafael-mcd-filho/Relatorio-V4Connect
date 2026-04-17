"use client";

import * as React from "react";
import { subDays, startOfDay, endOfDay } from "date-fns";
import { AlertCircle } from "lucide-react";
import { DashboardVisualFilterBar } from "@/components/dashboard-visual-filter-bar";
import { PeriodControls } from "@/components/period-controls";
import { KpiGrid } from "@/components/kpi-grid";
import { CommercialInsightsCard } from "@/components/commercial-insights-card";
import { OperationsInsightsCard } from "@/components/operations-insights-card";
import { OutcomeReasonsCard } from "@/components/outcome-reasons-card";
import { TemporalInsightsCard } from "@/components/temporal-insights-card";
import { LoadingModal } from "@/components/loading-modal";
import { StatusBreakdown } from "@/components/charts/status-breakdown";
import { EmptyState } from "@/components/empty-state";
import { DashboardSkeleton } from "@/components/dashboard-skeleton";
import { AuthContextBanner } from "@/components/auth-context-banner";
import { CohortConversionCard } from "@/components/cohort-conversion-card";
import { CompanySelectorCard } from "@/components/company-selector-card";
import { ConversionFunnelCard } from "@/components/conversion-funnel-card";
import {
  computeDashboardAnalytics,
  DEFAULT_DASHBOARD_VISUAL_FILTERS,
  filterSessionsByVisualFilters,
} from "@/lib/dashboard-analytics";
import { fetchSessions } from "@/lib/client-api";
import { COMPANY_CATALOG } from "@/lib/company-catalog";
import type { SelectedAuthContext, Session } from "@/lib/types";

export default function DashboardPage() {
  const [from, setFrom] = React.useState<Date | undefined>(
    startOfDay(subDays(new Date(), 6)),
  );
  const [to, setTo] = React.useState<Date | undefined>(endOfDay(new Date()));

  const [sessions, setSessions] = React.useState<Session[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedAuth, setSelectedAuth] =
    React.useState<SelectedAuthContext | null>(null);
  const [urlCompanyResolved, setUrlCompanyResolved] = React.useState(false);
  const [companyIdFromUrl, setCompanyIdFromUrl] =
    React.useState<string | undefined>(undefined);
  const [selectedCompanyId, setSelectedCompanyId] =
    React.useState<string | undefined>(undefined);
  const [visualFilters, setVisualFilters] = React.useState(
    DEFAULT_DASHBOARD_VISUAL_FILTERS,
  );

  React.useEffect(() => {
    const nextCompanyId =
      new URLSearchParams(window.location.search).get("conta")?.trim() ||
      undefined;
    setCompanyIdFromUrl(nextCompanyId);
    setUrlCompanyResolved(true);
  }, []);

  const activeCompanyId = companyIdFromUrl ?? selectedCompanyId;
  const activeSelectionSource = companyIdFromUrl ? "query" : "manual";

  React.useEffect(() => {
    setSelectedAuth(null);
    setError(null);
  }, [activeCompanyId]);

  const handleChange = (f?: Date, t?: Date) => {
    setFrom(f);
    setTo(t);
  };

  const handleFetch = async () => {
    if (!from || !to) return;

    if (!companyIdFromUrl && !selectedCompanyId) {
      setError("Selecione uma empresa antes de buscar os dados.");
      setSelectedAuth(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchSessions({
        from,
        to,
        companyId: activeCompanyId,
        selectionSource: activeSelectionSource,
      });
      setSessions(result.sessions);
      setSelectedAuth(result.selectedAuth ?? null);
    } catch (e) {
      setSelectedAuth(null);
      setError(
        e instanceof Error ? e.message : "Não foi possível carregar os dados.",
      );
    } finally {
      setLoading(false);
    }
  };

  const sessionsInRange =
    sessions && from && to
      ? sessions.filter((session) => {
          const timestamp = new Date(session.createdAt).getTime();
          return (
            Number.isFinite(timestamp) &&
            timestamp >= from.getTime() &&
            timestamp <= to.getTime()
          );
        })
      : sessions;

  const baseAnalytics =
    sessionsInRange && from && to
      ? computeDashboardAnalytics(sessionsInRange, { from, to })
      : null;

  const filteredSessions =
    sessionsInRange && baseAnalytics
      ? filterSessionsByVisualFilters(
          sessionsInRange,
          baseAnalytics.items,
          visualFilters,
        )
      : sessionsInRange;

  const analytics =
    filteredSessions && from && to
      ? computeDashboardAnalytics(filteredSessions, { from, to })
      : null;

  const channelOptions = React.useMemo(() => {
    if (!sessionsInRange) return [];

    const unique = new Map<string, string>();

    for (const session of sessionsInRange) {
      const channel = session.channel;
      if (!channel?.id) continue;

      const label = channel.humanId
        ? `${channel.humanId} - ${channel.name}`
        : channel.name;

      unique.set(channel.id, label);
    }

    return Array.from(unique.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sessionsInRange]);

  const showInitialSkeleton = loading && !sessions;

  return (
    <main className="mx-auto w-full max-w-[1400px] space-y-5 p-4 md:p-6">
      <LoadingModal open={loading} />

      {urlCompanyResolved && !companyIdFromUrl && (
        <CompanySelectorCard
          companies={COMPANY_CATALOG}
          value={selectedCompanyId}
          onChange={setSelectedCompanyId}
        />
      )}

      <AuthContextBanner
        requestedCompanyId={companyIdFromUrl}
        selectedAuth={selectedAuth}
      />

      <PeriodControls
        from={from}
        to={to}
        onChange={handleChange}
        loading={loading}
        onFetch={handleFetch}
        readyToFetch={!!companyIdFromUrl || !!selectedCompanyId}
      />

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Erro ao carregar dados</div>
            <div className="mt-0.5 text-destructive/80">{error}</div>
          </div>
        </div>
      )}

      {showInitialSkeleton ? (
        <DashboardSkeleton />
      ) : !sessions ? (
        <EmptyState />
      ) : (sessionsInRange?.length ?? 0) === 0 ? (
        <EmptyState
          title="Nenhum atendimento encontrado"
          description="Não há registros no período selecionado. Tente ampliar o intervalo."
        />
      ) : (
        <div className="animate-fade-in space-y-5">
          <DashboardVisualFilterBar
            filters={visualFilters}
            channels={channelOptions}
            onChange={setVisualFilters}
          />

          {analytics && analytics.kpis.totalSessions === 0 ? (
            <EmptyState
              title="Nenhum registro para os filtros ativos"
              description="Ajuste os filtros visuais para ampliar novamente a leitura."
            />
          ) : analytics && (
            <KpiGrid sessions={filteredSessions ?? []} analytics={analytics} />
          )}

          {analytics && analytics.kpis.totalSessions > 0 && (
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
              <div className="xl:col-span-4">
                <CohortConversionCard analytics={analytics} />
              </div>
              <div className="xl:col-span-8">
                <ConversionFunnelCard analytics={analytics} />
              </div>
            </div>
          )}

          {analytics && analytics.kpis.totalSessions > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <StatusBreakdown sessions={filteredSessions ?? []} />
              </div>
              <div className="lg:col-span-8">
                <OutcomeReasonsCard analytics={analytics} />
              </div>
            </div>
          )}

          {analytics && analytics.kpis.totalSessions > 0 && (
            <TemporalInsightsCard analytics={analytics} />
          )}

          {analytics && analytics.kpis.totalSessions > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <CommercialInsightsCard analytics={analytics} />
              <OperationsInsightsCard analytics={analytics} />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
