import { useCallback, useEffect, useState } from "react";
import {
    Alert,
    Box,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Pagination,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import { FiMapPin, FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { TenderAuctionType, type Tender, type TenderListParams } from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi.ts";

const pointLabel = (point?: Tender["points"][number]) =>
    point?.city || point?.region || point?.country || "-";

function routeLabel(tender: Tender) {
    const pickups = tender.points?.filter((point) => point.type === "PICKUP") ?? [];
    const dropoffs = tender.points?.filter((point) => point.type === "DROPOFF") ?? [];
    return `${pointLabel(pickups[0])} -> ${pointLabel(dropoffs[dropoffs.length - 1])}`;
}

export default function AdminTendersPage() {
    const { t, i18n } = useTranslation();
    const [items, setItems] = useState<Tender[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [auctionType, setAuctionType] = useState<"all" | TenderAuctionType>("all");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const fmtDate = (value?: string | null) =>
        value
            ? new Date(value).toLocaleString(i18n.language, {
                dateStyle: "short",
                timeStyle: "short",
                hour12: false,
            })
            : t("tenders.common.empty");

    const limit = 20;
    const pages = Math.max(1, Math.ceil(total / limit));

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const params: TenderListParams = {
            page,
            limit,
            search: search.trim() || undefined,
            auction_type: auctionType === "all" ? undefined : auctionType,
        };

        try {
            const res = await tendersApi.list(params);
            setItems(res.data);
            setTotal(res.total ?? res.data.length);
        } catch (e: any) {
            setError(e?.response?.data?.message || t("tenders.admin.loadError"));
        } finally {
            setLoading(false);
        }
    }, [auctionType, page, search, t]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        setPage(1);
    }, [auctionType]);

    return (
        <Stack spacing={2}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                    <Typography variant="h5" fontWeight={800}>{t("tenders.admin.title")}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.admin.subtitle")}
                    </Typography>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                        size="small"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") {
                                setPage(1);
                                void load();
                            }
                        }}
                        placeholder={t("tenders.admin.searchPlaceholder")}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FiSearch />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 280 }}
                    />

                    <Select
                        size="small"
                        value={auctionType}
                        onChange={(event) => setAuctionType(event.target.value as "all" | TenderAuctionType)}
                        sx={{ minWidth: 190 }}
                    >
                        <MenuItem value="all">{t("tenders.list.allAuctionTypes")}</MenuItem>
                        <MenuItem value={TenderAuctionType.DECREASING}>{t("tenders.list.decreasing")}</MenuItem>
                        <MenuItem value={TenderAuctionType.INCREASING}>{t("tenders.list.increasing")}</MenuItem>
                    </Select>
                </Stack>
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Paper variant="outlined" sx={{ borderRadius: 2 }}>
                <Box sx={{ overflowX: "auto" }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>{t("tenders.admin.table.status")}</TableCell>
                                <TableCell>{t("tenders.admin.table.tender")}</TableCell>
                                <TableCell>{t("tenders.admin.table.route")}</TableCell>
                                <TableCell>{t("tenders.admin.table.auction")}</TableCell>
                                <TableCell>{t("tenders.admin.table.price")}</TableCell>
                                <TableCell>{t("tenders.admin.table.bids")}</TableCell>
                                <TableCell>{t("tenders.admin.table.endsAt")}</TableCell>
                                <TableCell>{t("tenders.admin.table.createdAt")}</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {items.map((tender) => (
                                <TableRow key={tender.id} hover>
                                    <TableCell>
                                        <Chip size="small" label={tender.status} variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700}>{tender.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{tender.id}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.75} alignItems="center">
                                            <FiMapPin />
                                            <Typography variant="body2">{routeLabel(tender)}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>{tender.auction_type}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {tender.start_price} {tender.currency}
                                        </Typography>
                                        {tender.buyout_price && (
                                            <Typography variant="caption" color="text.secondary">
                                                {t("tenders.overview.buyoutPrice")}: {tender.buyout_price} {tender.currency}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {tender.bids?.length ?? (tender.has_bids ? t("tenders.list.card.hasBids") : t("tenders.list.card.noBids"))}
                                    </TableCell>
                                    <TableCell>{fmtDate(tender.ends_at)}</TableCell>
                                    <TableCell>{fmtDate(tender.created_at)}</TableCell>
                                </TableRow>
                            ))}

                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                            <CircularProgress size={26} />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            )}

                            {!loading && !items.length && (
                                <TableRow>
                                    <TableCell colSpan={8}>
                                        <Typography align="center" color="text.secondary" sx={{ py: 4 }}>
                                            {t("tenders.admin.empty")}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Box>
            </Paper>

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                    {t("tenders.common.total", { count: total })}
                </Typography>
                <Pagination count={pages} page={page} onChange={(_, value) => setPage(value)} />
            </Stack>
        </Stack>
    );
}
