import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FiArrowLeft } from "react-icons/fi";

import { useShipmentDetailsPage } from "@/entities/shipment/model/useShipmentDetailsPage";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import { ShipmentDetailsView } from "@/widgets/shipment-details/shipment-details-view/ui/ShipmentDetailsView";
import { OrderDetailsLimitReached } from "@/widgets/shipment-details/order-details-limit/ui/OrderDetailsLimitReached";
import { isOrderDetailsLimitError } from "@/entities/shipment/lib/isOrderDetailsLimitError";

export default function ShipmentDetailsPage() {
    const { kind, id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const resolvedKind = useMemo<ShipmentsKind | null>(() => {
        if (kind === "cargo" || kind === "transport") return kind;
        return null;
    }, [kind]);

    const { data, loading, error, reload } = useShipmentDetailsPage(resolvedKind, id ?? null);

    const showLimitReached = isOrderDetailsLimitError(error);

    if (!resolvedKind || !id) {
        return <Alert severity="error">Invalid shipment details route</Alert>;
    }

    return (
        <Stack spacing={2.5} sx={{ width: "100%" }}>
            <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1.25}
            >
                <Box>
                    <Typography variant="h5" fontWeight={800}>
                        {t("shipments.shipmentCard.orderDetails", "Order details")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {resolvedKind === "cargo"
                            ? t("shipments.shipmentCard.cargo", "Cargo")
                            : t("shipments.shipmentCard.transport", "Transport")}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<FiArrowLeft size={16} />}
                    onClick={() => navigate(-1)}
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                        minHeight: 40,
                    }}
                >
                    {t("shipments.actions.back", "Back")}
                </Button>
            </Stack>

            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : showLimitReached ? (
                <OrderDetailsLimitReached onReload={reload} />
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : data ? (
                <ShipmentDetailsView data={data} kind={resolvedKind} />
            ) : (
                <Alert severity="info">
                    {t("shipments.messages.orderDetailsEmpty", "No data to display")}
                </Alert>
            )}
        </Stack>
    );
}