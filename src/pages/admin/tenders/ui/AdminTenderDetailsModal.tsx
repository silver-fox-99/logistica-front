import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
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
import {
    FiMapPin,
    FiRefreshCw,
    FiTrash2,
    FiTruck,
    FiUser,
    FiX,
} from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import type { Tender } from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi";
import { formatDate, routeLabel } from "./tenderAdmin.utils";

type Props = {
    open: boolean;
    tenderId: string | null;
    onClose: () => void;
    onChanged: () => Promise<void> | void;
};

export function AdminTenderDetailsModal({
                                            open,
                                            tenderId,
                                            onClose,
                                            onChanged,
                                        }: Props) {
    const { i18n } = useTranslation();

    const [tender, setTender] = useState<Tender | null>(null);
    const [loading, setLoading] = useState(false);
    const [deletingBidId, setDeletingBidId] = useState<string | null>(null);
    const [error, setError] = useState("");

    const loadTender = useCallback(async () => {
        if (!tenderId) return;

        setLoading(true);
        setError("");

        try {
            const data = await tendersApi.adminGetById(tenderId);
            setTender(data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to load tender details");
        } finally {
            setLoading(false);
        }
    }, [tenderId]);

    useEffect(() => {
        if (open) {
            void loadTender();
        }
    }, [open, loadTender]);

    const handleDeleteBid = async (bidId: string) => {
        if (!tender?.id) return;

        const confirmed = window.confirm("Delete this bid?");
        if (!confirmed) return;

        setDeletingBidId(bidId);

        try {
            await tendersApi.adminDeleteBid(tender.id, bidId);
            toast.success("Bid deleted");

            await loadTender();
            await onChanged();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Failed to delete bid");
        } finally {
            setDeletingBidId(null);
        }
    };

    const bids = tender?.bids ?? [];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
            <DialogTitle>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <Box>
                        <Typography variant="h6" fontWeight={800}>
                            Tender details
                        </Typography>

                        {tender && (
                            <Typography variant="caption" color="text.secondary">
                                {tender.id}
                            </Typography>
                        )}
                    </Box>

                    <IconButton onClick={onClose}>
                        <FiX />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent dividers>
                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {!loading && error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {!loading && tender && (
                    <Stack spacing={2.5}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack spacing={1.5}>
                                <Stack
                                    direction={{ xs: "column", md: "row" }}
                                    justifyContent="space-between"
                                    gap={1}
                                >
                                    <Box>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Chip size="small" label={tender.status} color="primary" />
                                            <Chip size="small" label={tender.auction_type} variant="outlined" />
                                            <Chip size="small" label={tender.cargo_type} variant="outlined" />
                                            <Chip size="small" label={tender.vehicle_type} variant="outlined" />
                                        </Stack>

                                        <Typography variant="h6" fontWeight={800} sx={{ mt: 1 }}>
                                            {tender.title}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            {tender.cargo_description || "-"}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Start price
                                        </Typography>

                                        <Typography variant="h6" fontWeight={800}>
                                            {tender.start_price} {tender.currency}
                                        </Typography>

                                        {tender.buyout_price && (
                                            <Typography variant="body2" color="text.secondary">
                                                Buyout: {tender.buyout_price} {tender.currency}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>

                                <Divider />

                                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiMapPin />
                                        <Typography variant="body2">
                                            {routeLabel(tender)}
                                        </Typography>
                                    </Stack>

                                    <Typography variant="body2" color="text.secondary">
                                        Created: {formatDate(tender.created_at, i18n.language)}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Ends: {formatDate(tender.ends_at, i18n.language)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
                                Points
                            </Typography>

                            <Stack spacing={1}>
                                {tender.points?.map(point => (
                                    <Stack
                                        key={point.id}
                                        direction={{ xs: "column", md: "row" }}
                                        justifyContent="space-between"
                                        gap={1}
                                        sx={{
                                            py: 1,
                                            borderBottom: "1px solid",
                                            borderColor: "divider",
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <FiMapPin />

                                            <Box>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {point.type}
                                                </Typography>

                                                <Typography variant="body2" color="text.secondary">
                                                    {[point.country, point.region, point.city]
                                                        .filter(Boolean)
                                                        .join(", ") || "-"}
                                                </Typography>
                                            </Box>
                                        </Stack>

                                        <Typography variant="body2" color="text.secondary">
                                            {point.address || "-"}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Paper>

                        <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                            <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle1" fontWeight={800}>
                                    Bids
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    You can remove incorrect or abusive bids from this tender.
                                </Typography>
                            </Box>

                            <Box sx={{ overflowX: "auto" }}>
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Bidder</TableCell>
                                            <TableCell>Amount</TableCell>
                                            <TableCell>Transport</TableCell>
                                            <TableCell>Changed at</TableCell>
                                            <TableCell align="right">Actions</TableCell>
                                        </TableRow>
                                    </TableHead>

                                    <TableBody>
                                        {bids.map((bid: any) => (
                                            <TableRow key={bid.id} hover>
                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FiUser />

                                                        <Box>
                                                            <Typography variant="body2" fontWeight={700}>
                                                                {[bid.bidder?.first_name, bid.bidder?.last_name]
                                                                    .filter(Boolean)
                                                                    .join(" ") || bid.bidder_id}
                                                            </Typography>

                                                            <Typography variant="caption" color="text.secondary">
                                                                {bid.bidder?.phone || "-"}
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography variant="body2" fontWeight={800}>
                                                        {bid.amount} {tender.currency}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <FiTruck />

                                                        <Typography variant="body2">
                                                            {bid.transport_details || "-"}
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    {formatDate(
                                                        bid.last_changed_at || bid.created_at,
                                                        i18n.language,
                                                    )}
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Tooltip title="Delete bid">
                                                        <span>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                disabled={deletingBidId === bid.id}
                                                                onClick={() => handleDeleteBid(bid.id)}
                                                            >
                                                                {deletingBidId === bid.id ? (
                                                                    <CircularProgress size={16} />
                                                                ) : (
                                                                    <FiTrash2 />
                                                                )}
                                                            </IconButton>
                                                        </span>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}

                                        {!bids.length && (
                                            <TableRow>
                                                <TableCell colSpan={5}>
                                                    <Typography
                                                        align="center"
                                                        color="text.secondary"
                                                        sx={{ py: 3 }}
                                                    >
                                                        No bids found
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </Box>
                        </Paper>
                    </Stack>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>

                <Button
                    startIcon={<FiRefreshCw />}
                    onClick={() => void loadTender()}
                    disabled={loading || !tenderId}
                >
                    Refresh
                </Button>
            </DialogActions>
        </Dialog>
    );
}