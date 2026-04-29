import { Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import { useTranslation } from "react-i18next";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";

type Props = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
};

export function ShipmentDetailsRouteCard({ data, kind }: Props) {
    const { t } = useTranslation();

    const sortedPoints = [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const loadPoints = sortedPoints.filter((item) => item.type === "PICKUP" || item.type === "DEPARTURE");
    const unloadPoints = sortedPoints.filter((item) => item.type === "DROPOFF" || item.type === "ARRIVAL");

    const formatPoint = (point: any) => {
        if (point.display_name) return point.display_name;
       return [point.country, point.region, point.city, point.address].filter(Boolean).join(", ");
    }

    const loadTitle =
        kind === "cargo"
            ? t("shipments.shipmentCard.load", "Pickup")
            : t("shipments.shipmentCard.loadTransport", "Loading");

    const unloadTitle =
        kind === "cargo"
            ? t("shipments.shipmentCard.unload", "Delivery")
            : t("shipments.shipmentCard.unloadTransport", "Unloading");

    return (
        <ShipmentDetailsSection title={t("userReviews.form.routeTitle", "Route")}>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {loadTitle}
                        </Typography>

                        {loadPoints.length ? (
                            loadPoints.map((point, index) => (
                                <Typography key={point.id ?? index} variant="body2" color="text.secondary">
                                    {index + 1}. {formatPoint(point)}
                                </Typography>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                    </Stack>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight={700}>
                            {unloadTitle}
                        </Typography>

                        {unloadPoints.length ? (
                            unloadPoints.map((point, index) => (
                                <Typography key={point.id ?? index} variant="body2" color="text.secondary">
                                    {index + 1}. {formatPoint(point)}
                                </Typography>
                            ))
                        ) : (
                            <Typography variant="body2" color="text.secondary">—</Typography>
                        )}
                    </Stack>
                </Grid>
            </Grid>
        </ShipmentDetailsSection>
    );
}