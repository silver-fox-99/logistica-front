import type { IntegrationScope } from "./types";

export const AVAILABLE_INTEGRATION_SCOPES: IntegrationScope[] = [
    "cargo:create",
    "cargo:read",
    "transport:create",
    "transport:read",
    "lookups:read",
    "geo:read",
];