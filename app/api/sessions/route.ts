import { NextRequest, NextResponse } from "next/server";
import { fetchSessions } from "@/lib/api";
import { resolveSelectedAuthContext } from "@/lib/company-auth";

export async function GET(request: NextRequest) {
  const fromValue = request.nextUrl.searchParams.get("from");
  const toValue = request.nextUrl.searchParams.get("to");
  const companyId = request.nextUrl.searchParams.get("conta");

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
    const { token, selectedAuth } = resolveSelectedAuthContext(companyId);
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
    const status =
      error instanceof Error &&
      error.message.includes("não está mapeada")
        ? 400
        : 502;

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Não foi possível consultar os dados.",
      },
      { status },
    );
  }
}
