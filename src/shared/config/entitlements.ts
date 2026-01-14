import type { EntitlementKey } from "@/shared/api/tariffsApi";

export type EntitlementMeta = {
    key: EntitlementKey;
    label: string;
    type: "number" | "boolean";
    hint?: string;
};

export const ENTITLEMENTS: EntitlementMeta[] = [
    { key: "cargo_limit", label: "Cargo limit", type: "number", hint: "Maximum cargos per month" },
    { key: "vehicle_limit", label: "Vehicle limit", type: "number", hint: "Maximum transports per month" },
    { key: "can_view_order_details", label: "Can view order details", type: "boolean" },
    { key: "order_details_views_per_day_limit", label: "Order details views/day", type: "number" },
    { key: "can_create_companies", label: "Can create companies", type: "boolean" },
    { key: "company_limit", label: "Company limit", type: "number" },
    { key: "members_per_company_limit", label: "Members per company limit", type: "number" },
];

export const formatEntitlementValue = (key: EntitlementKey, value: unknown) => {
    const meta = ENTITLEMENTS.find((m) => m.key === key);
    if (meta?.type === "boolean") {
        return value ? "Enabled" : "Disabled";
    }
    if (value === null || value === undefined || value === "") return "—";
    if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString();
    return String(value);
};
