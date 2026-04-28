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

const publicDetailsCache = new Map<string, CacheEntry>();

function getCacheKey(kind: ShipmentsKind, id: string) {
    return `${kind}:${id}`;
}

async function fetchPublicShipmentDetails(kind: ShipmentsKind, id: string): Promise<ShipmentRowData> {
    const response =
        kind === "cargo"
            ? await cargoApi.publicInfo(id)
            : await transportApi.publicInfo(id);

    return kind === "cargo"
        ? adaptCargo(response as any)
        : adaptTransport(response as any);
}

async function fetchPaidShipmentDetails(kind: ShipmentsKind, id: string): Promise<ShipmentRowData> {
    const response =
        kind === "cargo"
            ? await cargoApi.info(id)
            : await transportApi.info(id);

    return kind === "cargo"
        ? adaptCargo(response as any)
        : adaptTransport(response as any);
}

function getErrorMessage(error: any) {
    return error?.response?.data?.message ?? "Failed to load shipment details";
}

function getRawErrorCode(error: any) {
    return error?.response?.data?.code ?? null;
}

export function useShipmentDetailsPage(kind: ShipmentsKind | null, id: string | null) {
    const [data, setData] = useState<ShipmentRowData | null>(null);
    const [loading, setLoading] = useState(false);
    const [contactsLoading, setContactsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [contactsError, setContactsError] = useState<string | null>(null);
    const [contactsErrorCode, setContactsErrorCode] = useState<string | null>(null);
    const [contactsRevealed, setContactsRevealed] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);

    const reload = useCallback(() => {
        if (kind && id) {
            publicDetailsCache.delete(getCacheKey(kind, id));
        }

        setContactsRevealed(false);
        setContactsError(null);
        setContactsErrorCode(null);
        setReloadKey((prev) => prev + 1);
    }, [kind, id]);

    const showContacts = useCallback(async () => {
        if (!kind || !id || contactsLoading) return;

        setContactsLoading(true);
        setContactsError(null);
        setContactsErrorCode(null);

        try {
            const result = await fetchPaidShipmentDetails(kind, id);

            setData(result);
            setContactsRevealed(true);
        } catch (e: any) {
            setContactsError(getErrorMessage(e));
            setContactsErrorCode(getRawErrorCode(e));
        } finally {
            setContactsLoading(false);
        }
    }, [kind, id, contactsLoading]);

    useEffect(() => {
        if (!kind || !id) return;

        let active = true;
        const cacheKey = getCacheKey(kind, id);

        const run = async () => {
            setLoading(true);
            setError(null);
            setContactsError(null);
            setContactsErrorCode(null);
            setContactsRevealed(false);

            try {
                const cached = publicDetailsCache.get(cacheKey);

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

                const promise = fetchPublicShipmentDetails(kind, id);
                publicDetailsCache.set(cacheKey, { promise });

                const result = await promise;

                publicDetailsCache.set(cacheKey, { data: result });

                if (!active) return;
                setData(result);
            } catch (e: any) {
                const message = getErrorMessage(e);

                publicDetailsCache.set(cacheKey, { error: message });

                if (!active) return;
                setData(null);
                setError(message);
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void run();

        return () => {
            active = false;
        };
    }, [kind, id, reloadKey]);

    return {
        data,
        loading,
        error,
        reload,

        contactsLoading,
        contactsError,
        contactsErrorCode,
        contactsRevealed,
        showContacts,
    };
}