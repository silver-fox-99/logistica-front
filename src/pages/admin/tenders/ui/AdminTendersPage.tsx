import { useCallback, useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    InputAdornment,
    MenuItem,
    Pagination,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { FiSearch } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

import {
    TenderAuctionType,
    type Tender,
    type TenderListParams,
} from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi";

import { AdminTenderDetailsModal } from "./AdminTenderDetailsModal";
import { TendersTable } from "./TendersTable";
import { LIMIT } from "./tenderAdmin.utils";

export default function AdminTendersPage() {
    const { t } = useTranslation();

    const [items, setItems] = useState<Tender[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");
    const [auctionType, setAuctionType] = useState<"all" | TenderAuctionType>("all");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
    const [deletingTenderId, setDeletingTenderId] = useState<string | null>(null);

    const pages = useMemo(() => {
        return Math.max(1, Math.ceil(total / LIMIT));
    }, [total]);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");

        const params: TenderListParams = {
            page,
            limit: LIMIT,
            search: search.trim() || undefined,
            auction_type: auctionType === "all" ? undefined : auctionType,
        };

        try {
            const res = await tendersApi.adminList(params);

            setItems(res.data);
            setTotal(res.total ?? res.data.length);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Failed to load tenders");
        } finally {
            setLoading(false);
        }
    }, [auctionType, page, search]);

    useEffect(() => {
        void load();
    }, [load]);

    const handleSearch = () => {
        setPage(1);
        void load();
    };

    const handleAuctionTypeChange = (value: "all" | TenderAuctionType) => {
        setAuctionType(value);
        setPage(1);
    };

    const handleDeleteTender = async (id: string) => {
        const confirmed = window.confirm("Delete this tender?");
        if (!confirmed) return;

        setDeletingTenderId(id);

        try {
            await tendersApi.adminDelete(id);
            toast.success("Tender deleted");
            await load();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Failed to delete tender");
        } finally {
            setDeletingTenderId(null);
        }
    };

    return (
        <Stack spacing={2}>
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                gap={1.5}
            >
                <Box>
                    <Typography variant="h5" fontWeight={800}>
                        {t("tenders.admin.title", "Tenders management")}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                        {t("tenders.admin.subtitle", "View, inspect and moderate all tenders.")}
                    </Typography>
                </Box>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
                    <TextField
                        size="small"
                        value={search}
                        onChange={event => setSearch(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                handleSearch();
                            }
                        }}
                        placeholder={t("tenders.admin.searchPlaceholder", "Search tenders")}
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
                        onChange={event => {
                            handleAuctionTypeChange(event.target.value as "all" | TenderAuctionType);
                        }}
                        sx={{ minWidth: 190 }}
                    >
                        <MenuItem value="all">
                            {t("tenders.list.allAuctionTypes", "All auction types")}
                        </MenuItem>

                        <MenuItem value={TenderAuctionType.DECREASING}>
                            {t("tenders.list.decreasing", "Decreasing")}
                        </MenuItem>

                        <MenuItem value={TenderAuctionType.INCREASING}>
                            {t("tenders.list.increasing", "Increasing")}
                        </MenuItem>
                    </Select>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error">
                    {error}
                </Alert>
            )}

            <TendersTable
                items={items}
                loading={loading}
                deletingTenderId={deletingTenderId}
                onView={setSelectedTenderId}
                onDelete={handleDeleteTender}
            />

            <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">
                    Total: {total}
                </Typography>

                <Pagination
                    count={pages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                />
            </Stack>

            <AdminTenderDetailsModal
                open={Boolean(selectedTenderId)}
                tenderId={selectedTenderId}
                onClose={() => setSelectedTenderId(null)}
                onChanged={load}
            />
        </Stack>
    );
}