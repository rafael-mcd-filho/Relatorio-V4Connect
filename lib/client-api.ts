import type { FetchSessionsResult } from "./types";

export interface FetchSessionsClientParams {
  from: Date;
  to: Date;
  companyId?: string;
  signal?: AbortSignal;
}

export async function fetchSessions({
  from,
  to,
  companyId,
  signal,
}: FetchSessionsClientParams): Promise<FetchSessionsResult> {
  const params = new URLSearchParams({
    from: from.toISOString(),
    to: to.toISOString(),
  });
  if (companyId) {
    params.set("conta", companyId);
  }

  const res = await fetch(`/api/sessions?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
    signal,
  });

  const body = await res
    .json()
    .catch(() => ({ error: `Falha ao ler a resposta de /api/sessions.` }));

  if (!res.ok) {
    throw new Error(
      typeof body?.error === "string"
        ? body.error
        : `Falha ao consultar /api/sessions (${res.status}).`,
    );
  }

  return body as FetchSessionsResult;
}
