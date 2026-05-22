import { Divider, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { NavLink } from "react-router-dom";
import { FiArrowLeft, FiBarChart2, FiEdit3, FiSettings } from "react-icons/fi";
import { useTranslation } from "react-i18next";

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
            <ListItemButton sx={{gap: 1}} component={NavLink} to="/dashboard/tenders/my" onClick={onItemClick}>
                <ListItemIcon><FiArrowLeft /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.backToMy")} primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>

            <Divider sx={{ my: 1 }} />

            <ListItemButton sx={{gap: 1}} component={NavLink} to={`${base}/overview`} onClick={onItemClick}>
                <ListItemIcon><FiBarChart2 /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.overview")} primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>

            <ListItemButton sx={{gap: 1}} component={NavLink} to={`${base}/bids`} onClick={onItemClick}>
                <ListItemIcon><FiEdit3 /></ListItemIcon>
                <ListItemText primary={t("tenders.workspace.sidebar.bids")} primaryTypographyProps={{ fontSize: 16 }} />
            </ListItemButton>

            {canManage && (
                <ListItemButton sx={{gap: 1}} component={NavLink} to={`${base}/settings`} onClick={onItemClick}>
                    <ListItemIcon><FiSettings /></ListItemIcon>
                    <ListItemText primary={t("tenders.workspace.sidebar.settings")} primaryTypographyProps={{ fontSize: 16 }} />
                </ListItemButton>
            )}
        </List>
    );
}
