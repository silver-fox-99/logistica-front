import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useShipmentDetailsPage } from "@/entities/shipment/model/useShipmentDetailsPage";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import { ShipmentDetailsView } from "@/widgets/shipment-details/shipment-details-view/ui/ShipmentDetailsView";
import { OrderDetailsLimitReached } from "@/widgets/shipment-details/order-details-limit/ui/OrderDetailsLimitReached";
import { isOrderDetailsLimitError } from "@/entities/shipment/lib/isOrderDetailsLimitError";

export default function ShipmentDetailsPage() {
    const { kind, id } = useParams();
    const { t } = useTranslation();


    const resolvedKind = useMemo<ShipmentsKind | null>(() => {
        if (kind === "cargo" || kind === "transport") return kind;
        return null;
    }, [kind]);

    const {
        data,
        loading,
        error,
        contactsLoading,
        contactsError,
        contactsErrorCode,
        contactsRevealed,
        showContacts,
    } = useShipmentDetailsPage(resolvedKind, id ?? null);

    const showLimitReached = contactsErrorCode
        ? isOrderDetailsLimitError(contactsErrorCode)
        : isOrderDetailsLimitError(contactsError);

    if (!resolvedKind || !id) {
        return <Alert severity="error">Invalid shipment details route</Alert>;
    }

    return (
        <Stack spacing={2.5} py={3} sx={{ width: "100%" }}>
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


            </Stack>

            {loading ? (
                <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
                    <CircularProgress />
                </Stack>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : data ? (
                <>
                    {data.display_type === "inactive" && (
                        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                            {t("shipments.messages.inactiveAlert")}
                        </Alert>
                    )}

                    {showLimitReached ? (
                        <OrderDetailsLimitReached onReload={showContacts} />
                    ) : contactsError ? (
                        <Alert severity="error">{contactsError}</Alert>
                    ) : null}

                    <Box sx={{ opacity: data.display_type === "inactive" ? 0.75 : 1 }}>
                        <ShipmentDetailsView
                            data={data}
                            kind={resolvedKind}
                            contactsRevealed={contactsRevealed && data.display_type !== "inactive"}
                            onShowContacts={showContacts}
                            contactsLoading={contactsLoading}
                        />
                    </Box>
                </>
            ) : (
                <Alert severity="info">
                    {t("shipments.messages.orderDetailsEmpty", "No data to display")}
                </Alert>
            )}
        </Stack>
    );
}