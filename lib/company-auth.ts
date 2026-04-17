import "server-only";

import type { SelectedAuthContext } from "./types";

interface CompanyAuthEntry {
  companyId: string;
  companyName: string;
  token: string;
}

const COMPANY_AUTH_ENTRIES: CompanyAuthEntry[] = [
  {
    companyName: "3 LAGOAS LOCAÇÕES",
    companyId: "87186aa9-4e0a-4335-98ea-ae440c65b329",
    token: "pn_UOOUHXZoS3CNP8Rqb1fmEG2FhBlsc0Cgo10pfwwvVY",
  },
  {
    companyName: "Clínica Urovascular",
    companyId: "61c52e23-a64e-4411-9988-aa6736b740b1",
    token: "pn_Ymoi2nTOhoZgxglXpBKt7wTEPSiUt0OVTbV2R7V5s",
  },
  {
    companyName: "EXPRESSO TURISMO",
    companyId: "db25a365-233b-44f1-b77b-4a1269ce551a",
    token: "pn_8J9XeTP4GqExeoyTAUAOgLuhRPQIknMA5VFnuCb3Y",
  },
  {
    companyName: "Fardim Tintas",
    companyId: "8229f7fc-9e2e-4a08-9fd3-6610cb737cfa",
    token: "pn_eg9DFDvieLbSNA8hLpT48xCU65W7PDZwSyDRz8N7mA",
  },
  {
    companyName: "Imperial Alimentos",
    companyId: "3516bfbb-b55c-4229-80b3-fbe7f362d3b7",
    token: "pn_0goabYVmAnoTxhTEQX0KFThwDwUeh2fRqjCgQaaCw",
  },
  {
    companyName: "LoqObra",
    companyId: "d81e15ed-2dc1-4868-85a0-486385850abc",
    token: "pn_3TzE9SzO25GfHTWvKeRmu87XX1ahpkU73iAETDssU",
  },
  {
    companyName: "Mestre da Obra - Chapecó",
    companyId: "c55e5dc0-11f0-4346-b98d-d8993849b9fe",
    token: "pn_2fjqFzvp6Nyy4YL05UKWXPJyzmn4EpdZ8uuhJ9q0",
  },
  {
    companyName: "Mestre da Obra Cotia",
    companyId: "dd470edd-32e5-43a7-8387-ed8f998489f5",
    token: "pn_ya3Vi8crlgx8AjeVGXNxvNdJ01rbnQFtuGUXOJF0KME",
  },
  {
    companyName: "Mestre da Obra Goiânia",
    companyId: "a8aec39f-97c4-49b3-afca-88d61d1823fc",
    token: "pn_Bxn4zRHDgvGEvyU5Ep1OnEfuJbMxoQf4R8DZI8gNE",
  },
  {
    companyName: "Mestre da Obra - Petrolina",
    companyId: "129bac4a-34a7-41ad-90ba-9627da7dadc3",
    token: "pn_Lisomu3IL5rD4cobWaCqqtMB9RgoUukL4EtXXphOw",
  },
  {
    companyName: "Paula Minchillo Coelho",
    companyId: "c988556a-a73b-450a-bf10-71641c1b7090",
    token: "pn_MehSgyk2oBBClLqshT8BGwEhMnsZPPsJa8Venrak",
  },
  {
    companyName: "SedLoc Equipamentos",
    companyId: "89e5e2a0-2dc0-46cf-ae94-60e42afbe746",
    token: "pn_ZGS1mKynxS8e70oYmFnt8eFF2vmd1Fg9jwWV2X9gwvE",
  },
];

const COMPANY_AUTH_BY_ID = new Map(
  COMPANY_AUTH_ENTRIES.map((entry) => [entry.companyId, entry]),
);

export function resolveCompanyAuth(companyId: string | null | undefined) {
  if (!companyId) return null;
  return COMPANY_AUTH_BY_ID.get(companyId.trim()) ?? null;
}

export function resolveSelectedAuthContext(
  companyId: string | null | undefined,
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
        source: "query",
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
