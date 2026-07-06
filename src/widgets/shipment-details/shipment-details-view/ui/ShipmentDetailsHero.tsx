import { Button, Chip, Stack, Typography, Divider, CircularProgress } from "@mui/material";
import { FiClock, FiMapPin, FiPackage, FiTruck, FiUser, FiPhone, FiMail } from "react-icons/fi";
import { FaBriefcase } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import {Link, Link as RouterLink} from "react-router-dom";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import { formatDate } from "@/shared/utils/formatDate";
import { ShipmentDetailsSection } from "./ShipmentDetailsSection";
import {useUserStore} from "@/entities/user/model/user.store.ts";

type Props = {
    data: ShipmentRowData;
    kind: ShipmentsKind;
    contactsRevealed?: boolean;
    contactsLoading?: boolean;
    onShowContacts?: () => void;
};

export function ShipmentDetailsHero({
                                        data,
                                        kind,
                                        contactsRevealed = false,
                                        contactsLoading = false,
                                        onShowContacts,
                                    }: Props) {
    const { t } = useTranslation();

    const loadFrom = data.loadWindow?.from ?? data.dates.from;
    const loadTo = data.loadWindow?.to ?? data.loadWindow?.from ?? data.dates.from;
    const user = useUserStore((s) => s.user);

    const hasContacts =
        data.contact?.name ||
        data.contact?.company ||
        data.contact?.phone1 ||
        data.contact?.email ||
        data.contactExtraPhone;

    return (
        <ShipmentDetailsSection>
            <Stack spacing={1.5}>
                <Stack
                    direction={{ xs: "column", lg: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", lg: "flex-start" }}
                    spacing={1.5}
                >
                    <Stack spacing={1.25} sx={{ minWidth: 0, flex: 1 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                            <FiMapPin size={18} />
                            <Typography
                                variant="h5"
                                fontWeight={800}
                                sx={{ fontSize: { xs: 22, md: 26 } }}
                            >
                                {data.routeFrom || "—"}
                            </Typography>

                            <Typography color="text.secondary" sx={{ fontSize: { xs: 20, md: 22 } }}>
                                →
                            </Typography>

                            <FiMapPin size={18} />
                            <Typography
                                variant="h5"
                                fontWeight={800}
                                sx={{ fontSize: { xs: 22, md: 26 } }}
                            >
                                {data.routeTo || "—"}
                            </Typography>
                        </Stack>

                        <Stack direction="row" spacing={0.75} flexWrap="wrap">
                            <Chip
                                size="small"
                                icon={kind === "cargo" ? <FiPackage size={14} /> : <FiTruck size={14} />}
                                label={
                                    kind === "cargo"
                                        ? t("shipments.shipmentCard.cargo", "Cargo")
                                        : t("shipments.shipmentCard.transport", "Transport")
                                }
                                sx={{
                                    borderRadius: 999,
                                    height: 28,
                                    "& .MuiChip-label": {
                                        fontSize: 12,
                                        fontWeight: 600,
                                    },
                                }}
                            />

                            {loadFrom && (
                                <Chip
                                    size="small"
                                    icon={<FiClock size={14} />}
                                    label={`${
                                        kind === "cargo"
                                            ? t("shipments.shipmentCard.load", "Pickup")
                                            : t("shipments.shipmentCard.loadTransport", "Loading")
                                    }: ${formatDate(loadFrom)}${loadTo ? ` – ${formatDate(loadTo)}` : ""}`}
                                    sx={{
                                        borderRadius: 999,
                                        height: 28,
                                        "& .MuiChip-label": {
                                            fontSize: 12,
                                            fontWeight: 500,
                                        },
                                    }}
                                />
                            )}

                            {data.dates.to && (
                                <Chip
                                    size="small"
                                    icon={<FiClock size={14} />}
                                    label={`${
                                        kind === "cargo"
                                            ? t("shipments.shipmentCard.unload", "Delivery")
                                            : t("shipments.shipmentCard.unloadTransport", "Unloading")
                                    }: ${formatDate(data.dates.to)}`}
                                    sx={{
                                        borderRadius: 999,
                                        height: 28,
                                        "& .MuiChip-label": {
                                            fontSize: 12,
                                            fontWeight: 500,
                                        },
                                    }}
                                />
                            )}
                        </Stack>
                    </Stack>

                    <Stack
                        spacing={1}
                        alignItems={{ xs: "flex-start", lg: "flex-end" }}
                        sx={{ minWidth: { lg: 220 } }}
                    >
                        <Typography
                            fontWeight={800}
                            color="success.main"
                            sx={{
                                fontSize: { xs: 24, md: 28 },
                                lineHeight: 1.1,
                                whiteSpace: "nowrap",
                            }}
                        >
                            {data.price || "—"}
                        </Typography>

                        {!user && <Link to="/register" className="header__button button" >{t('header.register')}</Link>}

                        {data.display_type === "inactive" ? (
                            <Typography variant="body2" color="warning.main" fontWeight={600}>
                                {t("shipments.messages.inactiveContactsNotice")}
                            </Typography>
                        ) : user && !contactsRevealed && onShowContacts && (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={
                                    contactsLoading ? (
                                        <CircularProgress size={14} color="inherit" />
                                    ) : (
                                        <FiPhone size={14} />
                                    )
                                }
                                disabled={contactsLoading}
                                onClick={() => void onShowContacts()}
                                sx={{
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 1.5,
                                    minHeight: 34,
                                }}
                            >
                                {contactsLoading
                                    ? t("shipments.actions.loading", "Loading...")
                                    : t("shipments.details.showContacts", "Show contacts")}
                            </Button>
                        )}

                        {contactsRevealed && hasContacts && (
                            <Stack spacing={0.5} sx={{ width: "100%", alignItems: "flex-end" }}>
                                {data.contact?.name && (
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FiUser size={14} />
                                        {data.contact.userId ? (
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                component={RouterLink}
                                                to={`/dashboard/user-reviews/${data.contact.userId}`}
                                                sx={{
                                                    color: "inherit",
                                                    textDecoration: "none",
                                                    "&:hover": {
                                                        textDecoration: "underline",
                                                    },
                                                }}
                                            >
                                                {data.contact.name}
                                            </Typography>
                                        ) : (
                                            <Typography variant="body2" fontWeight={600}>
                                                {data.contact.name}
                                            </Typography>
                                        )}
                                    </Stack>
                                )}

                                {data.contact?.company && (
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FaBriefcase size={13} />
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                            component={RouterLink}
                                            to={`/dashboard/companies/${data.contact.company.id}`}
                                            sx={{
                                                color: "inherit",
                                                textDecoration: "none",
                                                "&:hover": {
                                                    textDecoration: "underline",
                                                },
                                            }}
                                        >
                                            {data.contact.company.name}
                                        </Typography>
                                    </Stack>
                                )}

                                {data.contact?.phone1 && !data.extraPhoneAsMain && (
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FiPhone size={14} />
                                        <Typography variant="body2">{data.contact.phone1}</Typography>
                                    </Stack>
                                )}

                                {data.contact?.email && (
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FiMail size={14} />
                                        <Typography variant="body2">{data.contact.email}</Typography>
                                    </Stack>
                                )}

                                {data.contactExtraPhone && (
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FiPhone size={14} />
                                        <Typography variant="body2">{data.contactExtraPhone}</Typography>
                                    </Stack>
                                )}
                            </Stack>
                        )}
                    </Stack>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="center">
                    {typeof data.views === "number" && data.views > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t("shipments.shipmentCard.views", "Views")}: {data.views}
                        </Typography>
                    )}

                    {typeof data.repeats === "number" && data.repeats > 0 && (
                        <Typography variant="body2" color="text.secondary">
                            {t("shipments.shipmentCard.repeats", "Repeats")}: {data.repeats}
                        </Typography>
                    )}

                    {data.timeAgo && (
                        <Typography variant="body2" color="text.secondary">
                            {data.timeAgo}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </ShipmentDetailsSection>
    );
}