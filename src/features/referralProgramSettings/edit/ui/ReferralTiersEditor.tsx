import { useMemo } from "react";
import { Box, Button, IconButton, Stack, TextField, Typography } from "@mui/material";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { Controller, useFieldArray, useWatch, type Control } from "react-hook-form";
import type { ReferralRewardType } from "@/entities/referralProgramSettings/model/types";
import { formatIntWithDots } from "@/shared/lib/format/formatIntWithDots";

export type TierFormValue = {
    from: number;
    to: number | null;
    reward_value: string;
};

type Props<TForm extends { tiers: TierFormValue[] }> = {
    control: Control<TForm>;
    rewardType: ReferralRewardType;
    setTopError: (msg: string | null) => void;
};

function parseOptionalInt(raw: string): number | null {
    const s = raw.trim();
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    return Math.trunc(n);
}

function isNumericString(v: string) {
    return /^\d+(\.\d+)?$/.test(v);
}

export function ReferralTiersEditor<TForm extends { tiers: TierFormValue[] }>(props: Props<TForm>) {
    const { control, rewardType, setTopError } = props;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "tiers" as any,
    });

    const tiers = useWatch({ control, name: "tiers" as any }) as TierFormValue[] | undefined;

    const issues = useMemo(() => {
        const t = tiers ?? [];
        const out: Array<{ from?: string; to?: string; reward?: string; row?: string }> = [];

        if (t.length === 0) return out;

        for (let i = 0; i < t.length; i++) {
            const cur = t[i];
            const isLast = i === t.length - 1;

            const rowErr: any = {};

            if (i === 0 && cur.from !== 0) rowErr.from = 'Первый тир должен начинаться с "0".';
            if (cur.from < 0 || !Number.isInteger(cur.from)) rowErr.from = '"От" должно быть целым числом ≥ 0.';

            if (cur.to === null) {
                if (!isLast) rowErr.to = '"До" может быть пустым только у последнего тира.';
            } else {
                if (!Number.isInteger(cur.to) || cur.to < 0) rowErr.to = '"До" должно быть целым числом ≥ 0.';
                else if (cur.to < cur.from) rowErr.to = '"До" должно быть ≥ "От".';
            }

            if (!isNumericString(cur.reward_value ?? "")) {
                rowErr.reward = 'Награда должна быть числом (например: "10" или "10.5").';
            }

            if (i > 0) {
                const prev = t[i - 1];
                if (prev.to === null) {
                    rowErr.row = "Нельзя добавлять тиры после безлимитного тира.";
                } else {
                    const expectedFrom = prev.to + 1;
                    if (cur.from !== expectedFrom) {
                        rowErr.from = `Этот тир должен начинаться с ${expectedFrom} (предыдущий "До" + 1).`;
                    }
                }
            }

            out.push(rowErr);
        }

        return out;
    }, [tiers]);

    const canAdd = useMemo(() => {
        const t = tiers ?? [];
        if (t.length === 0) return true;
        const last = t[t.length - 1];
        // если последний open-ended — добавлять нельзя
        return last.to !== null;
    }, [tiers]);

    const addTier = () => {
        setTopError(null);

        const t = tiers ?? [];
        if (t.length === 0) {
            append({ from: 0, to: null, reward_value: "0" } as any);
            return;
        }

        const last = t[t.length - 1];
        if (last.to === null) {
            setTopError('Чтобы добавить новый тир, укажите конечное значение "До" для последнего тира.');
            return;
        }

        append({ from: last.to + 1, to: null, reward_value: "0" } as any);
    };

    return (
        <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                <Typography variant="subtitle1" fontWeight={700}>
                    Тиры регистрации
                </Typography>

                <Button
                    variant="outlined"
                    startIcon={<FiPlus />}
                    onClick={addTier}
                    disabled={!canAdd}
                    title={!canAdd ? 'Чтобы добавить новый тир, укажите "До" у последнего тира.' : undefined}
                >
                    Добавить тир
                </Button>
            </Stack>

            {fields.length === 0 && (
                <Box>
                    <Typography variant="body2" color="text.secondary">
                        Тиры не настроены (опционально). Если хотите использовать тиры — добавьте хотя бы один. Первый тир должен начинаться с 0.
                    </Typography>
                </Box>
            )}

            <Stack spacing={1.25}>
                {fields.map((f, idx) => {
                    const rowIssues = issues[idx] ?? {};
                    const isLast = idx === fields.length - 1;

                    const rewardPreview =
                        rewardType === "FIXED"
                            ? formatIntWithDots(String((tiers?.[idx]?.reward_value ?? "").replace(/[^\d]/g, "") || "0"))
                            : null;

                    return (
                        <Stack
                            key={f.id}
                            direction={{ xs: "column", md: "row" }}
                            spacing={2}
                            alignItems={{ xs: "stretch", md: "flex-start" }}
                        >
                            <Controller
                                name={`tiers.${idx}.from` as any}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        type="number"
                                        label="От"
                                        fullWidth
                                        disabled={idx === 0} // первый from фиксируем как 0
                                        value={field.value ?? 0}
                                        onChange={(e) => field.onChange(Number(e.target.value))}
                                        error={!!rowIssues.from}
                                        helperText={rowIssues.from ?? (idx === 0 ? 'Должно быть "0".' : 'Должно быть "предыдущий До + 1".')}
                                        inputProps={{ min: 0, step: 1 }}
                                    />
                                )}
                            />

                            <Controller
                                name={`tiers.${idx}.to` as any}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        type="number"
                                        label="До"
                                        fullWidth
                                        value={field.value === null ? "" : String(field.value)}
                                        onChange={(e) => field.onChange(parseOptionalInt(e.target.value))}
                                        error={!!rowIssues.to}
                                        helperText={
                                            rowIssues.to ??
                                            (isLast ? 'Оставьте пустым для "Без ограничений" (только в последнем тире).' : "Обязательно.")
                                        }
                                        inputProps={{ min: 0, step: 1 }}
                                    />
                                )}
                            />

                            <Controller
                                name={`tiers.${idx}.reward_value` as any}
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        {...field}
                                        fullWidth
                                        label="Награда в тире"
                                        placeholder={rewardType === "PERCENT" ? "10.5" : "10000"}
                                        error={!!rowIssues.reward}
                                        helperText={
                                            rowIssues.reward ??
                                            (rewardType === "PERCENT"
                                                ? 'Процент (например: "10.5").'
                                                : `Фиксированная сумма. Предпросмотр: ${rewardPreview ?? "0"}`)
                                        }
                                    />
                                )}
                            />

                            <Stack direction="row" justifyContent="flex-end">
                                <IconButton
                                    color="error"
                                    onClick={() => remove(idx)}
                                    aria-label="Удалить тир"
                                >
                                    <FiTrash2 />
                                </IconButton>
                            </Stack>
                        </Stack>
                    );
                })}
            </Stack>
        </Stack>
    );
}