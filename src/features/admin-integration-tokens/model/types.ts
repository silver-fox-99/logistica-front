import type {
    IntegrationScope,
    IntegrationStatus,
} from "@/entities/integration/model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

export type IntegrationFiltersState = {
    search: string;
    status: "" | IntegrationStatus;
    is_active: "" | "true" | "false";
    owner: AdminUser | null;
};

export type IntegrationTokenFormState = {
    user_id: string;
    owner: AdminUser | null;
    name: string;
    company_name: string;
    scopes: IntegrationScope[];
    usage_limit: string;
    expires_at: string;
};

export const INITIAL_INTEGRATION_FILTERS: IntegrationFiltersState = {
    search: "",
    status: "",
    is_active: "",
    owner: null,
};

export const INITIAL_INTEGRATION_FORM: IntegrationTokenFormState = {
    user_id: "",
    owner: null,
    name: "",
    company_name: "",
    scopes: [],
    usage_limit: "",
    expires_at: "",
};