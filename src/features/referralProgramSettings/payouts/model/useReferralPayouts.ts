import { useCallback, useMemo, useState } from "react";
import type { ReferralPayoutCandidate } from "@/entities/referralProgramSettings/model/types";
import { referralProgramSettingsApi } from "@/shared/api/referralProgramSettings.api";

export function useReferralPayouts() {
    const [payoutLoading, setPayoutLoading] = useState(false);
    const [payoutError, setPayoutError] = useState<string | null>(null);

    const [candidates, setCandidates] = useState<ReferralPayoutCandidate[]>([]);
    const [batchKey, setBatchKey] = useState("");
    const [minBalanceCents, setMinBalanceCents] = useState<number>(1);
    const [payoutNote, setPayoutNote] = useState("");

    const [resetDialogOpen, setResetDialogOpen] = useState(false);
    const [resetting, setResetting] = useState(false);

    const candidatesTotal = useMemo(() => {
        try {
            const sum = candidates.reduce((acc, c) => acc + BigInt(c.balance || "0"), 0n);
            return sum.toString();
        } catch {
            return "0";
        }
    }, [candidates]);

    const loadCandidates = useCallback(async () => {
        setPayoutLoading(true);
        setPayoutError(null);

        try {
            const res = await referralProgramSettingsApi.listCandidates({
                currency: "UZS",
                minBalance: minBalanceCents,
                limit: 500,
                offset: 0,
            });
            setCandidates(res.items ?? []);
        } catch (e: any) {
            setPayoutError(e?.response?.data?.message ?? e?.message ?? "Failed to load payout candidates");
        } finally {
            setPayoutLoading(false);
        }
    }, [minBalanceCents]);

    const resetAllBalances = useCallback(async () => {
        const bk = batchKey.trim();
        if (!bk) {
            setPayoutError("Batch key is required (e.g. 2026-02)");
            return;
        }

        setResetting(true);
        setPayoutError(null);

        try {
            await referralProgramSettingsApi.resetAll({
                currency: "UZS",
                minBalance: minBalanceCents,
                batch_key: bk,
                note: payoutNote?.trim() || undefined,
            });

            setResetDialogOpen(false);
            await loadCandidates();
        } catch (e: any) {
            setPayoutError(e?.response?.data?.message ?? e?.message ?? "Reset failed");
        } finally {
            setResetting(false);
        }
    }, [batchKey, minBalanceCents, payoutNote, loadCandidates]);

    return {
        payoutLoading,
        payoutError,
        candidates,
        candidatesTotal,

        batchKey,
        setBatchKey,
        minBalanceCents,
        setMinBalanceCents,
        payoutNote,
        setPayoutNote,

        resetDialogOpen,
        setResetDialogOpen,
        resetting,

        loadCandidates,
        resetAllBalances,
    };
}
