export type CompanyStatus =
    | "UNVERIFIED"
    | "PENDING_REVIEW"
    | "VERIFIED"
    | "REJECTED"
    | "BLOCKED";

export type Company = {
    id: string;
    name: string;
    legal_name: string | null;
    registration_number: string | null;
    tax_number: string | null;
    phone: string | null;
    email: string | null;
    website: string | null;
    logo: string | null;
    description: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    address: string | null;
    members_limit: number | null;
    owner_user_id: string;
    status: CompanyStatus;
    submitted_for_review_at: string | null;
    verified_at: string | null;
    verified_by_user_id: string | null;
    verification_comment: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
};

export type ListMyCompaniesParams = {
    q?: string;
    limit?: number;
    offset?: number;
};

export type ListMyCompaniesResponse = {
    items: Company[];
    total: number;
    limit: number;
    offset: number;
};

export type CreateCompanyPayload = {
    name: string;
};

export type UpdateCompanyPayload = {
    name?: string;
    legal_name?: string | null;
    registration_number?: string | null;
    tax_number?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logo?: string | null;
    description?: string | null;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    address?: string | null;
};

export type CompanyDocumentType =
    | "REGISTRATION_CERTIFICATE"
    | "TAX_CERTIFICATE"
    | "LICENSE"
    | "INSURANCE"
    | "IDENTITY_DOCUMENT"
    | "OTHER";

export type CompanyDocumentStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED";

export type CompanyDocument = {
    id: string;
    company_id: string;
    type: CompanyDocumentType;
    title: string;
    description: string | null;
    original_name: string;
    mime_type: string;
    file_extension: string;
    file_size: number;
    file_url: string;
    preview_url: string | null;
    status: CompanyDocumentStatus;
    review_comment: string | null;
    uploaded_by_user_id: string;
    reviewed_by_user_id: string | null;
    reviewed_at: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
};

export type UploadCompanyDocumentPayload = {
    type: CompanyDocumentType;
    title: string;
    description?: string;
    file: File;
};

export type AdminListCompaniesParams = {
    q?: string;
    status?: CompanyStatus;
    owner_user_id?: string;
    limit?: number;
    offset?: number;
};

export type AdminListCompaniesResponse = {
    items: Company[];
    total: number;
    limit: number;
    offset: number;
};

export type UpdateCompanyAdminPayload = {
    name?: string;
    legal_name?: string | null;
    registration_number?: string | null;
    tax_number?: string | null;
    phone?: string | null;
    email?: string | null;
    website?: string | null;
    logo?: string | null;
    description?: string | null;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    address?: string | null;
    members_limit?: number | null;
};

export type UpdateCompanyStatusAdminPayload = {
    status: CompanyStatus;
    verification_comment?: string | null;
};

export type ReviewCompanyDocumentAdminPayload = {
    status: CompanyDocumentStatus;
    review_comment?: string | null;
};

export type CompanyMemberRole =
    | "OWNER"
    | "ADMIN"
    | "LOGIST"
    | "MANAGER"
    | "VIEWER";

export type CompanyMemberStatus =
    | "INVITED"
    | "ACTIVE"
    | "BLOCKED"
    | "REMOVED";

export type CompanyPermissionKey =
    | "company_view"
    | "company_manage"
    | "members_view"
    | "members_manage"
    | "invitations_view"
    | "invitations_manage"
    | "join_requests_view"
    | "join_requests_manage"
    | "documents_view"
    | "documents_upload"
    | "cargo_create"
    | "cargo_edit"
    | "cargo_delete"
    | "transport_create"
    | "transport_edit"
    | "transport_delete";

export type CompanyRelatedUser = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    email: string | null;
    avatar: string | null;
};

export type CompanyMember = {
    id: string;
    company_id: string;
    user_id: string;
    role: CompanyMemberRole;
    status: CompanyMemberStatus;
    is_default: boolean;
    permissions: Record<string, boolean>;
    invited_by_user_id: string | null;
    invited_at: string | null;
    joined_at: string | null;
    removed_at: string | null;
    note: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    user?: CompanyRelatedUser | null;
    invited_by_user?: CompanyRelatedUser | null;
};

