import { NextRequest, NextResponse } from "next/server";
import { fetchSessions } from "@/lib/api";
import { resolveSelectedAuthContext } from "@/lib/company-auth";

function resolvePublicErrorResponse(error: unknown) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("não está mapeada")) {
    return {
      status: 400,
      error: "A conta informada não está cadastrada para consulta.",
    };
  }

  if (/\b(401|403)\b/.test(message)) {
    return {
      status: 502,
      error:
        "Não foi possível autenticar a consulta da empresa selecionada.",
    };
  }

  if (/\b429\b/.test(message)) {
    return {
      status: 502,
      error:
        "A consulta está temporariamente indisponível por limite de uso. Tente novamente em instantes.",
    };
  }

  return {
    status: 502,
    error: "Não foi possível consultar os dados da empresa neste momento.",
  };
}

export async function GET(request: NextRequest) {
  const fromValue = request.nextUrl.searchParams.get("from");
  const toValue = request.nextUrl.searchParams.get("to");
  const companyId = request.nextUrl.searchParams.get("conta");
  const authSource =
    request.nextUrl.searchParams.get("authSource") === "manual"
      ? "manual"
      : "query";

  if (!fromValue || !toValue) {
    return NextResponse.json(
      { error: "Os parâmetros from e to são obrigatórios." },
      { status: 400 },
    );
  }

  const from = new Date(fromValue);
  const to = new Date(toValue);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return NextResponse.json(
      { error: "Os parâmetros from e to precisam ser datas válidas." },
      { status: 400 },
    );
  }

  try {
    const { token, selectedAuth } = resolveSelectedAuthContext(
      companyId,
      authSource,
    );
    const result = await fetchSessions({ from, to, token });
    return NextResponse.json(
      {
        sessions: result.sessions,
        debug: result.debug,
        selectedAuth,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Falha ao consultar /api/sessions", error);
    const publicError = resolvePublicErrorResponse(error);

    return NextResponse.json(
      { error: publicError.error },
      { status: publicError.status },
    );
  }
}
