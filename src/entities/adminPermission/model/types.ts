export enum AdminPermissionAction {
    VIEW = "VIEW",
    CREATE = "CREATE",
    EDIT = "EDIT",
    DELETE = "DELETE",
}

export enum AdminPermissionTarget {
    DASHBOARD = "DASHBOARD",
    USERS = "USERS",
    USER_DETAILS = "USER_DETAILS",
    CARGO = "CARGO",
    TRANSPORT = "TRANSPORT",
    GEO_LOCATIONS = "GEO_LOCATIONS",
    LOOKUPS = "LOOKUPS",
    BLACKLIST = "BLACKLIST",
    REVIEWS = "REVIEWS",
    ACTIVITY_LOGS = "ACTIVITY_LOGS",

    TARIFF_PLANS = "TARIFF_PLANS",

    ADS = "ADS",
    SYSTEM_SETTINGS = "SYSTEM_SETTINGS",

    ADMIN_GROUPS = "ADMIN_GROUPS",
    ADMIN_PERMISSIONS = "ADMIN_PERMISSIONS",

    NOTIFICATION = "NOTIFICATION",
    DOCUMENTS = "DOCUMENTS",
    REFERRAL_SETTINGS = "REFERRAL_SETTINGS",
}

export type AdminPermission = {
    id: string;
    target: AdminPermissionTarget;
    action: AdminPermissionAction;
    code: string; // `${target}:${action}`
    description: string | null;
    created_at: string;
    updated_at: string;
};
