import React from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Dialog,
    DialogContent,
    DialogTitle,
    Pagination,
    Stack,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";

import type {
    AdPlacement,
    AdPlacementsListQuery,
    CreateAdPlacementPayload,
} from "@/entities/ads/model/types";
import { adminAdsApi } from "@/shared/api/adminAdsApi";
import { AdsFilters } from "@/widgets/admin-ads/ui/AdsFilters";
import { AdsTable } from "@/widgets/admin-ads/ui/AdsTable";
import { AdPlacementForm } from "@/widgets/admin-ads/ui/AdPlacementForm";

const defaultFilters: AdPlacementsListQuery = {
    search: "",
    page_path: "",
    is_active: undefined,
    page: 1,
    limit: 10,
};

export default function AdsPage() {
    const [items, setItems] = React.useState<AdPlacement[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string>("");
    const [totalPages, setTotalPages] = React.useState(1);

    const [filters, setFilters] = React.useState<AdPlacementsListQuery>(defaultFilters);

    const [createOpen, setCreateOpen] = React.useState(false);
    const [createLoading, setCreateLoading] = React.useState(false);

    const loadPlacements = React.useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const res = await adminAdsApi.listPlacements(filters);
            setItems(res.data.data.items ?? []);
            setTotalPages(res.data.data.totalPages ?? 1);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось загрузить placements");
        } finally {
            setLoading(false);
        }
    }, [filters]);

    React.useEffect(() => {
        void loadPlacements();
    }, [loadPlacements]);

    const handleCreatePlacement = async (payload: CreateAdPlacementPayload) => {
        setCreateLoading(true);
        setError("");

        try {
            await adminAdsApi.createPlacement(payload);
            setCreateOpen(false);
            await loadPlacements();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось создать placement");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleDelete = async (item: AdPlacement) => {
        const confirmed = window.confirm(
            `Удалить placement "${item.title || item.placement_key}"?`,
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            await adminAdsApi.deletePlacement(item.id);
            await loadPlacements();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось удалить placement");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Card>
                <CardHeader
                    title="Рекламные placements"
                    subheader="Здесь вы можете создавать рекламные зоны, фильтровать их и переходить к управлению баннерами."
                    action={
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={() => setCreateOpen(true)}
                        >
                            Создать placement
                        </Button>
                    }
                />
                <CardContent>
                    <AdsFilters
                        filters={filters}
                        loading={loading}
                        onChange={setFilters}
                        onApply={loadPlacements}
                        onReset={() => setFilters(defaultFilters)}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardHeader
                    title="Список placements"
                    subheader="Каждый placement — это место на странице, куда можно добавить один или несколько баннеров."
                />
                <CardContent>
                    <AdsTable
                        data={items}
                        loading={loading}
                        onDelete={handleDelete}
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={filters.page ?? 1}
                            onChange={(_, page) =>
                                setFilters((prev) => ({ ...prev, page }))
                            }
                        />
                    </Box>
                </CardContent>
            </Card>

            <Dialog
                open={createOpen}
                onClose={createLoading ? undefined : () => setCreateOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>Создание placement</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <AdPlacementForm
                            loading={createLoading}
                            submitLabel="Создать"
                            onSubmit={handleCreatePlacement}
                        />
                    </Box>
                </DialogContent>
            </Dialog>
        </Stack>
    );
}