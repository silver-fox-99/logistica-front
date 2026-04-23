import { forwardRef, type ReactElement, type Ref } from "react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Slide,
    Stack,
    Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { ShipmentDetailsContent } from "./ShipmentDetailsContent";
import type { ShipmentDetailsModalProps } from "@/entities/shipment/model/shipment-row.types";

const DetailsTransition = forwardRef(function DetailsTransition(
    props: TransitionProps & { children: ReactElement },
    ref: Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export function ShipmentDetailsModal({
                                         open,
                                         onClose,
                                         data,
                                         kind,
                                         lookups,
                                         findLocalizedLabel,
                                         t,
                                         loading,
                                         formatRoute,
                                     }: ShipmentDetailsModalProps) {
    const title = `${t("shipments.shipmentCard.orderDetails", "Order details")} · ${
        kind === "cargo"
            ? t("shipments.shipmentCard.cargo", "Cargo")
            : t("shipments.shipmentCard.transport", "Transport")
    }`;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="lg"
            TransitionComponent={DetailsTransition}
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: "hidden",
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={800}>
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("shipments.shipmentCard.detailsSubtitle", "Contact information, route and shipment details")}
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress />
                    </Stack>
                ) : data ? (
                    <ShipmentDetailsContent
                        data={data}
                        scope="public"
                        lookups={lookups}
                        findLocalizedLabel={findLocalizedLabel}
                        t={t}
                        showActions={false}
                        formatRoute={formatRoute}
                    />
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {t("shipments.messages.orderDetailsEmpty", "No data to display")}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: 3,
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{ textTransform: "none", fontWeight: 700 }}
                >
                    {t("common.close", "Close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}