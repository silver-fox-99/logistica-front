export type TariffBooleanFieldKey =
    | "can_view_order_details"
    | "can_auto_bump"
    | "can_create_companies"
    | "can_view_tenders";

export type TariffNumberFieldKey =
    | "cargo_limit"
    | "vehicle_limit"
    | "order_details_views_per_day_limit"
    | "company_limit"
    | "members_per_company_limit"
    | "active_tenders";

export type TariffFeatureFieldMeta = {
    key: TariffBooleanFieldKey;
    label: string;
    hint?: string;
};

export type TariffLimitFieldMeta = {
    key: TariffNumberFieldKey;
    label: string;
    hint?: string;
};

export const TARIFF_FEATURE_FIELDS: TariffFeatureFieldMeta[] = [
    {
        key: "can_auto_bump",
        label: "Автоматически поднимать объявления",
    },
    {
        key: "can_view_order_details",
        label: "Просмотр подробной информации по заказам",
    },
    {
        key: "can_create_companies",
        label: "Создание компаний",
    },
    {
        key: "can_view_tenders",
        label: "Участие в тендерах"
    }
];

export const TARIFF_LIMIT_FIELDS: TariffLimitFieldMeta[] = [
    {
        key: "cargo_limit",
        label: "Лимит на создание грузов",
        hint: "Сколько грузов можно создать за период",
    },
    {
        key: "vehicle_limit",
        label: "Лимит на создание транспорта",
        hint: "Сколько единиц транспорта можно добавить за период",
    },
    {
        key: "order_details_views_per_day_limit",
        label: "Лимит просмотров подробностей заказа в месяц",
        hint: "Сколько раз в месяц можно открывать детали заказов",
    },
    {
        key: "active_tenders",
        label: "Количество активных тендеров",
        hint: "Количество активных тендеров одновременно"
    },
    {
        key: "company_limit",
        label: "Лимит компаний",
        hint: "Максимальное количество компаний для этого тарифа",
    },
    {
        key: "members_per_company_limit",
        label: "Лимит сотрудников в компании",
        hint: "Сколько пользователей можно добавить в одну компанию",
    }
];