import type {
    CreateIntegrationTokenPayload,
    IntegrationTokenItem,
    UpdateIntegrationTokenPayload,
} from "../model/types";
import { toLocalDatetimeInputValue } from "./formatters";
import type { IntegrationTokenFormState } from "@/features/admin-integration-tokens/model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

function mapOwnerToAdminUser(item: IntegrationTokenItem): AdminUser | null {
    if (!item.user) {
        return null;
    }

    return {
        id: item.user.id,
        email: item.user.email,
        first_name: item.user.first_name,
        last_name: item.user.last_name,
        phone: item.user.phone,
        is_admin: false,
        avatar: null,
        phone_verified_at: null,
        email_verified_at: null,
        registration_stage: "FINISHED" as never,
        status: "ACTIVE" as never,
        last_login_at: null,
        meta: {},
        crm_integrated_at: null,
        created_at: "",
        updated_at: "",
        deleted_at: null,
        binotel_id: null,
        type: null,
    };
}

export function mapIntegrationItemToForm(item: IntegrationTokenItem): IntegrationTokenFormState {
    return {
        user_id: item.user_id ?? "",
        owner: mapOwnerToAdminUser(item),
        name: item.name ?? "",
        company_name: item.company_name ?? "",
        scopes: Array.isArray(item.scopes) ? item.scopes : [],
        usage_limit: item.usage_limit != null ? String(item.usage_limit) : "",
        expires_at: item.expires_at ? toLocalDatetimeInputValue(item.expires_at) : "",
    };
}

export function buildCreateIntegrationPayload(
    form: IntegrationTokenFormState,
): CreateIntegrationTokenPayload {
    return {
        user_id: form.user_id,
        name: form.name.trim(),
        company_name: form.company_name.trim() || undefined,
        scopes: form.scopes,
        usage_limit: form.usage_limit.trim() ? Number(form.usage_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
}

export function buildUpdateIntegrationPayload(
    form: IntegrationTokenFormState,
): UpdateIntegrationTokenPayload {
    return {
        user_id: form.user_id,
        name: form.name.trim(),
        company_name: form.company_name.trim() || null,
        scopes: form.scopes,
        usage_limit: form.usage_limit.trim() ? Number(form.usage_limit) : null,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };
}