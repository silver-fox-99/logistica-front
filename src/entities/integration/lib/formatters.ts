import type { IntegrationTokenOwner } from "../model/types";

export function formatIntegrationDate(value?: string | null) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleString();
}

export function toLocalDatetimeInputValue(value: string) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);

    return local.toISOString().slice(0, 16);
}

export function getIntegrationOwnerLabel(user?: Partial<IntegrationTokenOwner> | null) {
    if (!user) return "—";

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (fullName && user.email) {
        return `${fullName} (${user.email})`;
    }

    if (user.email) {
        return user.email;
    }

    if (fullName) {
        return fullName;
    }

    if (user.phone) {
        return user.phone;
    }

    return "—";
}