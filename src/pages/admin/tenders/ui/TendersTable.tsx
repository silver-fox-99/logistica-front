import {
    Box,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiEye, FiMapPin, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import type { Tender } from "@/entities/tender/model/types";
import { formatDate, routeLabel } from "./tenderAdmin.utils";

type Props = {
    items: Tender[];
    loading: boolean;
    deletingTenderId: string | null;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
};

export function TendersTable({
                                 items,
                                 loading,
                                 deletingTenderId,
                                 onView,
                                 onDelete,
                             }: Props) {
    const { t, i18n } = useTranslation();

    return (
        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
            <Box sx={{ overflowX: "auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Status</TableCell>
                            <TableCell>Tender</TableCell>
                            <TableCell>Route</TableCell>
                            <TableCell>Auction</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Bids</TableCell>
                            <TableCell>Ends at</TableCell>
                            <TableCell>Created at</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {items.map(tender => (
                            <TableRow key={tender.id} hover>
                                <TableCell>
                                    <Chip size="small" label={tender.status} variant="outlined" />
                                </TableCell>

                                <TableCell>
                                    <Typography variant="body2" fontWeight={700}>
                                        {tender.title}
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary">
                                        {tender.id}
                                    </Typography>
                                </TableCell>

                                <TableCell>
                                    <Stack direction="row" spacing={0.75} alignItems="center">
                                        <FiMapPin />
                                        <Typography variant="body2">
                                            {routeLabel(tender)}
                                        </Typography>
                                    </Stack>
                                </TableCell>

                                <TableCell>{tender.auction_type}</TableCell>

                                <TableCell>
                                    <Typography variant="body2">
                                        {tender.start_price} {tender.currency}
                                    </Typography>

                                    {tender.buyout_price && (
                                        <Typography variant="caption" color="text.secondary">
                                            Buyout: {tender.buyout_price} {tender.currency}
                                        </Typography>
                                    )}
                                </TableCell>

                                <TableCell>
                                    {tender.bids?.length ?? (tender.has_bids ? "Has bids" : "No bids")}
                                </TableCell>

                                <TableCell>
                                    {formatDate(
                                        tender.ends_at,
                                        i18n.language,
                                        t("tenders.common.empty", "-"),
                                    )}
                                </TableCell>

                                <TableCell>
                                    {formatDate(
                                        tender.created_at,
                                        i18n.language,
                                        t("tenders.common.empty", "-"),
                                    )}
                                </TableCell>

                                <TableCell align="right">
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Tooltip title="View details">
                                            <IconButton size="small" onClick={() => onView(tender.id)}>
                                                <FiEye />
                                            </IconButton>
                                        </Tooltip>

                                        <Tooltip title="Delete tender">
                                            <span>
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    disabled={deletingTenderId === tender.id}
                                                    onClick={() => onDelete(tender.id)}
                                                >
                                                    {deletingTenderId === tender.id ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <FiTrash2 />
                                                    )}
                                                </IconButton>
                                            </span>
                                        </Tooltip>
                                    </Stack>
                                </TableCell>
                            </TableRow>
                        ))}

                        {loading && (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                        <CircularProgress size={26} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        )}

                        {!loading && !items.length && (
                            <TableRow>
                                <TableCell colSpan={9}>
                                    <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                        {t("tenders.admin.empty", "No tenders found")}
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Box>
        </Paper>
    );
}