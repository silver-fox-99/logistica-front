import type {
    CompanyInvitationStatus,
    CompanyJoinRequestStatus,
    CompanyMemberRole,
    CompanyMemberStatus,
    CompanyRelatedUser,
} from "@/entities/company/model/types";

export const companyRoleLabelMap: Record<CompanyMemberRole, string> = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MANAGER: "Manager",
    LOGIST: "Logist",
    VIEWER: "Viewer",
};

export const companyMemberStatusLabelMap: Record<CompanyMemberStatus, string> = {
    INVITED: "Invited",
    ACTIVE: "Active",
    BLOCKED: "Blocked",
    REMOVED: "Removed",
};

export const companyInvitationStatusLabelMap: Record<CompanyInvitationStatus, string> = {
    PENDING: "Pending",
    ACCEPTED: "Accepted",
    DECLINED: "Declined",
    CANCELED: "Canceled",
    EXPIRED: "Expired",
};

export const companyJoinRequestStatusLabelMap: Record<CompanyJoinRequestStatus, string> = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    CANCELED: "Canceled",
};

export function getUserDisplayName(user?: CompanyRelatedUser | null) {
    const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
    return fullName || user?.email || user?.phone || "Unknown user";
}

export function getUserSecondaryText(user?: CompanyRelatedUser | null) {
    if (!user) return "No contact information";
    return user.email || user.phone || "No contact information";
}