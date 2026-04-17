import type { CompanyStatus } from "./types";

export const companyStatusMap: Record<
    CompanyStatus,
    {
        label: string;
        color: "default" | "success" | "warning" | "error";
    }
> = {
    UNVERIFIED: {
        label: "Unverified",
        color: "default",
    },
    PENDING_REVIEW: {
        label: "Pending review",
        color: "warning",
    },
    VERIFIED: {
        label: "Verified",
        color: "success",
    },
    REJECTED: {
        label: "Rejected",
        color: "error",
    },
    BLOCKED: {
        label: "Blocked",
        color: "error",
    },
};