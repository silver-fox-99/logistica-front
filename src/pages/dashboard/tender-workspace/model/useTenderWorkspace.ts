import { useCallback, useEffect, useState } from "react";

import {type Tender, TenderStatus} from "@/entities/tender/model/types";
import {tendersApi} from "@/shared/api/tendersApi.ts";

export function useTenderWorkspace(id: string) {
    const [tender, setTender] = useState<Tender | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [code, setCode] = useState("");

    const load = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError("");

        try {
            const data = await tendersApi.getById(id);
            setTender(data);
            if (data.status === TenderStatus.WAITING_CONFIRMATION) {
               tendersApi.getCode(id).then((result:{raw_code: string}) => {setCode(result?.raw_code)})

            }
        } catch {
            setError("Failed to load tender");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        void load();
    }, [load]);

    return {
        tender,
        isLoading,
        error,
        reload: load,
        code
    };
}