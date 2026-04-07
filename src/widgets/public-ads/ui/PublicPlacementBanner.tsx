import React from "react";
import {
    Box,
    CircularProgress,
    Paper,
} from "@mui/material";

import type { AdBanner, AdPlacement } from "@/entities/ads/model/types";
import { publicAdsApi } from "@/shared/api/publicAdsApi";

type Props = {
    page: string;
    placementKey: string;
    height?: number | string;
};

function getActiveBanners(placement: AdPlacement | null): AdBanner[] {
    if (!placement?.banners?.length) {
        return [];
    }

    const now = Date.now();

    return placement.banners
        .filter((banner) => banner.is_active)
        .filter((banner) => {
            if (banner.start_at) {
                const start = new Date(banner.start_at).getTime();
                if (!Number.isNaN(start) && start > now) {
                    return false;
                }
            }

            if (banner.end_at) {
                const end = new Date(banner.end_at).getTime();
                if (!Number.isNaN(end) && end < now) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => a.sort_order - b.sort_order);
}

export function PublicPlacementBanner(props: Props) {
    const { page, placementKey, height = 260 } = props;

    const [loading, setLoading] = React.useState(true);
    const [placement, setPlacement] = React.useState<AdPlacement | null>(null);
    const [activeIndex, setActiveIndex] = React.useState(0);

    const loadPlacement = React.useCallback(async () => {
        setLoading(true);

        try {
            const response = await publicAdsApi.resolvePlacement({
                page,
                placement_key: placementKey,
            });

            setPlacement(response.data.data ?? null);
        } catch {
            setPlacement(null);
        } finally {
            setLoading(false);
        }
    }, [page, placementKey]);

    React.useEffect(() => {
        void loadPlacement();
    }, [loadPlacement]);

    const banners = React.useMemo(() => {
        return getActiveBanners(placement);
    }, [placement]);

    React.useEffect(() => {
        setActiveIndex(0);
    }, [placement?.id, banners.length]);

    React.useEffect(() => {
        if (!placement?.rotation_enabled) {
            return;
        }

        if (banners.length <= 1) {
            return;
        }

        const intervalSec = placement.rotation_interval_sec > 0
            ? placement.rotation_interval_sec
            : 5;

        const timer = window.setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % banners.length);
        }, intervalSec * 1000);

        return () => {
            window.clearInterval(timer);
        };
    }, [placement?.rotation_enabled, placement?.rotation_interval_sec, banners.length]);

    const currentBanner = banners[activeIndex];

    if (loading) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                    minHeight: height,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress size={26} />
            </Paper>
        );
    }

    console.log(currentBanner)

    if (!currentBanner) {
        return null;
    }

    const content = (
        <Box
            sx={{
                width: "100%",
                height,
                display: "block",
                position: "relative",
                overflow: "hidden",
                borderRadius: 2,
                backgroundColor: "#f5f5f5",
            }}
        >
            <Box
                component="img"
                src={currentBanner.image_url}
                alt={currentBanner.alt || currentBanner.title}
                sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                }}
            />

            {currentBanner.button_label ? (
                <Box
                    sx={{
                        position: "absolute",
                        left: 20,
                        bottom: 20,
                        px: 2,
                        py: 1,
                        borderRadius: 999,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                    }}
                >
                    {currentBanner.button_label}
                </Box>
            ) : null}

            {banners.length > 1 ? (
                <Box
                    sx={{
                        position: "absolute",
                        right: 14,
                        bottom: 14,
                        display: "flex",
                        gap: 0.75,
                    }}
                >
                    {banners.map((banner, index) => (
                        <Box
                            key={banner.id}
                            sx={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                backgroundColor:
                                    index === activeIndex
                                        ? "#fff"
                                        : "rgba(255,255,255,0.45)",
                            }}
                        />
                    ))}
                </Box>
            ) : null}
        </Box>
    );

    if (!currentBanner.target_url) {
        return (
            <Paper
                variant="outlined"
                sx={{
                    mb: 2,
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                {content}
            </Paper>
        );
    }

    return (
        <Paper
            variant="outlined"
            sx={{
                mb: 2,
                borderRadius: 2,
                overflow: "hidden",
            }}
        >
            <Box
                component="a"
                href={currentBanner.target_url}
                target={currentBanner.open_in_new_tab ? "_blank" : "_self"}
                rel={currentBanner.open_in_new_tab ? "noreferrer noopener" : undefined}
                sx={{
                    display: "block",
                    textDecoration: "none",
                }}
            >
                {content}
            </Box>
        </Paper>
    );
}