import React, { useEffect, useMemo } from "react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import { useForm } from "react-hook-form";

import {
    DocumentFormat,
    DocumentStatus,
    type DocumentEntity,
    type CreateDocumentDto,
    type UpdateDocumentDto,
} from "@/entities/document/model/types";
import { DocumentKey, DOCUMENT_KEY_LABELS } from "@/entities/document/model/constants";
import type { LookupOpt } from "@/shared/utils/lookupUtils";
import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";

type Mode = "create" | "edit";

type FormValues = {
    key: string;
    title: string;
    format: DocumentFormat;
    status: DocumentStatus;
    content: string;
};

type Props = {
    open: boolean;
    mode: Mode;
    initial?: DocumentEntity | null;
    defaultKey?: string;
    onClose: () => void;
    onSubmit: (dto: CreateDocumentDto | UpdateDocumentDto) => Promise<void>;
};

const FORMAT_RU: Record<string, string> = {
    [DocumentFormat.MARKDOWN]: "Markdown",
    [DocumentFormat.HTML]: "HTML",
};

const STATUS_RU: Record<string, string> = {
    [DocumentStatus.DRAFT]: "Черновик",
    [DocumentStatus.ARCHIVED]: "Архив",
    [DocumentStatus.PUBLISHED]: "Опубликован",
};

export const DocumentEditorDialog = React.memo(function DocumentEditorDialog({
                                                                                 open,
                                                                                 mode,
                                                                                 initial,
                                                                                 defaultKey,
                                                                                 onClose,
                                                                                 onSubmit,
                                                                             }: Props) {
    const keyOptions: LookupOpt[] = useMemo(() => {
        return Object.values(DocumentKey).map((k) => ({
            id: k,
            slug: k,
            label: DOCUMENT_KEY_LABELS[k as DocumentKey] ?? k,
        })) as any;
    }, []);

    const { control, register, handleSubmit, reset, watch, formState } = useForm<FormValues>({
        defaultValues: {
            key: defaultKey ?? initial?.key ?? DocumentKey.REFERRAL_PROGRAM,
            title: initial?.title ?? "",
            format: initial?.format ?? DocumentFormat.MARKDOWN,
            status: initial?.status ?? DocumentStatus.DRAFT,
            content: initial?.content ?? "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        if (!open) return;
        reset({
            key: defaultKey ?? initial?.key ?? DocumentKey.REFERRAL_PROGRAM,
            title: initial?.title ?? "",
            format: initial?.format ?? DocumentFormat.MARKDOWN,
            status: initial?.status ?? DocumentStatus.DRAFT,
            content: initial?.content ?? "",
        });
    }, [open, initial, defaultKey, reset]);

    const isEdit = mode === "edit";
    const selectedKey = watch("key");

    const submit = handleSubmit(async (v) => {
        if (isEdit) {
            const dto: UpdateDocumentDto = {
                title: v.title,
                format: v.format,
                status: v.status,
                content: v.content,
            };
            await onSubmit(dto);
            onClose();
            return;
        }

        const dto: CreateDocumentDto = {
            key: v.key,
            title: v.title,
            format: v.format,
            status: v.status,
            content: v.content,
        };

        await onSubmit(dto);
        onClose();
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{isEdit ? "Редактировать версию" : "Создать новую версию"}</DialogTitle>

            <DialogContent>
                <Stack gap={2} sx={{ pt: 1 }}>
                    <RHFLookupAutocomplete
                        control={control}
                        name={"key"}
                        label="Ключ документа"
                        placeholder="Выберите ключ документа"
                        options={keyOptions}
                        getOptionLabel={(o: any) => o.label ?? o.slug}
                        disabled={isEdit}
                    />

                    <TextField
                        label="Заголовок"
                        placeholder="Введите заголовок"
                        fullWidth
                        {...register("title", { required: "Заголовок обязателен" })}
                        error={!!formState.errors.title}
                        helperText={formState.errors.title?.message}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                        <FormControl fullWidth>
                            <InputLabel>Формат</InputLabel>
                            <Select label="Формат" defaultValue={DocumentFormat.MARKDOWN} {...register("format" as any)}>
                                <MenuItem value={DocumentFormat.MARKDOWN}>{FORMAT_RU[DocumentFormat.MARKDOWN]}</MenuItem>
                                <MenuItem value={DocumentFormat.HTML}>{FORMAT_RU[DocumentFormat.HTML]}</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Статус</InputLabel>
                            <Select label="Статус" defaultValue={DocumentStatus.DRAFT} {...register("status" as any)}>
                                <MenuItem value={DocumentStatus.DRAFT}>{STATUS_RU[DocumentStatus.DRAFT]}</MenuItem>
                                <MenuItem value={DocumentStatus.ARCHIVED}>{STATUS_RU[DocumentStatus.ARCHIVED]}</MenuItem>
                                <MenuItem value={DocumentStatus.PUBLISHED}>{STATUS_RU[DocumentStatus.PUBLISHED]}</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <TextField
                        label="Содержимое"
                        placeholder="Введите содержимое документа"
                        fullWidth
                        multiline
                        minRows={10}
                        {...register("content", { required: "Содержимое обязательно" })}
                        error={!!formState.errors.content}
                        helperText={formState.errors.content?.message}
                    />

                    <TextField label="Выбранный ключ" value={selectedKey} fullWidth disabled />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Отмена
                </Button>
                <Button onClick={submit} variant="contained" disabled={!formState.isValid}>
                    Сохранить
                </Button>
            </DialogActions>
        </Dialog>
    );
});
