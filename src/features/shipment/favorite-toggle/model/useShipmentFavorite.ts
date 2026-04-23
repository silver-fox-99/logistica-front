import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { favoritesApi } from "@/shared/api/favoritesApi";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";
import type { ShipmentScope } from "@/entities/shipment/model/shipment-row.types";
import type { TFunction } from "i18next";

type Params = {
    data: ShipmentRowData;
    scope: ShipmentScope;
    kind: ShipmentsKind;
    favoriteIds?: Set<string>;
    t: TFunction;
    onFavoriteChange?: (id: string, isFavorite: boolean) => void;
};

export function useShipmentFavorite({
                                        data,
                                        scope,
                                        kind,
                                        favoriteIds,
                                        t,
                                        onFavoriteChange,
                                    }: Params) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoriteLoading, setFavoriteLoading] = useState(false);

    useEffect(() => {
        if (scope === "public") {
            if (favoriteIds) {
                setIsFavorite(favoriteIds.has(data.id));
            } else {
                setIsFavorite(!!data.isFavorite);
            }
            return;
        }

        setIsFavorite(false);
    }, [scope, favoriteIds, data.id, data.isFavorite]);

    const toggleFavorite = async () => {
        if (scope !== "public" || favoriteLoading) return;

        setFavoriteLoading(true);

        try {
            if (isFavorite) {
                const confirmed = window.confirm(
                    t("shipments.favorites.confirmRemove", "Remove from favorites?"),
                );

                if (!confirmed) {
                    setFavoriteLoading(false);
                    return;
                }

                await favoritesApi.remove(kind, data.id);
                setIsFavorite(false);
                onFavoriteChange?.(data.id, false);
                toast.success(t("shipments.favorites.removed", "Removed from favorites"));
            } else {
                await favoritesApi.add(kind, data.id);
                setIsFavorite(true);
                onFavoriteChange?.(data.id, true);
                toast.success(t("shipments.favorites.added", "Added to favorites"));
            }
        } catch (error: any) {
            const message = error?.response?.data?.message;
            const status = error?.response?.status;

            toast.error(
                message || (status ? t("shipments.favorites.error", "Failed to update favorites") : ""),
            );
        } finally {
            setFavoriteLoading(false);
        }
    };

    return {
        isFavorite,
        favoriteLoading,
        toggleFavorite,
    };
}