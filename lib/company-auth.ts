import "server-only";

import { COMPANY_CATALOG } from "./company-catalog";
import type { SelectedAuthContext } from "./types";

type SelectionSource = "query" | "manual";

const COMPANY_TOKEN_BY_ID: Record<string, string> = {
  "87186aa9-4e0a-4335-98ea-ae440c65b329":
    "pn_UOOUHXZoS3CNP8Rqb1fmEG2FhBlsc0Cgo10pfwwvVY",
  "61c52e23-a64e-4411-9988-aa6736b740b1":
    "pn_Ymoi2nTOhoZgxglXpBKt7wTEPSiUt0OVTbV2R7V5s",
  "db25a365-233b-44f1-b77b-4a1269ce551a":
    "pn_8J9XeTP4GqExeoyTAUAOgLuhRPQIknMA5VFnuCb3Y",
  "8229f7fc-9e2e-4a08-9fd3-6610cb737cfa":
    "pn_eg9DFDvieLbSNA8hLpT48xCU65W7PDZwSyDRz8N7mA",
  "3516bfbb-b55c-4229-80b3-fbe7f362d3b7":
    "pn_0goabYVmAnoTxhTEQX0KFThwDwUeh2fRqjCgQaaCw",
  "d81e15ed-2dc1-4868-85a0-486385850abc":
    "pn_3TzE9SzO25GfHTWvKeRmu87XX1ahpkU73iAETDssU",
  "c55e5dc0-11f0-4346-b98d-d8993849b9fe":
    "pn_2fjqFzvp6Nyy4YL05UKWXPJyzmn4EpdZ8uuhJ9q0",
  "dd470edd-32e5-43a7-8387-ed8f998489f5":
    "pn_ya3Vi8crlgx8AjeVGXNxvNdJ01rbnQFtuGUXOJF0KME",
  "a8aec39f-97c4-49b3-afca-88d61d1823fc":
    "pn_Bxn4zRHDgvGEvyU5Ep1OnEfuJbMxoQf4R8DZI8gNE",
  "129bac4a-34a7-41ad-90ba-9627da7dadc3":
    "pn_Lisomu3IL5rD4cobWaCqqtMB9RgoUukL4EtXXphOw",
  "c988556a-a73b-450a-bf10-71641c1b7090":
    "pn_MehSgyk2oBBClLqshT8BGwEhMnsZPPsJa8Venrak",
  "89e5e2a0-2dc0-46cf-ae94-60e42afbe746":
    "pn_ZGS1mKynxS8e70oYmFnt8eFF2vmd1Fg9jwWV2X9gwvE",
};

const COMPANY_AUTH_BY_ID = new Map(
  COMPANY_CATALOG.map((entry) => [
    entry.companyId,
    {
      ...entry,
      token: COMPANY_TOKEN_BY_ID[entry.companyId],
    },
  ]),
);

export function resolveCompanyAuth(companyId: string | null | undefined) {
  if (!companyId) return null;
  return COMPANY_AUTH_BY_ID.get(companyId.trim()) ?? null;
}

export function resolveSelectedAuthContext(
  companyId: string | null | undefined,
  selectionSource: SelectionSource = "query",
): {
  token?: string;
  selectedAuth: SelectedAuthContext;
} {
  const mapped = resolveCompanyAuth(companyId);

  if (companyId && !mapped) {
    throw new Error(`A conta ${companyId} não está mapeada para nenhum token.`);
  }

  if (mapped) {
    return {
      token: mapped.token,
      selectedAuth: {
        source: selectionSource,
        companyId: mapped.companyId,
        companyName: mapped.companyName,
        token: mapped.token,
      },
    };
  }

  const envToken =
    process.env.ANALYTICS_API_TOKEN ??
    process.env.HELENA_TOKEN ??
    process.env.NEXT_PUBLIC_ANALYTICS_API_TOKEN ??
    process.env.NEXT_PUBLIC_HELENA_TOKEN;

  if (envToken) {
    return {
      token: envToken,
      selectedAuth: {
        source: "env",
        companyName: "Token padrão do ambiente",
        token: envToken,
      },
    };
  }

  return {
    selectedAuth: {
      source: "mock",
      companyName: "Modo mock",
    },
  };
}
