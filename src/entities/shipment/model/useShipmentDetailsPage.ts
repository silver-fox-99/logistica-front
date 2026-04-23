import { useCallback, useEffect, useState } from "react";
import { cargoApi } from "@/shared/api/cargoApi";
import { transportApi } from "@/shared/api/transportApi";
import { adaptCargo, adaptTransport } from "@/entities/shipment/lib/adapter";
import type { ShipmentRowData, ShipmentsKind } from "@/entities/shipment/model/type";

type CacheEntry = {
    promise?: Promise<ShipmentRowData>;
    data?: ShipmentRowData;
    error?: string;
};

const shipmentDetailsCache = new Map<string, CacheEntry>();

function getCacheKey(kind: ShipmentsKind, id: string) {
    return `${kind}:${id}`;
}

async function fetchShipmentDetails(kind: ShipmentsKind, id: string): Promise<ShipmentRowData> {
    const response = kind === "cargo" ? await cargoApi.info(id) : await transportApi.info(id);

    return kind === "cargo"
        ? adaptCargo(response as any)
        : adaptTransport(response as any);
}

function getErrorMessage(error: any) {
    return error?.response?.data?.message ?? "Failed to load shipment details";
}

export function useShipmentDetailsPage(kind: ShipmentsKind | null, id: string | null) {
    const [data, setData] = useState<ShipmentRowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => {
        if (kind && id) {
            shipmentDetailsCache.delete(getCacheKey(kind, id));
        }

        setReloadKey((prev) => prev + 1);
    }, [kind, id]);

    useEffect(() => {
        if (!kind || !id) return;

        let active = true;
        const cacheKey = getCacheKey(kind, id);

        const run = async () => {
            setLoading(true);
            setError(null);

            try {
                const cached = shipmentDetailsCache.get(cacheKey);

                if (cached?.data) {
                    if (!active) return;
                    setData(cached.data);
                    return;
                }

                if (cached?.error) {
                    if (!active) return;
                    setData(null);
                    setError(cached.error);
                    return;
                }

                if (cached?.promise) {
                    const result = await cached.promise;

                    if (!active) return;
                    setData(result);
                    return;
                }

                const promise = fetchShipmentDetails(kind, id);
                shipmentDetailsCache.set(cacheKey, { promise });

                const result = await promise;

                shipmentDetailsCache.set(cacheKey, { data: result });

                if (!active) return;
                setData(result);
            } catch (e: any) {
                const message = getErrorMessage(e);

                shipmentDetailsCache.set(cacheKey, { error: message });

                if (!active) return;
                setData(null);
                setError(message);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        run();

        return () => {
            active = false;
        };
    }, [kind, id, reloadKey]);

    return {
        data,
        loading,
        error,
        reload,
    };
}