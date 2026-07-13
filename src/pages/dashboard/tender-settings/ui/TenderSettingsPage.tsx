import { useCallback, useEffect, useState } from "react";
import { Alert, Stack } from "@mui/material";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

import type { TenderWorkspaceContext } from "../../tender-workspace/model/types";
import { tendersApi } from "@/shared/api/tendersApi";

import type { TenderEditValues, BlacklistItem } from "../model/types";
import {
    buildTenderUpdatePayload,
    getTenderEditInitialValues,
} from "../model/helpers";

import { TenderSettingsHeader } from "./TenderSettingsHeader";
import { TenderBlacklistCard } from "./TenderBlacklistCard";
import { TenderCancelDialog } from "./TenderCancelDialog";
import { TenderEditDialog } from "./TenderEditDialog";

export default function TenderSettingsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { tender, reload, isOwner, ownerCode } =
        useOutletContext<TenderWorkspaceContext>();

    const [busy, setBusy] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const [blacklistPhone, setBlacklistPhone] = useState("");
    const [blacklistItems, setBlacklistItems] = useState<BlacklistItem[]>([]);
    const [blacklistLoading, setBlacklistLoading] = useState(false);

    const [editValues, setEditValues] = useState<TenderEditValues>(() =>
        getTenderEditInitialValues(tender),
    );

    const canEdit = !tender.has_bids && !tender.bids?.length;

    const loadBlacklist = useCallback(async () => {
        try {
            setBlacklistLoading(true);

            const res = await tendersApi.getBlacklistPhones();

            setBlacklistItems(res.data);
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("tenders.settings.toast.blacklistLoadError", "Failed to load blacklist"),
            );
        } finally {
            setBlacklistLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void loadBlacklist();
    }, [loadBlacklist]);

    const setEditField = (name: keyof TenderEditValues, value: string) => {
        setEditValues((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const cancelTender = async () => {
        try {
            setBusy(true);

            await tendersApi.cancel(tender.id);

            toast.success(t("tenders.settings.toast.canceled"));
            navigate("/dashboard/tenders/my");
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || t("tenders.settings.toast.cancelError"),
            );
        } finally {
            setBusy(false);
            setCancelOpen(false);
        }
    };

    const addBlacklistPhone = async () => {
        const phone = blacklistPhone.trim();

        if (!phone) {
            toast.warning(t("tenders.settings.validation.phone"));
            return;
        }

        try {
            setBusy(true);

            await tendersApi.addBlacklistPhone({
                phone,
                reason: "Tender blacklist",
            });

            toast.success(t("tenders.settings.toast.phoneAdded"));
            setBlacklistPhone("");
            await loadBlacklist();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || t("tenders.settings.toast.phoneError"),
            );
        } finally {
            setBusy(false);
        }
    };

    const removeBlacklistPhone = async (id: string) => {
        try {
            setBusy(true);

            await tendersApi.removeBlacklistPhone(id);

            toast.success(t("tenders.settings.toast.phoneRemoved", "Phone removed"));
            await loadBlacklist();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                t("tenders.settings.toast.phoneRemoveError", "Failed to remove phone"),
            );
        } finally {
            setBusy(false);
        }
    };

    const saveTender = async () => {
        if (!canEdit) return;

        if (!editValues.title.trim()) {
            toast.warning(t("tenders.settings.validation.title"));
            return;
        }

        if (!editValues.startPrice.trim()) {
            toast.warning(t("tenders.settings.validation.startPrice"));
            return;
        }

        if (!editValues.startsAt || !editValues.endsAt) {
            toast.warning(t("tenders.settings.validation.dates"));
            return;
        }

        if (editValues.endsAt <= editValues.startsAt) {
            toast.warning(t("tenders.settings.validation.dateOrder"));
            return;
        }

        try {
            setBusy(true);

            await tendersApi.update(tender.id, buildTenderUpdatePayload(editValues));

            toast.success(t("tenders.settings.toast.updated"));
            setEditOpen(false);
            await reload();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message || t("tenders.settings.toast.updateError"),
            );
        } finally {
            setBusy(false);
        }
    };

    if (!isOwner) {
        return (
            <Alert severity="info" sx={{ borderRadius: "8px" }}>
                {t("tenders.settings.participantReadOnly")}
            </Alert>
        );
    }

    return (
        <Stack spacing={2}>
            <TenderSettingsHeader
                tender={tender}
                canEdit={canEdit}
                ownerCode={ownerCode}
                onEdit={() => setEditOpen(true)}
                onCancel={() => setCancelOpen(true)}
            />

            <TenderBlacklistCard
                items={blacklistItems}
                phone={blacklistPhone}
                busy={busy}
                loading={blacklistLoading}
                onPhoneChange={setBlacklistPhone}
                onAdd={addBlacklistPhone}
                onRemove={removeBlacklistPhone}
            />

            <TenderCancelDialog
                open={cancelOpen}
                title={tender.title}
                busy={busy}
                onClose={() => setCancelOpen(false)}
                onConfirm={cancelTender}
            />

            <TenderEditDialog
                open={editOpen}
                values={editValues}
                busy={busy}
                canEdit={canEdit}
                onClose={() => setEditOpen(false)}
                onSave={saveTender}
                onChange={setEditField}
            />
        </Stack>
    );
}