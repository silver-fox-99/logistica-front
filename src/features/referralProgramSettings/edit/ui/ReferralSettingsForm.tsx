"use client";

import React, { forwardRef, useEffect, useImperativeHandle, useMemo } from "react";
import {
    Autocomplete,
    Divider,
    FormControl,
    FormControlLabel,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    TextField,
    Typography,
} from "@mui/material";
import { Controller, useForm, useWatch } from "react-hook-form";

import {
    ReferralRewardType,
    ReferralTrigger,
    type ReferralProgramSettings,
} from "@/entities/referralProgramSettings/model/types";
import type { DocumentEntity } from "@/entities/document/model/types";
import { safeJsonParseObject } from "@/shared/lib/json/safeJsonParseObject";
import type { UpsertReferralSettingsDto } from "../model/useReferralSettingsEditor";
import { formatIntWithDots } from "@/shared/lib/format/formatIntWithDots";

type LinkMode = "NONE" | "DOCUMENT_ID" | "DOCUMENT_KEY";

type FormValues = {
    is_enabled: boolean;
    trigger: ReferralTrigger;
    reward_type: ReferralRewardType;
    reward_value: string;
    reward_currency: string;
    linkMode: LinkMode;
    document_id: string | null;
    document_key: string | null;
    meta_json: string;
};

export type ReferralSettingsFormRef = {
    submit: () => void;
};

function docLabel(d: DocumentEntity) {
    const v = `v${d.version}`;
    const s = d.status;
    return `${d.key} • ${v} • ${s} — ${d.title}`;
}

type Props = {
    settings: ReferralProgramSettings[];
    activeId: string | null;
    onChangeActiveId: (id: string | null) => void;
    active: ReferralProgramSettings | null;

    documents: DocumentEntity[];
    documentKeys: string[];

    saving: boolean;
    setError: (message: string | null) => void;

    onSave: (dto: UpsertReferralSettingsDto) => Promise<void>;
};

