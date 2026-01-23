import type { TFunction } from "i18next";
import type { IconType } from "react-icons";
import { FiBriefcase, FiEye, FiPackage, FiTruck, FiUsers } from "react-icons/fi";
import type { EntitlementKey, TariffMeResponse } from "@/shared/api/tariffsApi";

export type LimitItem = {
    key: EntitlementKey;
    label: string;
    icon: IconType;
    type: "numeric" | "boolean";
};

export const usageKeyMap: Record<
    EntitlementKey,
    keyof NonNullable<TariffMeResponse["usage"]> | null
> = {
    cargo_limit: "cargo_creates_used",
    vehicle_limit: "vehicle_creates_used",
    can_view_order_details: "order_details_views_used",
    order_details_views_per_day_limit: "order_details_views_used",
    can_create_companies: null,
    company_limit: null,
    members_per_company_limit: null,
};

export const buildLimitItemsConfig = (t: TFunction): LimitItem[] => [
    { key: "cargo_limit", label: t("paymentsNew.cargoLimit", { defaultValue: "Cargo limit / month" }), icon: FiPackage, type: "numeric" },
    { key: "vehicle_limit", label: t("paymentsNew.vehicleLimit", { defaultValue: "Vehicle limit / month" }), icon: FiTruck, type: "numeric" },
    { key: "order_details_views_per_day_limit", label: t("paymentsNew.orderDetailsViews", { defaultValue: "Order details views / day" }), icon: FiEye, type: "numeric" },
    { key: "company_limit", label: t("paymentsNew.companyLimit", { defaultValue: "Company limit" }), icon: FiBriefcase, type: "numeric" },
    { key: "members_per_company_limit", label: t("paymentsNew.membersLimit", { defaultValue: "Members per company" }), icon: FiUsers, type: "numeric" },
    { key: "can_view_order_details", label: t("paymentsNew.orderDetails", { defaultValue: "Order details access" }), icon: FiEye, type: "boolean" },
    { key: "can_create_companies", label: t("paymentsNew.companies", { defaultValue: "Company creation" }), icon: FiBriefcase, type: "boolean" },
];
