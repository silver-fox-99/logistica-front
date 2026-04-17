import { matchPath, useLocation } from "react-router-dom";

export function useIsCompanyWorkspace() {
    const location = useLocation();

    return Boolean(
        matchPath("/dashboard/company/:id/*", location.pathname) ||
        matchPath("/dashboard/company/:id", location.pathname)
    );
}