const ReferralSettingsForm = forwardRef<ReferralSettingsFormRef, Props>(function ReferralSettingsForm(props, ref) {
    const { settings, activeId, onChangeActiveId, active, documents, documentKeys, setError, onSave } = props;

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            is_enabled: true,
            trigger: ReferralTrigger.PREMIUM_PURCHASE,
            reward_type: ReferralRewardType.FIXED,
            reward_value: "0",
            reward_currency: "UZS",
            linkMode: "NONE",
            document_id: null,
            document_key: null,
            meta_json: "{}",
        },
        mode: "onChange",
    });

    // точечные подписки — не заставляют ререндерить всё из-за любого поля
    const rewardType = useWatch({ control, name: "reward_type" });
    const linkMode = useWatch({ control, name: "linkMode" });
    const selectedDocId = useWatch({ control, name: "document_id" });
    const selectedDocKey = useWatch({ control, name: "document_key" });
    const rewardValue = useWatch({ control, name: "reward_value" });

    const selectedDoc = useMemo(() => {
        if (!selectedDocId) return null;
        return documents.find((d) => d.id === selectedDocId) ?? null;
    }, [documents, selectedDocId]);

    // для ориентира — показываем формат с точками, но не ломаем ввод (значение остаётся строкой)
    const rewardPreview = useMemo(() => {
        if (rewardType !== ReferralRewardType.FIXED) return null;
        const onlyDigits = (rewardValue ?? "").replace(/[^\d]/g, "");
        if (!onlyDigits) return "0";
        return formatIntWithDots(onlyDigits);
    }, [rewardType, rewardValue]);

    useEffect(() => {
        if (!active) {
            reset({
                is_enabled: true,
                trigger: ReferralTrigger.PREMIUM_PURCHASE,
                reward_type: ReferralRewardType.FIXED,
                reward_value: "0",
                reward_currency: "UZS",
                linkMode: "NONE",
                document_id: null,
                document_key: null,
                meta_json: "{}",
            });
            return;
        }

        const hasDocId = !!active.document?.id;
        const hasDocKey = !!active.document_key;
        const lm: LinkMode = hasDocId ? "DOCUMENT_ID" : hasDocKey ? "DOCUMENT_KEY" : "NONE";

        reset({
            is_enabled: active.is_enabled,
            trigger: active.trigger,
            reward_type: active.reward_type,
            reward_value: active.reward_value ?? "0",
            reward_currency: active.reward_currency ?? "UZS",
            linkMode: lm,
            document_id: active.document?.id ?? null,
            document_key: active.document_key ?? null,
            meta_json: JSON.stringify(active.meta ?? {}, null, 2),
        });
    }, [active, reset]);

    useEffect(() => {
        if (linkMode === "NONE") {
            setValue("document_id", null);
            setValue("document_key", null);
        } else if (linkMode === "DOCUMENT_ID") {
            setValue("document_key", null);
        } else if (linkMode === "DOCUMENT_KEY") {
            setValue("document_id", null);
        }
    }, [linkMode, setValue]);

    const submit = handleSubmit(async (values) => {
        setError(null);

        const metaRes = safeJsonParseObject(values.meta_json);
        if (!metaRes.ok) {
            setError(metaRes.error);
            return;
        }

        if (!/^\d+(\.\d+)?$/.test(values.reward_value)) {
            setError("Reward value must be a numeric string (e.g. 10 or 10.5)");
            return;
        }

        const dto: UpsertReferralSettingsDto = {
            is_enabled: values.is_enabled,
            trigger: values.trigger,
            reward_type: values.reward_type,
            reward_value: values.reward_value,
            reward_currency: values.reward_type === ReferralRewardType.FIXED ? (values.reward_currency || "UZS") : null,
            document_id: values.linkMode === "DOCUMENT_ID" ? values.document_id : null,
            document_key: values.linkMode === "DOCUMENT_KEY" ? values.document_key : null,
            meta: metaRes.data,
        };

        await onSave(dto);
    });

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    return (
        <Stack spacing={2}>
            {settings.length > 1 && (
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="active-settings-label">Active Settings</InputLabel>
                        <Select
                            labelId="active-settings-label"
                            label="Active Settings"
                            value={activeId ?? ""}
                            onChange={(e) => onChangeActiveId(String(e.target.value))}
                        >
                            {settings.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {s.trigger} • {s.is_enabled ? "Enabled" : "Disabled"}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
            )}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Controller
                    name="is_enabled"
                    control={control}
                    render={({ field }) => (
                        <FormControlLabel
                            control={<Switch checked={field.value} onChange={(_, v) => field.onChange(v)} />}
                            label="Enabled"
                        />
                    )}
                />

                <Controller
                    name="trigger"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="trigger-label">Trigger</InputLabel>
                            <Select labelId="trigger-label" label="Trigger" {...field}>
                                <MenuItem value={ReferralTrigger.PREMIUM_PURCHASE}>Premium Purchase</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Reward
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Controller
                    name="reward_type"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="reward-type-label">Reward Type</InputLabel>
                            <Select labelId="reward-type-label" label="Reward Type" {...field}>
                                <MenuItem value={ReferralRewardType.FIXED}>Fixed</MenuItem>
                                <MenuItem value={ReferralRewardType.PERCENT}>Percent</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />

                <Controller
                    name="reward_value"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            label="Reward Value"
                            placeholder={rewardType === ReferralRewardType.PERCENT ? "10.5" : "10000"}
                            {...field}
                            error={!!errors.reward_value}
                            helperText={
                                rewardType === ReferralRewardType.PERCENT
                                    ? "Percent value (e.g. 10.5)"
                                    : `Fixed amount (numeric string). Preview: ${rewardPreview ?? "0"}`
                            }
                        />
                    )}
                />

                <Controller
                    name="reward_currency"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            label="Currency"
                            disabled
                            placeholder="UZS"
                            {...field}
                            helperText={rewardType !== ReferralRewardType.FIXED ? "Not required for percent" : "e.g. UZS"}
                        />
                    )}
                />
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Agreement Document
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Controller
                    name="linkMode"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="link-mode-label">Link Mode</InputLabel>
                            <Select labelId="link-mode-label" label="Link Mode" {...field}>
                                <MenuItem value="NONE">No document</MenuItem>
                                <MenuItem value="DOCUMENT_ID">Link by document</MenuItem>
                                <MenuItem value="DOCUMENT_KEY">Link by key (latest published)</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />

                {linkMode === "DOCUMENT_ID" && (
                    <Autocomplete
                        fullWidth
                        options={documents}
                        value={selectedDoc}
                        onChange={(_, v) => setValue("document_id", v?.id ?? null, { shouldDirty: true })}
                        getOptionLabel={(o) => docLabel(o)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Document"
                                placeholder="Select a document..."
                                helperText="This will link settings to a specific document version"
                            />
                        )}
                    />
                )}

                {linkMode === "DOCUMENT_KEY" && (
                    <Autocomplete
                        fullWidth
                        options={documentKeys}
                        value={selectedDocKey ?? null}
                        onChange={(_, v) => setValue("document_key", v ?? null, { shouldDirty: true })}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Document Key"
                                placeholder="Select a document key..."
                                helperText='This will use the latest "PUBLISHED" document for the selected key'
                            />
                        )}
                    />
                )}
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Meta
            </Typography>

            <Controller
                name="meta_json"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Meta (JSON)"
                        multiline
                        minRows={6}
                        placeholder={`{\n  "example": true\n}`}
                    />
                )}
            />
        </Stack>
    );
});

export default React.memo(ReferralSettingsForm);
