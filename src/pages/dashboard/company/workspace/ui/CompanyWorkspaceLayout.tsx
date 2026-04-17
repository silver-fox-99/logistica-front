import { Alert, Box, CircularProgress } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import { useCompanyWorkspace } from "../model/useCompanyWorkspace";
import { CompanyWorkspaceHeader } from "@/widgets/company/company-workspace-header/ui/CompanyWorkspaceHeader";
import type { CompanyWorkspaceContext } from "../model/types";

export default function CompanyWorkspaceLayout() {
    const { id = "" } = useParams();
    const { company, isLoading, error, reload } = useCompanyWorkspace(id);

    if (isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!company) return null;

    const context: CompanyWorkspaceContext = {
        company,
        reload,
    };

    return (
        <Box sx={{ py: 3 }}>
            <Box sx={{ display: "grid", gap: 3 }}>
                <CompanyWorkspaceHeader company={company} />
                <Outlet context={context} />
            </Box>
        </Box>
    );
}