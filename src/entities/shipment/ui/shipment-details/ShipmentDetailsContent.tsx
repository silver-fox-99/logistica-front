import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Link as RouterLink } from "react-router-dom";
import { FiCopy, FiEdit2, FiMail, FiPhone, FiRepeat, FiTrash2, FiUser } from "react-icons/fi";
import { FaBriefcase } from "react-icons/fa";
import { DetailSection } from "./DetailSection";
import type { ShipmentDetailsContentProps } from "@/entities/shipment/model/shipment-row.types";

export function ShipmentDetailsContent({
                                           data,
                                           scope,
                                           lookups,
                                           findLocalizedLabel,
                                           t,
                                           showActions = true,
                                           onUp,
                                           onEdit,
                                           onDelete,
                                           onCopy,
                                           formatRoute,
                                       }: ShipmentDetailsContentProps) {
    const sortedPoints = [...(data.points ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    const loadPoints = sortedPoints.filter(
        (item) => item.type === "PICKUP" || item.type === "DEPARTURE",
    );

    const unloadPoints = sortedPoints.filter(
        (item) => item.type === "DROPOFF" || item.type === "ARRIVAL",
    );

    const loadTypeArray = Array.isArray(data.loadType) ? data.loadType : data.loadType ? [data.loadType] : [];

    const loadTypeMap: Record<string, string> = {
        ANY: t("shipments.editDialog.loadTypeAny", "Any"),
        FULL: t("shipments.editDialog.loadTypeFull", "Full"),
        PARTIAL: t("shipments.editDialog.loadTypePartial", "Partial"),
        CONSOLIDATED: t("shipments.editDialog.loadTypeConsolidated", "Consolidated"),
    };

    const loadTypeLabel = loadTypeArray
        .map((lt) => {
            const lookupLabel = findLocalizedLabel(lookups?.loadType ?? [], lt);
            return lookupLabel !== lt ? lookupLabel : (loadTypeMap[lt] || lt);
        })
        .join(", ");

    return (
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
                <DetailSection title={t("shipments.shipmentCard.contactInfo", "Contact information")}>
                    <Stack spacing={1} color="text.secondary">
                        {data.contact?.name && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiUser />
                                {data.contact.userId ? (
                                    <Typography
                                        component={RouterLink}
                                        to={`/dashboard/user-reviews?search=${data.contact.userId}`}
                                        sx={{ textDecoration: "none", color: "inherit" }}
                                    >
                                        {data.contact.name}
                                    </Typography>
                                ) : (
                                    <Typography>{data.contact.name}</Typography>
                                )}
                            </Stack>
                        )}

                        {data.contact?.company && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FaBriefcase />
                                <Typography
                                    component={RouterLink}
                                    to={`/dashboard/companies/${data.contact.company.id}`}
                                    sx={{ textDecoration: "none", color: "inherit" }}
                                >
                                    {data.contact.company.name}
                                </Typography>
                            </Stack>
                        )}

                        {data.contact?.email && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiMail />
                                <Typography>{data.contact.email}</Typography>
                            </Stack>
                        )}

                        {!data.extraPhoneAsMain && data.contact?.phone1 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiPhone />
                                <Typography>{data.contact.phone1}</Typography>
                            </Stack>
                        )}

                        {!data.extraPhoneAsMain && data.contact?.phone2 && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiPhone />
                                <Typography>{data.contact.phone2}</Typography>
                            </Stack>
                        )}

                        {data.contactExtraPhone && (
                            <Stack direction="row" spacing={1} alignItems="center">
                                <FiPhone />
                                <Typography>
                                    {!data.extraPhoneAsMain
                                        ? `${t("shipments.shipmentCard.additionalPhone", "Additional phone")}: `
                                        : ""}
                                    {data.contactExtraPhone}
                                </Typography>
                            </Stack>
                        )}

                        {data.contact?.telegram && (
                            <Typography>{data.contact.telegram}</Typography>
                        )}
                    </Stack>
                </DetailSection>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
                <DetailSection title={t("shipments.shipmentCard.orderDetails", "Order details")}>
                    <Stack spacing={0.75} color="text.secondary">
                        {data.vehicleType && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.vehicleType", "Vehicle type")}: </strong>
                                {findLocalizedLabel(lookups?.vehicleType ?? [], data.vehicleType) || data.vehicleType}
                            </Typography>
                        )}

                        {data.cargoType && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.cargoType", "Cargo type")}: </strong>
                                {findLocalizedLabel(lookups?.cargoTypes ?? [], data.cargoType) || data.cargoType}
                            </Typography>
                        )}

                        {!!loadTypeLabel && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.loadType", "Load type")}: </strong>
                                {loadTypeLabel}
                            </Typography>
                        )}

                        {data.carsCount != null && data.carsCount > 0 && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.carsCount", "Cars count")}: </strong>
                                {data.carsCount}
                            </Typography>
                        )}

                        {data.palletsCount != null && data.palletsCount > 0 && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.palletsCount", "Pallets count")}: </strong>
                                {data.palletsCount}
                            </Typography>
                        )}

                        {data.weightT != null && data.weightT > 0 && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.weight", "Weight")}: </strong>
                                {data.weightT} t
                            </Typography>
                        )}

                        {data.volumeM3 != null && data.volumeM3 > 0 && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.volume", "Volume")}: </strong>
                                {data.volumeM3} m³
                            </Typography>
                        )}

                        {data.allowPartialLoad != null && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.partialLoad", "Partial load")}: </strong>
                                {data.allowPartialLoad
                                    ? t("shipments.shipmentCard.partialLoadYes", "Allowed")
                                    : t("shipments.shipmentCard.partialLoadNo", "Not Allowed")}
                            </Typography>
                        )}

                        {data.paymentTerm && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.paymentTerm", "Payment term")}: </strong>
                                {findLocalizedLabel(lookups?.paymentTerms ?? [], data.paymentTerm) || data.paymentTerm}
                            </Typography>
                        )}

                        {data.bargain && (
                            <Typography variant="body2">
                                <strong>{t("shipments.shipmentCard.bargain", "Bargain")}: </strong>
                                {data.bargain === "ALLOWED"
                                    ? t("shipments.shipmentCard.bargainAllowed", "Allowed")
                                    : t("shipments.shipmentCard.bargainNotAllowed", "Not allowed")}
                            </Typography>
                        )}
                    </Stack>
                </DetailSection>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <DetailSection title={t("userReviews.form.routeTitle", "Route")}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                                {t("shipments.shipmentCard.load", "Pickup")}
                            </Typography>

                            <Stack spacing={0.75}>
                                {loadPoints.length > 0 ? (
                                    loadPoints.map((point, index) => (
                                        <Typography
                                            key={`load-${point.id ?? index}`}
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {index + 1}. {formatRoute(point, true)}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        —
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ mb: 1 }}>
                                {t("shipments.shipmentCard.unload", "Delivery")}
                            </Typography>

                            <Stack spacing={0.75}>
                                {unloadPoints.length > 0 ? (
                                    unloadPoints.map((point, index) => (
                                        <Typography
                                            key={`unload-${point.id ?? index}`}
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {index + 1}. {formatRoute(point, true)}
                                        </Typography>
                                    ))
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        —
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </DetailSection>
            </Grid>

            {data.note && (
                <Grid size={{ xs: 12 }}>
                    <DetailSection title={t("shipments.shipmentCard.additionalInfo", "Additional information")}>
                        <Typography variant="body2" color="text.secondary">
                            {data.note}
                        </Typography>
                    </DetailSection>
                </Grid>
            )}

            {showActions && scope === "my" && (
                <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-start", md: "flex-end" }} sx={{ pt: 1 }}>
                        <Tooltip title={t("shipments.shipmentCard.raiseUp", "Raise up")}>
                            <IconButton onClick={() => onUp?.(data.id)}>
                                <FiRepeat />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t("shipments.shipmentCard.edit", "Edit")}>
                            <IconButton onClick={() => onEdit?.(data.id)}>
                                <FiEdit2 />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t("shipments.shipmentCard.copy", "Copy")}>
                            <IconButton onClick={() => onCopy?.(data.id)}>
                                <FiCopy />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={t("shipments.shipmentCard.delete", "Delete")}>
                            <IconButton color="error" onClick={() => onDelete?.(data.id)}>
                                <FiTrash2 />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Grid>
            )}
        </Grid>
    );
}