export type IntegrationScope =
    | "cargo:create"
    | "cargo:read"
    | "transport:create"
    | "transport:read"
    | "lookups:read"
    | "geo:read"
    | "user:create";

export type IntegrationStatus = "ACTIVE" | "REVOKED";

export type IntegrationTokenOwner = {
    id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    phone: string;
};

export type IntegrationTokenItem = {
    id: string;
    user_id: string;
    user?: IntegrationTokenOwner | null;

    name: string;
    company_name: string | null;

    token_prefix: string;
    status: IntegrationStatus;
    is_active: boolean;

    usage_limit: number | null;
    usage_count: number;

    expires_at: string | null;
    scopes: IntegrationScope[];

    created_at: string;
    updated_at: string;
    deleted_at?: string | null;
    meta?: {
        default_referred_user_discount_percent?: number | null;
        default_referred_user_discount_days?: number | null;
    } | null;
};

export type CreateIntegrationTokenPayload = {
    user_id: string;
    name: string;
    company_name?: string;
    scopes: IntegrationScope[];
    usage_limit: number | null;
    expires_at: string | null;
    meta?: Record<string, any> | null;
};

export type UpdateIntegrationTokenPayload = {
    user_id: string;
    name: string;
    company_name: string | null;
    scopes: IntegrationScope[];
    usage_limit: number | null;
    expires_at: string | null;
    meta?: Record<string, any> | null;
};