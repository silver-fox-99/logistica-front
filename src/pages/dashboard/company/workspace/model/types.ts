import type { Company } from "@/entities/company/model/types";

export type CompanyWorkspaceContext = {
    company: Company;
    reload: () => Promise<void>;
};