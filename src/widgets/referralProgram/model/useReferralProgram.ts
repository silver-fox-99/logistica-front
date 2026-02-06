import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
    ReferralAgreement,
    ReferralCodeInfo,
    ReferralEarningRow,
    ReferralInvitedRow,
    ReferralKpi,
} from "@/entities/referralProgram";
import { ReferralProgramApi } from "@/shared/api/referralProgram.api";


function maskId(id: string | null | undefined) {
    if (!id) return "—";
    return `${id}`;
}

function mapTxStatus(reason: string): "CONFIRMED" | "REVERSED" {
    if (reason === "REFERRAL_BONUS_REVERSAL") return "REVERSED";
    return "CONFIRMED";
}

export function useReferralProgram() {
    const mountedRef = useRef(true);
    const [enabled, setEnabled] = useState(true);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [agreement, setAgreement] = useState<ReferralAgreement>({
        isSigned: false,
        signedAt: null,
        documentTitle: "Referral Agreement",
        documentKey: "referral_agreement",
        content: null,
    });

    const [codeInfo, setCodeInfo] = useState<ReferralCodeInfo | null>(null);
    const [kpi, setKpi] = useState<ReferralKpi | null>(null);

    const [invitedUsers, setInvitedUsers] = useState<ReferralInvitedRow[]>([]);
    const [earningsRows, setEarningsRows] = useState<ReferralEarningRow[]>([]);

    const [agreementLoading, setAgreementLoading] = useState(false);

    const hydrateFromMe = useCallback((me: Awaited<ReturnType<typeof ReferralProgramApi.me>>) => {
        const isEnabled = me.settings?.is_enabled ?? true;
        setEnabled(isEnabled);
        if (!isEnabled) {
            setAgreement((prev) => ({
                ...prev,
                isSigned: false,
                signedAt: null,
                content: null,
            }));
            setCodeInfo(null);
            setKpi(null);
            setInvitedUsers([]);
            setEarningsRows([]);
            return;
        }

        const docTitle = me.agreement?.document?.title ?? "Referral Agreement";
        const docKey = me.agreement?.document?.key ?? "referral_agreement";
        const docFormat = me.agreement?.document?.format;

        setAgreement((prev) => ({
            ...prev,
            isSigned: !!me.agreement?.isSigned,
            signedAt: me.agreement?.signedAt ?? null,
            documentTitle: docTitle,
            documentKey: docKey,
            documentFormat: docFormat,
        }));

        if (me.profile?.code) {
            setCodeInfo({ code: me.profile.code });
        } else {
            setCodeInfo(null);
        }

        if (me.stats) {
            setKpi({
                invited: me.stats.invited,
                active: me.stats.active,
                qualified: me.stats.qualified,
                totalEarned: { amount: me.stats.totalEarned, currency: me.stats.currency },
                pending: { amount: me.stats.pending, currency: me.stats.currency },
                available: { amount: me.stats.balance, currency: me.stats.currency },
            });
        } else {
            setKpi(null);
        }

        // recentEarnings из /me кладём как initial, но полный список берём из /earnings
        const currency = me.stats?.currency ?? "UZS";
        const mapped = (me.recentEarnings ?? []).map<ReferralEarningRow>((t:any) => ({
            id: t.id,
            date: t.created_at,
            userMasked: maskId(t.related_user_id),
            amount: t.amount,
            currency,
            status: mapTxStatus(t.reason),
        }));
        setEarningsRows(mapped);
    }, []);

    const loadMe = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const me = await ReferralProgramApi.me();
            if (!mountedRef.current) return;
            hydrateFromMe(me);
        } catch (e: any) {
            if (!mountedRef.current) return;
            setError(e?.response?.data?.message || e?.message || "Failed to load referral program");
        } finally {
            if (!mountedRef.current) return;
            setLoading(false);
        }
    }, [hydrateFromMe]);

    const loadAgreementContent = useCallback(async () => {
        if (!enabled) return;
        if (agreement.content) return;
        setAgreementLoading(true);
        try {
            const doc = await ReferralProgramApi.agreement();
            if (!mountedRef.current) return;

            setAgreement((prev) => ({
                ...prev,
                documentTitle: doc.title,
                documentKey: doc.key,
                documentFormat: doc.format,
                content: doc.content,
            }));
        } catch {
            // не блокируем UI, просто оставим placeholder
        } finally {
            if (!mountedRef.current) return;
            setAgreementLoading(false);
        }
    }, [agreement.content, enabled]);

    const signAgreement = useCallback(async () => {
        setError(null);
        if (!enabled) return;
        try {
            const me = await ReferralProgramApi.sign();
            if (!mountedRef.current) return;
            hydrateFromMe(me);

            // после подписи — подгружаем списки
            const [inv, earn] = await Promise.all([
                ReferralProgramApi.invited({ limit: 50, offset: 0 }),
                ReferralProgramApi.earnings({ limit: 50, offset: 0 }),
            ]);
            if (!mountedRef.current) return;

            const currency = (me.stats?.currency ?? earn.currency ?? "UZS");

            setInvitedUsers(
                inv.items.map((r) => ({
                    id: r.id,
                    userMasked: maskId(r.referred_user_id),
                    joinedAt: r.created_at,
                    status: r.rewarded_at ? "QUALIFIED" : r.status, // REGISTERED | QUALIFIED
                    reward: null,
                    rewarded_at: r.rewarded_at || ''
                }))
            );

            setEarningsRows(
                earn.items.map((t) => ({
                    id: t.id,
                    date: t.created_at,
                    userMasked: maskId(t.related_user_id),
                    amount: t.amount,
                    currency,
                    status: mapTxStatus(t.reason),
                }))
            );
        } catch (e: any) {
            if (!mountedRef.current) return;
            setError(e?.response?.data?.message || e?.message || "Failed to sign agreement");
        }
    }, [enabled, hydrateFromMe]);

    // init
    useEffect(() => {
        mountedRef.current = true;
        void loadMe();
        return () => {
            mountedRef.current = false;
        };
    }, [loadMe]);

    // если подписано — догружаем invited/earnings один раз
    useEffect(() => {
        if (!enabled) return;
        if (!agreement.isSigned) return;

        let cancelled = false;
        (async () => {
            try {
                const [inv, earn] = await Promise.all([
                    ReferralProgramApi.invited({ limit: 50, offset: 0 }),
                    ReferralProgramApi.earnings({ limit: 50, offset: 0 }),
                ]);
                if (cancelled || !mountedRef.current) return;

                const currency = (kpi?.available.currency ?? earn.currency ?? "UZS");

                setInvitedUsers(
                    inv.items.map((r) => ({
                        id: r.id,
                        userMasked: maskId(r.referred_user_id),
                        joinedAt: r.created_at,
                        status: r.rewarded_at ? "QUALIFIED" : r.status,
                        reward: null,
                        rewarded_at: r.rewarded_at || ''
                    }))
                );

                setEarningsRows(
                    earn.items.map((t) => ({
                        id: t.id,
                        date: t.created_at,
                        userMasked: maskId(t.related_user_id),
                        amount: t.amount,
                        currency,
                        status: mapTxStatus(t.reason),
                    }))
                );
            } catch {
                // ignore background
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [enabled,agreement.isSigned, kpi?.available.currency]);

    const safeKpi = useMemo<ReferralKpi>(() => {
        return (
            kpi ?? {
                invited: 0,
                active: 0,
                qualified: 0,
                totalEarned: { amount: "0", currency: "UZS" },
                pending: { amount: "0", currency: "UZS" },
                available: { amount: "0", currency: "UZS" },
            }
        );
    }, [kpi]);

    return {
        loading,
        error,
        enabled,

        agreement,
        agreementLoading,

        codeInfo,
        kpi: safeKpi,

        invitedUsers,
        earningsRows,

        actions: {
            reload: loadMe,
            loadAgreementContent,
            signAgreement,
        },
    };
}
