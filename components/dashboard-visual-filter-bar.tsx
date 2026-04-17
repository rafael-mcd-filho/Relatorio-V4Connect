"use client";

import type { DashboardVisualFilters } from "@/lib/dashboard-analytics";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ChannelOption {
  id: string;
  label: string;
}

export function DashboardVisualFilterBar({
  filters,
  channels,
  onChange,
}: {
  filters: DashboardVisualFilters;
  channels: ChannelOption[];
  onChange: (filters: DashboardVisualFilters) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>
          Refinam a leitura do dashboard sem refazer a requisição.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <FilterCheckbox
          checked={filters.adsOnly}
          title="Somente anúncio"
          description="Inclui apenas contatos com a tag Anúncio ou Anúncios."
          onChange={(checked) =>
            onChange({
              ...filters,
              adsOnly: checked,
            })
          }
        />

        <FilterCheckbox
          checked={filters.newContactsOnly}
          title="Contatos novos"
          description="Inclui apenas contatos criados pela primeira vez dentro do período."
          onChange={(checked) =>
            onChange({
              ...filters,
              newContactsOnly: checked,
            })
          }
        />

        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Canal
          </div>
          <Select
            value={filters.channelId}
            onValueChange={(value) =>
              onChange({
                ...filters,
                channelId: value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os canais</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel.id} value={channel.id}>
                  {channel.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Resultado
          </div>
          <Select
            value={filters.outcome}
            onValueChange={(value) =>
              onChange({
                ...filters,
                outcome: value as DashboardVisualFilters["outcome"],
              })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="won">Ganho</SelectItem>
              <SelectItem value="lost">Perdido</SelectItem>
              <SelectItem value="unclassified">Sem classificação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}

function FilterCheckbox({
  checked,
  title,
  description,
  onChange,
}: {
  checked: boolean;
  title: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-border"
      />
      <div>
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </label>
  );
}
