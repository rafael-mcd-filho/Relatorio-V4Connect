"use client";

import type { CompanyCatalogEntry } from "@/lib/company-catalog";
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

interface CompanySelectorCardProps {
  companies: CompanyCatalogEntry[];
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function CompanySelectorCard({
  companies,
  value,
  onChange,
}: CompanySelectorCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Empresa</CardTitle>
        <CardDescription>
          Como a URL veio sem o parâmetro <code>conta</code>, escolha a empresa
          antes de buscar os dados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Empresa selecionada
          </div>
          <Select
            value={value ?? "__empty__"}
            onValueChange={(nextValue) =>
              onChange(nextValue === "__empty__" ? undefined : nextValue)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a empresa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__empty__">Selecione a empresa</SelectItem>
              {companies.map((company) => (
                <SelectItem key={company.companyId} value={company.companyId}>
                  {company.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