export type CompanyMembershipHistoryItem = {
    id: string;
    company_id: string;
    user_id: string;
    role: string;
    status: string;
    is_default: boolean;
    permissions?: Record<string, boolean> | null;
    invited_by_user_id?: string | null;
    invited_at?: string | null;
    joined_at?: string | null;
    removed_at?: string | null;
    note?: string | null;
    meta?: Record<string, any> | null;
    created_at: string;
    updated_at: string;
    company: {
        id: string;
        name: string;
        legal_name?: string | null;
        logo?: string | null;
        country?: string | null;
        region?: string | null;
        city?: string | null;
        status?: string | null;
    };
    invited_by_user?: {
        id: string;
        first_name?: string | null;
        last_name?: string | null;
        email?: string | null;
        phone?: string | null;
        avatar?: string | null;
    } | null;
};

export type UpdateCompanyMemberPayload = {
    role?: CompanyMemberRole;
    status?: CompanyMemberStatus;
    is_default?: boolean;
    permissions?: Record<string, boolean>;
};

export type CreateCompanyInvitationPayload = {
    email?: string;
    phone?: string;
    role: CompanyMemberRole;
    permissions?: Record<string, boolean>;
    message?: string;
};

export type CompanyInvitationStatus =
    | "PENDING"
    | "ACCEPTED"
    | "DECLINED"
    | "CANCELED"
    | "EXPIRED";

export type CompanyInvitation = {
    id: string;
    company_id: string;
    invited_by_user_id: string;
    email: string | null;
    phone: string | null;
    role: CompanyMemberRole;
    permissions: Record<string, boolean>;
    token: string;
    status: CompanyInvitationStatus;
    expires_at: string | null;
    responded_at: string | null;
    message: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    invited_by_user?: CompanyRelatedUser | null;
};

export type CompanyJoinRequestStatus =
    | "PENDING"
    | "APPROVED"
    | "REJECTED"
    | "CANCELED";

export type CompanyJoinRequest = {
    id: string;
    company_id: string;
    user_id: string;
    requested_role: CompanyMemberRole;
    status: CompanyJoinRequestStatus;
    message: string | null;
    reviewed_by_user_id: string | null;
    review_comment: string | null;
    reviewed_at: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    user?: CompanyRelatedUser | null;
    reviewed_by_user?: CompanyRelatedUser | null;
};

export type CreateCompanyJoinRequestPayload = {
    requested_role?: CompanyMemberRole;
    message?: string;
};

export type ReviewCompanyJoinRequestPayload = {
    status: CompanyJoinRequestStatus;
    review_comment?: string;
};

export type PublicCompanyMember = {
    id: string;
    role: CompanyMemberRole;
    status: string;
    joined_at: string | null;
    user: {
        id: string | null;
        first_name: string | null;
        last_name: string | null;
        phone: string | null;
        email: string | null;
        avatar: string | null;
    };
};

export type PublicCompanyProfile = {
    id: string;
    name: string;
    legal_name: string | null;
    logo: string | null;
    description: string | null;
    website: string | null;
    email: string | null;
    phone: string | null;
    country: string | null;
    region: string | null;
    city: string | null;
    address: string | null;
    status: "VERIFIED";
    verified_at: string | null;
    created_at: string;
    members?: PublicCompanyMember[];
};

export type ListPublicCompaniesParams = {
    q?: string;
    limit?: number;
    offset?: number;
};

export type ListPublicCompaniesResponse = {
    items: PublicCompanyProfile[];
    total: number;
    limit: number;
    offset: number;
};

export type CompanyInvitationPreview = {
    id: string;
    company_id: string;
    invited_by_user_id: string;
    email: string | null;
    phone: string | null;
    role: CompanyMemberRole;
    permissions: Record<string, boolean>;
    token: string;
    status: CompanyInvitationStatus;
    expires_at: string | null;
    responded_at: string | null;
    message: string | null;
    meta: Record<string, any>;
    created_at: string;
    updated_at: string;
    invited_by_user?: CompanyRelatedUser | null;
    company?: {
        id: string;
        name: string;
        logo: string | null;
        legal_name: string | null;
        description: string | null;
        email: string | null;
        phone: string | null;
        website: string | null;
        country: string | null;
        region: string | null;
        city: string | null;
        address: string | null;
        status: CompanyStatus;
    } | null;
};

export type UpdateCompanyMemberAdminPayload = {
    role?: CompanyMemberRole;
    status?: CompanyMemberStatus;
    is_default?: boolean;
    permissions?: Record<string, boolean>;
    note?: string | null;
};

export type ChangeCompanyOwnerAdminPayload = {
    demote_previous_owner_to_admin?: boolean;
};