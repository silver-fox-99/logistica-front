import { Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";
import { FiArrowLeft, FiBarChart2, FiEdit3, FiSettings } from "react-icons/fi";
import { useTranslation } from "react-i18next";

const sidebarButtonStyles = {
  borderRadius: "10px",
  mb: 1,
  py: 1.25,
  color: "text.secondary",
  transition: "all 0.2s ease-in-out",
  "& .MuiListItemIcon-root": {
    color: "text.secondary",
    minWidth: "40px",
    fontSize: "1.2rem",
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
};

type Props = {
    tenderId: string;
    canManage?: boolean;
    onItemClick?: () => void;
};

export function TenderWorkspaceSidebar({ tenderId, canManage = true, onItemClick }: Props) {
    const { t } = useTranslation();
    const base = `/dashboard/tenders/${tenderId}`;

    return (
        <List disablePadding>
            <ListItemButton sx={sidebarButtonStyles} component={NavLink} to="/dashboard/tenders/my" onClick={onItemClick}>
                <ListItemIcon><FiArrowLeft /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.backToMy")} />
            </ListItemButton>

            <Divider sx={{ my: 1, borderColor: "divider" }} />

            <ListItemButton sx={sidebarButtonStyles} component={NavLink} to={`${base}/overview`} onClick={onItemClick}>
                <ListItemIcon><FiBarChart2 /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.overview")} />
            </ListItemButton>

            <ListItemButton sx={sidebarButtonStyles} component={NavLink} to={`${base}/bids`} onClick={onItemClick}>
                <ListItemIcon><FiEdit3 /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.bids")} />
            </ListItemButton>

            {canManage && (
                <ListItemButton sx={sidebarButtonStyles} component={NavLink} to={`${base}/settings`} onClick={onItemClick}>
                    <ListItemIcon><FiSettings /></ListItemIcon>
                    <ListItemText primary={t("tenders.workspace.sidebar.settings")} />
                </ListItemButton>
            )}
        </List>
    );
}
