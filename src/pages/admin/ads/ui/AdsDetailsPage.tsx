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
    Stack,
} from "@mui/material";
import { FiPlus } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";

import type {
    AdBanner,
    AdPlacement,
    CreateAdBannerPayload,
    ReorderAdBannersPayload,
    UpdateAdPlacementPayload,
    UpdateAdBannerPayload,
} from "@/entities/ads/model/types";
import { adminAdsApi } from "@/shared/api/adminAdsApi";
import { AdPlacementForm } from "@/widgets/admin-ads/ui/AdPlacementForm";
import { AdBannersTable } from "@/widgets/admin-ads/ui/AdBannersTable";
import { AdBannerForm } from "@/widgets/admin-ads/ui/AdBannerForm";

export default function AdsDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [placement, setPlacement] = React.useState<AdPlacement | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState("");

    const [bannerDialogOpen, setBannerDialogOpen] = React.useState(false);
    const [bannerLoading, setBannerLoading] = React.useState(false);
    const [editingBanner, setEditingBanner] = React.useState<AdBanner | null>(null);

    const loadPlacement = React.useCallback(async () => {
        if (!id) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            const res = await adminAdsApi.getPlacement(id);
            setPlacement(res.data.data);
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось загрузить placement");
        } finally {
            setLoading(false);
        }
    }, [id]);

    React.useEffect(() => {
        void loadPlacement();
    }, [loadPlacement]);

    const handleUpdatePlacement = async (payload: UpdateAdPlacementPayload) => {
        if (!id) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            await adminAdsApi.updatePlacement(id, payload);
            await loadPlacement();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось обновить placement");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBanner = async (payload: CreateAdBannerPayload) => {
        if (!id) {
            return;
        }

        setBannerLoading(true);
        setError("");

        try {
            await adminAdsApi.createBanner(id, payload);
            setBannerDialogOpen(false);
            await loadPlacement();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось создать баннер");
        } finally {
            setBannerLoading(false);
        }
    };

    const handleUpdateBanner = async (payload: UpdateAdBannerPayload) => {
        if (!id || !editingBanner) {
            return;
        }

        setBannerLoading(true);
        setError("");

        try {
            await adminAdsApi.updateBanner(id, editingBanner.id, payload);
            setBannerDialogOpen(false);
            setEditingBanner(null);
            await loadPlacement();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось обновить баннер");
        } finally {
            setBannerLoading(false);
        }
    };

    const handleDeleteBanner = async (banner: AdBanner) => {
        if (!id) {
            return;
        }

        const confirmed = window.confirm(`Удалить баннер "${banner.title}"?`);

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setError("");

        try {
            await adminAdsApi.deleteBanner(id, banner.id);
            await loadPlacement();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось удалить баннер");
        } finally {
            setLoading(false);
        }
    };

    const reorder = async (banners: AdBanner[]) => {
        if (!id) {
            return;
        }

        const payload: ReorderAdBannersPayload = {
            items: banners.map((item, index) => ({
                id: item.id,
                sort_order: index,
            })),
        };

        setLoading(true);
        setError("");

        try {
            await adminAdsApi.reorderBanners(id, payload);
            await loadPlacement();
        } catch (e: any) {
            setError(e?.response?.data?.message || "Не удалось изменить порядок баннеров");
        } finally {
            setLoading(false);
        }
    };

    const handleMoveUp = async (banner: AdBanner) => {
        if (!placement?.banners) {
            return;
        }

        const sorted = [...placement.banners].sort(
            (a, b) => a.sort_order - b.sort_order,
        );
        const index = sorted.findIndex((item) => item.id === banner.id);

        if (index <= 0) {
            return;
        }

        [sorted[index - 1], sorted[index]] = [sorted[index], sorted[index - 1]];
        await reorder(sorted);
    };

    const handleMoveDown = async (banner: AdBanner) => {
        if (!placement?.banners) {
            return;
        }

        const sorted = [...placement.banners].sort(
            (a, b) => a.sort_order - b.sort_order,
        );
        const index = sorted.findIndex((item) => item.id === banner.id);

        if (index === -1 || index >= sorted.length - 1) {
            return;
        }

        [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]];
        await reorder(sorted);
    };

    if (!placement && loading) {
        return null;
    }

    return (
        <Stack spacing={3}>
            {error ? <Alert severity="error">{error}</Alert> : null}

            <Box>
                <Button variant="outlined" onClick={() => navigate("/admin/ads")}>
                    Назад к списку
                </Button>
            </Box>

            <Card>
                <CardHeader title="Настройки placement" />
                <CardContent>
                    {placement ? (
                        <AdPlacementForm
                            initialValues={placement}
                            loading={loading}
                            submitLabel="Сохранить placement"
                            onSubmit={handleUpdatePlacement}
                        />
                    ) : null}
                </CardContent>
            </Card>

            <Card>
                <CardHeader
                    title="Баннеры"
                    action={
                        <Button
                            variant="contained"
                            startIcon={<FiPlus />}
                            onClick={() => {
                                setEditingBanner(null);
                                setBannerDialogOpen(true);
                            }}
                        >
                            Создать баннер
                        </Button>
                    }
                />
                <CardContent>
                    <AdBannersTable
                        banners={
                            [...(placement?.banners ?? [])].sort(
                                (a, b) => a.sort_order - b.sort_order,
                            )
                        }
                        loading={loading}
                        onEdit={(banner) => {
                            setEditingBanner(banner);
                            setBannerDialogOpen(true);
                        }}
                        onDelete={handleDeleteBanner}
                        onMoveUp={handleMoveUp}
                        onMoveDown={handleMoveDown}
                    />
                </CardContent>
            </Card>

            <Dialog
                open={bannerDialogOpen}
                onClose={
                    bannerLoading
                        ? undefined
                        : () => {
                            setBannerDialogOpen(false);
                            setEditingBanner(null);
                        }
                }
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {editingBanner ? "Редактирование баннера" : "Создание баннера"}
                </DialogTitle>

                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        {editingBanner ? (
                            <AdBannerForm
                                mode="edit"
                                initialValues={editingBanner}
                                loading={bannerLoading}
                                submitLabel="Сохранить баннер"
                                onSubmit={handleUpdateBanner}
                            />
                        ) : (
                            <AdBannerForm
                                mode="create"
                                loading={bannerLoading}
                                submitLabel="Создать баннер"
                                onSubmit={handleCreateBanner}
                            />
                        )}
                    </Box>
                </DialogContent>
            </Dialog>
        </Stack>
    );
}