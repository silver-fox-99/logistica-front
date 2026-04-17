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
                borderRadius: 2,
                minHeight: 48,
                px: 1.5,
                "&.active": {
                    bgcolor: "#4A76B8",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                        color: "#fff",
                    },
                    "& .MuiListItemText-primary": {
                        fontWeight: 700,
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
                primaryTypographyProps={{
                    fontSize: 16,
                    fontWeight: 500,
                }}
            />
        </ListItemButton>
    );
}

export function CompanyWorkspaceSidebar({ company, onItemClick }: Props) {
    const navigate = useNavigate();
    const { id = "" } = useParams();

    const nav = [
        {
            to: `/dashboard/company/${id}/overview`,
            label: "Overview",
            icon: <FiGrid />,
        },
        {
            to: `/dashboard/company/${id}/info`,
            label: "Company info",
            icon: <FiBriefcase />,
        },
        {
            to: `/dashboard/company/${id}/documents`,
            label: "Documents",
            icon: <FiFileText />,
        },
        {
            to: `/dashboard/company/${id}/team`,
            label: "Team",
            icon: <FiUsers />,
            disabled: company.status !== "VERIFIED",
        },
        {
            to: `/dashboard/company/${id}/verification`,
            label: "Verification",
            icon: <FiShield />,
        },
        {
            to: `/dashboard/company/${id}/settings`,
            label: "Settings",
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
                label="Back to companies"
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
                    Team management will become available after company verification.
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