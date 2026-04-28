import { useState } from "react";
import { toast } from "react-toastify";
import { cargoApi } from "@/shared/api/cargoApi";
import { transportApi } from "@/shared/api/transportApi";
import { adaptCargo, adaptTransport } from "@/entities/shipment/lib/adapter";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import type { TFunction } from "i18next";

type Params = {
    id: string;
    kind: ShipmentsKind;
    t: TFunction;
    onMoreOpen?: (id: string) => void;
};

const ORDER_DETAILS_LIMIT_CODE = "MONTHLY_ORDER_DETAILS_LIMIT";

export function useShipmentDetails({ id, kind, t, onMoreOpen }: Params) {
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [limitOpen, setLimitOpen] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [detailsData, setDetailsData] = useState<ShipmentRowData | null>(null);

    const openDetails = async () => {
        if (detailsLoading) return;

        setDetailsLoading(true);

        try {
            const resp =
                kind === "cargo"
                    ? await cargoApi.info(id)
                    : await transportApi.info(id);

            const payload = (resp as any)?.data ?? resp;

            if (!payload) {
                throw new Error(
                    t("shipments.messages.orderDetailsError", "Failed to open order details"),
                );
            }

            const adapted =
                kind === "cargo"
                    ? adaptCargo(payload as any)
                    : adaptTransport(payload as any);

            setDetailsData(adapted);
            setDetailsOpen(true);
            onMoreOpen?.(id);
        } catch (error: any) {
            const code = error?.response?.data?.code;

            if (code === ORDER_DETAILS_LIMIT_CODE) {
                setLimitOpen(true);
                return;
            }

            const message =
                error?.response?.data?.message ||
                error?.message ||
                t("shipments.messages.orderDetailsError", "Failed to open order details");

            toast.error(message);
        } finally {
            setDetailsLoading(false);
        }
    };

    const closeDetails = () => setDetailsOpen(false);
    const closeLimit = () => setLimitOpen(false);

    return {
        detailsOpen,
        limitOpen,
        detailsLoading,
        detailsData,
        openDetails,
        closeDetails,
        closeLimit,
    };
}