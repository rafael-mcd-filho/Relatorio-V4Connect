import { BarChart3 } from "lucide-react";
import { Card } from "@/components/ui/card";

export function EmptyState({
  title = "Os gráficos aparecem depois da primeira consulta",
  description = "Defina o período acima e busque os dados para montar a leitura analítica.",
  icon = <BarChart3 className="h-6 w-6 text-primary" />,
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 p-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        {icon}
      </div>
      <div>
        <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
          Dashboard
        </div>
        <h3 className="font-display text-xl font-semibold tracking-tight">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
      </div>
    </Card>
  );
}
