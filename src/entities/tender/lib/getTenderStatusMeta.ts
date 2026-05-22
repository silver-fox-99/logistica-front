import { TenderStatus } from "../model/types";

export function getTenderStatusMeta(status: TenderStatus, t: (key: string) => string) {
    switch (status) {
        case TenderStatus.ACTIVE:
            return {
                label: t("tenders.status.ACTIVE"),
                color: "success" as const,
            };

        case TenderStatus.WAITING_CONFIRMATION:
            return {
                label: t("tenders.status.WAITING_CONFIRMATION"),
                color: "warning" as const,
            };

        case TenderStatus.CONFIRMED:
            return {
                label: t("tenders.status.CONFIRMED"),
                color: "primary" as const,
            };

        case TenderStatus.CANCELLED:
            return {
                label: t("tenders.status.CANCELLED"),
                color: "error" as const,
            };

        case TenderStatus.EXPIRED:
            return {
                label: t("tenders.status.EXPIRED"),
                color: "default" as const,
            };

        case TenderStatus.FINISHED:
            return {
                label: t("tenders.status.FINISHED"),
                color: "info" as const,
            };

        default:
            return {
                label: status,
                color: "default" as const,
            };
    }
}