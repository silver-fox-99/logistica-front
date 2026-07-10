import { useEffect } from "react";
import { Stack, Typography, Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTranslation } from "react-i18next";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";
import { useInitStore } from "@/shared/store/initStore";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { 
    FiTruck, 
    FiPackage, 
    FiLayers, 
    FiActivity, 
    FiGrid, 
    FiMaximize, 
    FiCreditCard, 
    FiPercent
} from "react-icons/fi";

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

    const getSpecIcon = (lbl: string) => {
        const lower = lbl.toLowerCase();
        if (lower.includes("транспорт") || lower.includes("vehicle") || lower.includes("машин") || lower.includes("cars")) {
            return <FiTruck size={18} color="#0f5fc2" />;
        }
        if (lower.includes("груз") || lower.includes("cargo")) {
            return <FiPackage size={18} color="#0f5fc2" />;
        }
        if (lower.includes("загруз") || lower.includes("load")) {
            return <FiLayers size={18} color="#0f5fc2" />;
        }
        if (lower.includes("вес") || lower.includes("weight") || lower.includes("грузопод") || lower.includes("capacity")) {
            return <FiActivity size={18} color="#0f5fc2" />;
        }
        if (lower.includes("паллет") || lower.includes("pallet") || lower.includes("кол-во") || lower.includes("count")) {
            return <FiGrid size={18} color="#0f5fc2" />;
        }
        if (lower.includes("размер") || lower.includes("dimension") || lower.includes("dims")) {
            return <FiMaximize size={18} color="#0f5fc2" />;
        }
        if (lower.includes("оплат") || lower.includes("payment") || lower.includes("расчет")) {
            return <FiCreditCard size={18} color="#0f5fc2" />;
        }
        if (lower.includes("торг") || lower.includes("bargain")) {
            return <FiPercent size={18} color="#0f5fc2" />;
        }
        return <FiPackage size={18} color="#0f5fc2" />;
    };

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
                                p: 1.5,
                                borderRadius: "8px",
                                bgcolor: "background.default",
                                border: "1px solid",
                                borderColor: "divider",
                                minHeight: "100%",
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: "8px",
                                    bgcolor: "rgba(15, 95, 194, 0.06)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                {getSpecIcon(label)}
                            </Box>
                            <Stack spacing={0.25} sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 550 }}>
                                    {label}
                                </Typography>
                                <Typography variant="body2" fontWeight={800} sx={{ color: "text.primary" }}>
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