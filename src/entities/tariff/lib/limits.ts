import type { TFunction } from "i18next";
import type { IconType } from "react-icons";
import {
    FiBriefcase,
    FiEye,
    FiPackage,
    FiTruck,
    FiUsers,
    FiArrowUpCircle,
} from "react-icons/fi";

import type {
    EntitlementKey,
    TariffMeResponse,
} from "@/entities/tariff-plan/model/types.ts";

export type LimitItem = {
    key: EntitlementKey;
    label: string;
    icon: IconType;
    type: "numeric" | "boolean";
    hint?: string;
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
    can_auto_bump: "can_auto_bump",
    members_per_company_limit: null,
};

export const buildLimitItemsConfig = (t: TFunction): LimitItem[] => [
    {
        key: "cargo_limit",
        label: t("paymentsNew.cargoLimit", {
            defaultValue: "Создание грузов",
        }),
        hint: t("paymentsNew.cargoLimitHint", {
            defaultValue: "Сколько грузов можно создать за месяц",
        }),
        icon: FiPackage,
        type: "numeric",
    },
    {
        key: "vehicle_limit",
        label: t("paymentsNew.vehicleLimit", {
            defaultValue: "Создание транспорта",
        }),
        hint: t("paymentsNew.vehicleLimitHint", {
            defaultValue: "Сколько единиц транспорта можно добавить за месяц",
        }),
        icon: FiTruck,
        type: "numeric",
    },
    {
        key: "order_details_views_per_day_limit",
        label: t("paymentsNew.orderDetailsViews", {
            defaultValue: "Просмотр подробностей заказа",
        }),
        hint: t("paymentsNew.orderDetailsViewsHint", {
            defaultValue: "Сколько раз в день можно открывать детали заказов",
        }),
        icon: FiEye,
        type: "numeric",
    },
    {
        key: "company_limit",
        label: t("paymentsNew.companyLimit", {
            defaultValue: "Количество компаний",
        }),
        hint: t("paymentsNew.companyLimitHint", {
            defaultValue: "Максимальное количество компаний в тарифе",
        }),
        icon: FiBriefcase,
        type: "numeric",
    },
    {
        key: "members_per_company_limit",
        label: t("paymentsNew.membersLimit", {
            defaultValue: "Сотрудников в одной компании",
        }),
        hint: t("paymentsNew.membersLimitHint", {
            defaultValue: "Сколько пользователей можно добавить в одну компанию",
        }),
        icon: FiUsers,
        type: "numeric",
    },
    {
        key: "can_view_order_details",
        label: t("paymentsNew.orderDetails", {
            defaultValue: "Доступ к подробностям заказа",
        }),
        icon: FiEye,
        type: "boolean",
    },
    {
        key: "can_create_companies",
        label: t("paymentsNew.companies", {
            defaultValue: "Возможность создавать компании",
        }),
        icon: FiBriefcase,
        type: "boolean",
    },
    {
        key: "can_auto_bump",
        label: t("paymentsNew.autoBump", {
            defaultValue: "Автоматическое поднятие объявлений",
        }),
        icon: FiArrowUpCircle,
        type: "boolean",
    },
];