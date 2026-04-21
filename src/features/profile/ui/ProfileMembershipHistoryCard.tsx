import {
    Avatar,
    Box,
    Chip,
    Paper,
    Stack,
    Typography,
} from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { useNavigate } from "react-router-dom";
import { formatDate } from "@/shared/utils/formatDate";
import { useTranslation } from "react-i18next";
import type {CompanyMembershipHistoryItem} from "@/entities/company/model/types.ts";
import React from "react";

type Props = {
    items: CompanyMembershipHistoryItem[];
    loading?: boolean;
};

function formatRole(value?: string | null) {
    if (!value) return "—";
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatStatus(value?: string | null) {
    if (!value) return "—";
    return value
        .toLowerCase()
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusColor(status?: string | null): "default" | "success" | "warning" | "error" {
    switch (status) {
        case "ACTIVE":
            return "success";
        case "BLOCKED":
            return "warning";
        case "REMOVED":
            return "default";
        default:
            return "default";
    }
}

function getCompanyLocation(item: CompanyMembershipHistoryItem) {
    return [item.company?.country, item.company?.region, item.company?.city]
        .filter(Boolean)
        .join(", ");
}

function getInvitedByLabel(item: CompanyMembershipHistoryItem) {
    return (
        [item.invited_by_user?.first_name, item.invited_by_user?.last_name]
            .filter(Boolean)
            .join(" ")
            .trim() ||
        item.invited_by_user?.email ||
        item.invited_by_user?.phone ||
        "—"
    );
}

export default function ProfileMembershipHistoryCard({ items, loading }: Props) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const handleOpenCompany = (companyId?: string) => {
        if (!companyId) return;
        navigate(`/dashboard/companies/${companyId}`);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
            }}
        >
            <Stack spacing={2}>
                <Stack spacing={0.5}>
                    <Typography variant="h6" fontWeight={700}>
                        {t("profile.membershipHistory.title", "Company history")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t(
                            "profile.membershipHistory.description",
                            "Shows current and past company memberships."
                        )}
                    </Typography>
                </Stack>

                {loading && (
                    <Typography variant="body2" color="text.secondary">
                        {t("profile.membershipHistory.loading", "Loading company history...")}
                    </Typography>
                )}

                {!loading && items.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                        {t("profile.membershipHistory.empty", "No company history found.")}
                    </Typography>
                )}

                {!loading && items.length > 0 && (
                    <Stack spacing={1.5}>
                        {items.map((item) => {
                            const location = getCompanyLocation(item);
                            const invitedBy = getInvitedByLabel(item);

                            return (
                                <Paper
                                    key={item.id}
                                    variant="outlined"
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        borderColor: "divider",
                                        bgcolor: "background.default",
                                    }}
                                >
                                    <Stack spacing={1.25}>
                                        <Stack
                                            direction="row"
                                            spacing={1.25}
                                            alignItems="center"
                                        >
                                            <Avatar
                                                src={item.company?.logo || undefined}
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    cursor: item.company?.id ? "pointer" : "default",
                                                }}
                                                onClick={() => handleOpenCompany(item.company?.id)}
                                            >
                                                <BusinessOutlinedIcon />
                                            </Avatar>

                                            <Stack spacing={0.35} sx={{ flex: 1, minWidth: 0 }}>
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    flexWrap="wrap"
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={700}
                                                        noWrap
                                                        sx={{
                                                            cursor: item.company?.id ? "pointer" : "default",
                                                            "&:hover": item.company?.id
                                                                ? { textDecoration: "underline" }
                                                                : undefined,
                                                        }}
                                                        onClick={() => handleOpenCompany(item.company?.id)}
                                                    >
                                                        {item.company?.name || t("profile.membershipHistory.unknownCompany", "Unknown company")}
                                                    </Typography>

                                                    <Chip
                                                        size="small"
                                                        label={formatRole(item.role)}
                                                        variant="outlined"
                                                    />

                                                    <Chip
                                                        size="small"
                                                        label={formatStatus(item.status)}
                                                        color={getStatusColor(item.status)}
                                                        variant="outlined"
                                                    />

                                                    {item.is_default && (
                                                        <Chip
                                                            size="small"
                                                            color="primary"
                                                            label={t("profile.membershipHistory.default", "Default")}
                                                        />
                                                    )}
                                                </Stack>

                                                {location && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{
                                                            cursor: item.company?.id ? "pointer" : "default",
                                                            "&:hover": item.company?.id
                                                                ? { textDecoration: "underline" }
                                                                : undefined,
                                                        }}
                                                        onClick={() => handleOpenCompany(item.company?.id)}
                                                    >
                                                        {location}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            gap={2}
                                            flexWrap="wrap"
                                            alignItems="center"
                                        >
                                            {item.joined_at && (
                                                <MetaRow
                                                    icon={<CheckCircleOutlineOutlinedIcon fontSize="small" />}
                                                    label={t("profile.membershipHistory.joinedAt", "Joined")}
                                                    value={formatDate(item.joined_at)}
                                                />
                                            )}

                                            {item.removed_at && (
                                                <MetaRow
                                                    icon={<LogoutOutlinedIcon fontSize="small" />}
                                                    label={t("profile.membershipHistory.removedAt", "Left")}
                                                    value={formatDate(item.removed_at)}
                                                />
                                            )}

                                            {item.invited_by_user && (
                                                <MetaRow
                                                    icon={<PersonOutlineOutlinedIcon fontSize="small" />}
                                                    label={t("profile.membershipHistory.invitedBy", "Invited by")}
                                                    value={invitedBy}
                                                />
                                            )}

                                            {item.invited_at && (
                                                <MetaRow
                                                    icon={<EventOutlinedIcon fontSize="small" />}
                                                    label={t("profile.membershipHistory.invitedAt", "Invited")}
                                                    value={formatDate(item.invited_at)}
                                                />
                                            )}
                                        </Stack>

                                        {item.note && (
                                            <Typography variant="body2" color="text.primary">
                                                {item.note}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Stack>
                )}
            </Stack>
        </Paper>
    );
}

function MetaRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Stack direction="row" spacing={0.75} alignItems="center">
            <Box color="text.secondary" display="flex" alignItems="center">
                {icon}
            </Box>
            <Typography variant="body2" color="text.secondary">
                {label}:{" "}
                <Typography component="span" color="text.primary" fontWeight={600}>
                    {value}
                </Typography>
            </Typography>
        </Stack>
    );
}