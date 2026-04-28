import { forwardRef, type ReactElement, type Ref } from "react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Slide,
    Stack,
    Typography,
} from "@mui/material";
import type { TransitionProps } from "@mui/material/transitions";
import { FiArrowUpRight, FiPackage, FiTruck, FiX } from "react-icons/fi";

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
                                         onOpenPage,
                                         data,
                                         kind,
                                         lookups,
                                         findLocalizedLabel,
                                         t,
                                         loading,
                                         formatRoute,
                                     }: ShipmentDetailsModalProps) {
    const title = kind === "cargo"
        ? t("shipments.shipmentCard.cargo", "Cargo")
        : t("shipments.shipmentCard.transport", "Transport");

    const sortedPoints = [...(data?.points ?? [])].sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0),
    );

    const fromPoint = sortedPoints.find(
        (item) => item.type === "PICKUP" || item.type === "DEPARTURE",
    );

    const toPoint = sortedPoints.find(
        (item) => item.type === "DROPOFF" || item.type === "ARRIVAL",
    );

    const Icon = kind === "cargo" ? FiPackage : FiTruck;

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
                    px: { xs: 2, md: 3 },
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                }}
            >
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0}>
                        <Box
                            sx={{
                                width: 42,
                                height: 42,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={20} />
                        </Box>

                        <Box minWidth={0}>
                            <Typography variant="h6" fontWeight={800} noWrap>
                                {t("shipments.shipmentCard.orderDetails", "Order details")} · {title}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" noWrap>
                                {data
                                    ? `${fromPoint ? formatRoute(fromPoint, false) : "—"} → ${
                                        toPoint ? formatRoute(toPoint, false) : "—"
                                    }`
                                    : t(
                                        "shipments.shipmentCard.detailsSubtitle",
                                        "Contact information, route and shipment details",
                                    )}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {onOpenPage && (
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={onOpenPage}
                                endIcon={<FiArrowUpRight />}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {t("shipments.shipmentCard.openDetailsPage", "Open details page")}
                            </Button>
                        )}

                        <IconButton
                            onClick={onClose}
                            size="small"
                            aria-label={t("common.close", "Close")}
                        >
                            <FiX />
                        </IconButton>
                    </Stack>
                </Stack>
            </DialogTitle>

            <DialogContent
                sx={{
                    p: { xs: 2, md: 3 },
                    bgcolor: "background.paper",
                }}
            >
                {loading ? (
                    <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                        <CircularProgress />
                    </Stack>
                ) : data ? (
                    <Box
                        sx={{
                            p: { xs: 1.5, md: 2 },
                            borderRadius: 2,
                            bgcolor: "background.default",
                        }}
                    >
                        <ShipmentDetailsContent
                            data={data}
                            scope="public"
                            lookups={lookups}
                            findLocalizedLabel={findLocalizedLabel}
                            t={t}
                            showActions={false}
                            formatRoute={formatRoute}
                        />
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                        {t("shipments.messages.orderDetailsEmpty", "No data to display")}
                    </Typography>
                )}
            </DialogContent>

            <DialogActions
                sx={{
                    px: { xs: 2, md: 3 },
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                }}
            >
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        textTransform: "none",
                        fontWeight: 700,
                        borderRadius: 1.5,
                    }}
                >
                    {t("common.close", "Close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
}