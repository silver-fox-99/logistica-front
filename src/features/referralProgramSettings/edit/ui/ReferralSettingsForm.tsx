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
import {
    ReferralTiersEditor,
    type TierFormValue
} from "@/features/referralProgramSettings/edit/ui/ReferralTiersEditor.tsx";

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
    tiers: TierFormValue[];
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

const TRIGGER_RU: Record<string, string> = {
    [ReferralTrigger.PREMIUM_PURCHASE]: "Покупка Premium",
};

const REWARD_TYPE_RU: Record<string, string> = {
    [ReferralRewardType.FIXED]: "Фиксированная сумма",
    [ReferralRewardType.PERCENT]: "Процент",
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
            tiers: [],
            meta_json: "{}",
        },
        mode: "onChange",
    });

    const rewardType = useWatch({ control, name: "reward_type" });
    const linkMode = useWatch({ control, name: "linkMode" });
    const rewardValue = useWatch({ control, name: "reward_value" });

    const showDocId = linkMode === "DOCUMENT_ID";
    const showDocKey = linkMode === "DOCUMENT_KEY";

    const docsReady = documents.length > 0;

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
                tiers: [],
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
            tiers: (active.tiers ?? []).map((t) => ({
                from: t.from ?? 0,
                to: t.to ?? null,
                reward_value: t.reward_value ?? "0",
            })),
        });

        requestAnimationFrame(() => {
            if (active.document?.id) {
                setValue("document_id", active.document.id, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                });
            }
            if (active.document_key) {
                setValue("document_key", active.document_key, {
                    shouldDirty: false,
                    shouldTouch: false,
                    shouldValidate: false,
                });
            }
        });
    }, [active?.id, active?.updated_at, docsReady, reset, setValue]);

    useEffect(() => {
        if (linkMode === "NONE") {
            setValue("document_id", null, { shouldDirty: true });
            setValue("document_key", null, { shouldDirty: true });
        }
    }, [linkMode, setValue]);

    function validateTiersClient(tiers: TierFormValue[]): string | null {
        if (!Array.isArray(tiers) || tiers.length === 0) return null;
        if (tiers[0].from !== 0) return 'First tier must start from "0".';

        for (let i = 0; i < tiers.length; i++) {
            const t = tiers[i];
            const isLast = i === tiers.length - 1;

            if (!Number.isInteger(t.from) || t.from < 0) return `Tier #${i + 1}: "From" must be an integer ≥ 0.`;

            if (t.to === null) {
                if (!isLast) return `Tier #${i + 1}: "To" can be empty only for the last tier.`;
            } else {
                if (!Number.isInteger(t.to) || t.to < 0) return `Tier #${i + 1}: "To" must be an integer ≥ 0.`;
                if (t.to < t.from) return `Tier #${i + 1}: "To" must be ≥ "From".`;
            }

            if (!/^\d+(\.\d+)?$/.test(t.reward_value ?? "")) {
                return `Tier #${i + 1}: reward must be numeric (e.g. 10 or 10.5).`;
            }

            if (i > 0) {
                const prev = tiers[i - 1];
                if (prev.to === null) return `Tier #${i}: open-ended tier must be the last tier.`;
                const expectedFrom = prev.to + 1;
                if (t.from !== expectedFrom) return `Tier #${i + 1}: "From" must be ${expectedFrom}.`;
            }
        }

        return null;
    }

    const submit = handleSubmit(async (values) => {
        setError(null);

        const metaRes = safeJsonParseObject(values.meta_json);
        if (!metaRes.ok) {
            setError(metaRes.error);
            return;
        }

        if (!/^\d+(\.\d+)?$/.test(values.reward_value)) {
            setError("Значение награды должно быть числом (например: 10 или 10.5)");
            return;
        }

        const tiersError = validateTiersClient(values.tiers);
        if (tiersError) {
            setError(tiersError);
            return;
        }

        const dto: UpsertReferralSettingsDto = {
            is_enabled: values.is_enabled,
            trigger: values.trigger,
            reward_type: values.reward_type,
            reward_value: values.reward_value,
            reward_currency: values.reward_type === ReferralRewardType.FIXED ? (values.reward_currency || "UZS") : null,
            meta: metaRes.data,
            document_id: values.linkMode === "DOCUMENT_ID" ? values.document_id : undefined,
            document_key: values.linkMode === "DOCUMENT_KEY" ? values.document_key : undefined,
            tiers: values.tiers.map((t) => ({
                from: t.from,
                to: t.to ?? null,
                reward_value: t.reward_value,
            })),
        };

        if (values.linkMode === "NONE") {
            dto.document_id = null;
            dto.document_key = null;
        }

        await onSave(dto);
    });

    useImperativeHandle(ref, () => ({ submit }), [submit]);

    return (
        <Stack spacing={2}>
            {settings.length > 1 && (
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id="active-settings-label">Активные настройки</InputLabel>
                        <Select
                            labelId="active-settings-label"
                            label="Активные настройки"
                            value={activeId ?? ""}
                            onChange={(e) => onChangeActiveId(String(e.target.value))}
                        >
                            {settings.map((s) => (
                                <MenuItem key={s.id} value={s.id}>
                                    {(TRIGGER_RU[s.trigger] ?? s.trigger)} • {s.is_enabled ? "Включено" : "Отключено"}
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
                            label="Включено"
                        />
                    )}
                />

                <Controller
                    name="trigger"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="trigger-label">Триггер</InputLabel>
                            <Select labelId="trigger-label" label="Триггер" {...field}>
                                <MenuItem value={ReferralTrigger.PREMIUM_PURCHASE}>
                                    {TRIGGER_RU[ReferralTrigger.PREMIUM_PURCHASE]}
                                </MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Награда
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Controller
                    name="reward_type"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="reward-type-label">Тип награды</InputLabel>
                            <Select labelId="reward-type-label" label="Тип награды" {...field}>
                                <MenuItem value={ReferralRewardType.FIXED}>
                                    {REWARD_TYPE_RU[ReferralRewardType.FIXED]}
                                </MenuItem>
                                <MenuItem value={ReferralRewardType.PERCENT}>
                                    {REWARD_TYPE_RU[ReferralRewardType.PERCENT]}
                                </MenuItem>
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
                            label="Размер награды"
                            placeholder={rewardType === ReferralRewardType.PERCENT ? "10.5" : "10000"}
                            {...field}
                            error={!!errors.reward_value}
                            helperText={ `Фиксированная сумма (число). Предпросмотр: ${rewardPreview ?? "0"}`}
                        />
                    )}
                />

                <Controller
                    name="reward_currency"
                    control={control}
                    render={({ field }) => (
                        <TextField
                            fullWidth
                            label="Валюта"
                            disabled
                            placeholder="UZS"
                            {...field}
                            helperText={rewardType !== ReferralRewardType.FIXED ? "Не требуется для процента" : "Например: UZS"}
                        />
                    )}
                />
            </Stack>

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Документ соглашения
            </Typography>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                <Controller
                    name="linkMode"
                    control={control}
                    render={({ field }) => (
                        <FormControl fullWidth>
                            <InputLabel id="link-mode-label">Способ привязки</InputLabel>
                            <Select labelId="link-mode-label" label="Способ привязки" {...field}>
                                <MenuItem value="NONE">Без документа</MenuItem>
                                <MenuItem value="DOCUMENT_ID">Привязать к документу</MenuItem>
                                <MenuItem value="DOCUMENT_KEY">Привязать по ключу (последний опубликованный)</MenuItem>
                            </Select>
                        </FormControl>
                    )}
                />

                <Controller
                    name="document_id"
                    control={control}
                    render={({ field }) => {
                        const valueObj = field.value ? documents.find((d) => d.id === field.value) ?? null : null;

                        return (
                            <Autocomplete
                                fullWidth
                                options={documents}
                                value={valueObj}
                                onChange={(_, v) => field.onChange(v?.id ?? null)}
                                isOptionEqualToValue={(opt, val) => opt.id === val.id}
                                getOptionLabel={(o) => docLabel(o)}
                                disabled={!showDocId}
                                sx={{ display: showDocId ? "block" : "none" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Документ"
                                        placeholder="Выберите документ..."
                                        helperText="Настройки будут привязаны к конкретной версии документа"
                                    />
                                )}
                            />
                        );
                    }}
                />

                <Controller
                    name="document_key"
                    control={control}
                    render={({ field }) => (
                        <Autocomplete
                            fullWidth
                            options={documentKeys}
                            value={field.value ?? null}
                            onChange={(_, v) => field.onChange(v ?? null)}
                            isOptionEqualToValue={(opt, val) => opt === val}
                            disabled={!showDocKey}
                            sx={{ display: showDocKey ? "block" : "none" }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Ключ документа"
                                    placeholder="Выберите ключ документа..."
                                    helperText='Будет использован последний документ со статусом "PUBLISHED" для выбранного ключа'
                                />
                            )}
                        />
                    )}
                />
            </Stack>

            <Divider />

            <ReferralTiersEditor
                control={control}
                rewardType={rewardType}
                setTopError={setError}
            />

            <Divider />

            <Typography variant="subtitle1" fontWeight={700}>
                Метаданные
            </Typography>

            <Controller
                name="meta_json"
                control={control}
                render={({ field }) => (
                    <TextField
                        {...field}
                        label="Метаданные (JSON)"
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
