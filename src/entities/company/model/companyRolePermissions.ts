import type { CompanyMemberRole, CompanyPermissionKey } from "@/entities/company/model/types";

export const companyPermissionLabelMap: Record<CompanyPermissionKey, string> = {
    company_view: "View company profile",
    company_manage: "Edit company information",

    members_view: "View team members",
    members_manage: "Manage team members",

    invitations_view: "View invitations",
    invitations_manage: "Send and cancel invitations",

    join_requests_view: "View join requests",
    join_requests_manage: "Review join requests",

    documents_view: "View company documents",
    documents_upload: "Upload and remove documents",

    cargo_create: "Create cargo listings",
    cargo_edit: "Edit cargo listings",
    cargo_delete: "Delete cargo listings",

    transport_create: "Create transport listings",
    transport_edit: "Edit transport listings",
    transport_delete: "Delete transport listings",
};

export const companyRolePermissionMap: Record<CompanyMemberRole, CompanyPermissionKey[]> = {
    OWNER: [
        "company_view",
        "company_manage",
        "members_view",
        "members_manage",
        "invitations_view",
        "invitations_manage",
        "join_requests_view",
        "join_requests_manage",
        "documents_view",
        "documents_upload",
        "cargo_create",
        "cargo_edit",
        "cargo_delete",
        "transport_create",
        "transport_edit",
        "transport_delete",
    ],
    ADMIN: [
        "company_view",
        "company_manage",
        "members_view",
     //   "members_manage",
        "invitations_view",
        "invitations_manage",
        "join_requests_view",
        "join_requests_manage",
        "documents_view",
        "documents_upload",
        "cargo_create",
        "cargo_edit",
        "cargo_delete",
        "transport_create",
        "transport_edit",
        "transport_delete",
    ],
    MANAGER: [
        "company_view",
        "members_view",
        "invitations_view",
        "documents_view",
        "documents_upload",
        "cargo_create",
        "cargo_edit",
        "transport_create",
        "transport_edit",
    ],
    LOGIST: [
        "company_view",
        "documents_view",
        "cargo_create",
        "cargo_edit",
        "transport_create",
        "transport_edit",
    ],
    VIEWER: [
        "company_view",
        "members_view",
        "documents_view",
    ],
};

export const companyRoleDescriptionMap: Record<CompanyMemberRole, string> = {
    OWNER: "Full control over the company, team, documents, and operations.",
    ADMIN: "Administrative access to manage the company, members, invitations, and requests.",
    MANAGER: "Operational access for day-to-day work with listings and document flow.",
    LOGIST: "Access focused on cargo and transport operations.",
    VIEWER: "Read-only access to the company profile, members, and documents.",
};

export function getRolePermissionLabels(role: CompanyMemberRole): string[] {
    return companyRolePermissionMap[role].map((permission) => companyPermissionLabelMap[permission]);
}