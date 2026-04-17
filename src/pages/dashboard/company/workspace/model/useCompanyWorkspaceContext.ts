import { useOutletContext } from "react-router-dom";
import type { CompanyWorkspaceContext } from "./types";

export function useCompanyWorkspaceContext() {
    return useOutletContext<CompanyWorkspaceContext>();
}