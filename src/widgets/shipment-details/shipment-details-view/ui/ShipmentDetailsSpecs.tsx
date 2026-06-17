import { useEffect } from "react";
import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";
import { useInitStore } from "@/shared/store/initStore";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";

type Props = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
};

export function ShipmentDetailsSpecs({ data, kind }: Props) {
    const { t } = useTranslation();
    const { lookups, loadInit } = useInitStore();
    const { findLocalizedLabel } = useLocalizedLookup();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const cargoRows = [
        data.vehicleType
            ? [
                t("shipments.shipmentCard.vehicleType", "Vehicle type"),
                findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType,
            ]
            : null,
        data.cargoType
            ? [
                t("shipments.shipmentCard.cargoType", "Cargo type"),
                findLocalizedLabel(lookups?.cargoTypes ?? [], data.cargoType) || data.cargoType,
            ]
            : null,
        data.loadType?.length
            ? [
                t("shipments.shipmentCard.loadType", "Load type"),
                data.loadType
                    .map((lt) => {
                        const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
                        const loadTypeMap: Record<string, string> = {
                            ANY: t("shipments.editDialog.loadTypeAny", "Any"),
                            FULL: t("shipments.editDialog.loadTypeFull", "Full"),
                            PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
                            CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
                        };
                        return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
                    })
                    .join(", "),
            ]
            : null,
        data.weightT ? [t("shipments.shipmentCard.weight", "Weight"), `${data.weightT} t`] : null,
        data.volumeM3 ? [t("shipments.shipmentCard.volume", "Volume"), `${data.volumeM3} m³`] : null,
        data.carsCount ? [t("shipments.shipmentCard.carsCount", "Cars count"), `${data.carsCount}`] : null,
        data.palletsCount ? [t("shipments.shipmentCard.palletsCount", "Pallets count"), `${data.palletsCount}`] : null,
        data.dims ? [t("shipments.shipmentCard.dimensions", "Dimensions"), data.dims] : null,
        data.paymentTerm
            ? [
                t("shipments.shipmentCard.paymentTerm", "Payment term"),
                findLocalizedLabel(lookups?.paymentTerms ?? [], data.paymentTerm) || data.paymentTerm,
            ]
            : null,
        data.allowPartialLoad != null
            ? [
                t("shipments.shipmentCard.partialLoad", "Partial load"),
                data.allowPartialLoad
                    ? t("shipments.shipmentCard.partialLoadYes", "Allowed")
                    : t("shipments.shipmentCard.partialLoadNo", "Not allowed"),
            ]
            : null,
        data.bargain
            ? [
                t("shipments.shipmentCard.bargain", "Bargaining"),
                data.bargain === "ALLOWED"
                    ? t("shipments.shipmentCard.bargainAllowed", "Allowed")
                    : data.bargain === "NOT_ALLOWED"
                        ? t("shipments.shipmentCard.bargainNotAllowed", "Not allowed")
                        : (findLocalizedLabel(lookups?.bargainOptions ?? [], data.bargain) || data.bargain),
            ]
            : null,
    ].filter(Boolean) as Array<[string, string]>;

    const transportRows = [
        data.vehicleType
            ? [
                t("shipments.shipmentCard.vehicleType", "Vehicle type"),
                findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType,
            ]
            : null,
        data.carsCount ? [t("shipments.shipmentCard.vehiclesCount", "Vehicles count"), `${data.carsCount}`] : null,
        data.weightT ? [t("shipments.shipmentCard.capacity", "Capacity"), `${data.weightT} t`] : null,
        data.volumeM3 ? [t("shipments.shipmentCard.volume", "Volume"), `${data.volumeM3} m³`] : null,
        data.dims ? [t("shipments.shipmentCard.bodyDimensions", "Body dimensions"), data.dims] : null,
        data.paymentTerm
            ? [
                t("shipments.shipmentCard.paymentTerm", "Payment term"),
                findLocalizedLabel(lookups?.paymentTerms ?? [], data.paymentTerm) || data.paymentTerm,
            ]
            : null,
        data.bargain
            ? [
                t("shipments.shipmentCard.bargain", "Bargaining"),
                data.bargain === "ALLOWED"
                    ? t("shipments.shipmentCard.bargainAllowed", "Allowed")
                    : data.bargain === "NOT_ALLOWED"
                        ? t("shipments.shipmentCard.bargainNotAllowed", "Not allowed")
                        : (findLocalizedLabel(lookups?.bargainOptions ?? [], data.bargain) || data.bargain),
            ]
            : null,
    ].filter(Boolean) as Array<[string, string]>;

    const rows = kind === "cargo" ? cargoRows : transportRows;

    if (!rows.length) return null;

    return (
        <ShipmentDetailsSection
            title={
                kind === "cargo"
                    ? t("shipments.shipmentCard.orderDetails", "Cargo details")
                    : t("shipments.shipmentCard.orderDetails", "Transport details")
            }
        >
            <Grid container spacing={1.5}>
                {rows.map(([label, value]) => (
                    <Grid key={label} size={{ xs: 12, sm: 6, lg: 4 }}>
                        <Box
                            sx={{
                                p: 1.25,
                                borderRadius: 1.5,
                                bgcolor: "background.default",
                                border: "1px solid",
                                borderColor: "divider",
                                minHeight: "100%",
                            }}
                        >
                            <Stack spacing={0.5}>
                                <Typography variant="caption" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="body2" fontWeight={700}>
                                    {value}
                                </Typography>
                            </Stack>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        </ShipmentDetailsSection>
    );
}