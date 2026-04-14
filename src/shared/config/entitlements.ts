import type {EntitlementKey} from "@/entities/tariff-plan/model/types.ts";


export type EntitlementMeta = {
    key: EntitlementKey;
    label: string;
    type: "number" | "boolean";
    hint?: string;
};

export const ENTITLEMENTS: EntitlementMeta[] = [
    { key: "cargo_limit", label: "Создание грузов", type: "number", hint: "Максимум грузов в месяц" },
    { key: "vehicle_limit", label: "Создание транспорта", type: "number", hint: "Максимум транспорта в месяц" },
    { key: "can_auto_bump", label: "Авто поднятие заявок", type: "boolean" },
    { key: "can_view_order_details", label: "Can view order details", type: "boolean" },
    { key: "order_details_views_per_day_limit", label: "Ежедневный просмотр подробностей", type: "number" },
    { key: "can_create_companies", label: "Возможность созданий компаний", type: "boolean" },
    { key: "company_limit", label: "Лимит компаний", type: "number" },
    { key: "members_per_company_limit", label: "Количество участников на компанию", type: "number" },
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
