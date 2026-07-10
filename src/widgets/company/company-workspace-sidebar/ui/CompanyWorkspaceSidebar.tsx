import { NavLink, useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Chip,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Stack,
    Typography,
} from "@mui/material";
import {
    FiArrowLeft,
    FiBriefcase,
    FiFileText,
    FiGrid,
    FiSettings,
    FiShield,
    FiUsers,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import type { Company } from "@/entities/company/model/types";
import { companyStatusMap } from "@/entities/company/model/companyStatus";
import React from "react";

type Props = {
    company: Company;
    onItemClick?: () => void;
};

type CompanyNavItemProps = {
    to?: string;
    icon: React.ReactNode;
    label: string;
    disabled?: boolean;
    onClick?: () => void;
};

function CompanyNavItem({ to, icon, label, disabled, onClick }: CompanyNavItemProps) {
    return (
        <ListItemButton
            component={disabled ? "div" : to ? NavLink : "button"}
            to={disabled ? undefined : to}
            disabled={disabled}
            onClick={onClick}
            className="dashboard-buttons"
            sx={{
                borderRadius: "10px",
                mb: 1,
                py: 1.25,
                color: "text.secondary",
                transition: "all 0.2s ease-in-out",
                "& .MuiListItemIcon-root": {
                    color: "text.secondary",
                    minWidth: 36,
                    transition: "color 0.2s ease-in-out",
                },
                "& .MuiListItemText-primary": {
                    fontWeight: 500,
                    fontSize: "0.95rem",
                },
                "&:hover": {
                    bgcolor: "rgba(15, 95, 194, 0.04)",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": {
                        color: "primary.main",
                    },
                },
                "&.active": {
                    bgcolor: "transparent",
                    color: "primary.main",
                    "& .MuiListItemIcon-root": {
                        color: "primary.main",
                    },
                    "& .MuiListItemText-primary": {
                        fontWeight: 600,
                    },
                },
                "&.Mui-disabled": {
                    opacity: 0.55,
                },
            }}
        >
            <ListItemIcon
                sx={{
                    minWidth: 36,
                    color: "inherit",
                }}
            >
                {icon}
            </ListItemIcon>

            <ListItemText
                primary={label}
            />
        </ListItemButton>
    );
}

export function CompanyWorkspaceSidebar({ company, onItemClick }: Props) {
    const navigate = useNavigate();
    const { id = "" } = useParams();
    const { t } = useTranslation();

    const nav = [
        {
            to: `/dashboard/company/${id}/overview`,
            label: t("companyWorkspace.sidebar.overview"),
            icon: <FiGrid />,
        },
        {
            to: `/dashboard/company/${id}/info`,
            label: t("companyWorkspace.sidebar.companyInfo"),
            icon: <FiBriefcase />,
        },
        {
            to: `/dashboard/company/${id}/documents`,
            label: t("companyWorkspace.sidebar.documents"),
            icon: <FiFileText />,
        },
        {
            to: `/dashboard/company/${id}/team`,
            label: t("companyWorkspace.sidebar.team"),
            icon: <FiUsers />,
            disabled: company.status !== "VERIFIED",
        },
        {
            to: `/dashboard/company/${id}/verification`,
            label: t("companyWorkspace.sidebar.verification"),
            icon: <FiShield />,
        },
        {
            to: `/dashboard/company/${id}/settings`,
            label: t("companyWorkspace.sidebar.settings"),
            icon: <FiSettings />,
        },
    ];

    const status = companyStatusMap[company.status];

    const handleBack = () => {
        navigate("/dashboard/company");
        onItemClick?.();
    };

    return (
        <Stack spacing={1.5}>
            <CompanyNavItem
                icon={<FiArrowLeft />}
                label={t("companyWorkspace.sidebar.backToCompanies")}
                onClick={handleBack}
            />

            <Divider />

            <Stack spacing={1} sx={{ px: 1 }}>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                        lineHeight: 1.25,
                        wordBreak: "break-word",
                    }}
                >
                    {company.name}
                </Typography>

                <Box>
                    <Chip
                        label={status.label}
                        color={status.color}
                        size="small"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Stack>

            {company.status !== "VERIFIED" ? (
                <Alert
                    severity="info"
                    sx={{
                        borderRadius: 2,
                        fontSize: 13,
                        "& .MuiAlert-message": {
                            padding: "2px 0",
                        },
                    }}
                >
                    {t("companyWorkspace.sidebar.teamLockedHint")}
                </Alert>
            ) : null}

            <List disablePadding sx={{ display: "grid", gap: 0.5 }}>
                {nav.map((item) => (
                    <CompanyNavItem
                        key={item.to}
                        to={item.to}
                        icon={item.icon}
                        label={item.label}
                        disabled={item.disabled}
                        onClick={onItemClick}
                    />
                ))}
            </List>
        </Stack>
    );
}