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

import { DocumentFormat, DocumentStatus, type DocumentEntity, type CreateDocumentDto, type UpdateDocumentDto } from "@/entities/document/model/types";
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
            <DialogTitle>{isEdit ? `Edit version` : "Create new version"}</DialogTitle>

            <DialogContent>
                <Stack gap={2} sx={{ pt: 1 }}>
                    <RHFLookupAutocomplete
                        control={control}
                        name={"key"}
                        label="Document key"
                        placeholder="Select document key"
                        options={keyOptions}
                        getOptionLabel={(o: any) => o.label ?? o.slug}
                        disabled={isEdit}
                    />

                    <TextField
                        label="Title"
                        placeholder="Enter title"
                        fullWidth
                        {...register("title", { required: "Title is required" })}
                        error={!!formState.errors.title}
                        helperText={formState.errors.title?.message}
                    />

                    <Stack direction={{ xs: "column", sm: "row" }} gap={2}>
                        <FormControl fullWidth>
                            <InputLabel>Format</InputLabel>
                            <Select label="Format" defaultValue={DocumentFormat.MARKDOWN} {...register("format" as any)}>
                                <MenuItem value={DocumentFormat.MARKDOWN}>MARKDOWN</MenuItem>
                                <MenuItem value={DocumentFormat.HTML}>HTML</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select label="Status" defaultValue={DocumentStatus.DRAFT} {...register("status" as any)}>
                                <MenuItem value={DocumentStatus.DRAFT}>DRAFT</MenuItem>
                                <MenuItem value={DocumentStatus.ARCHIVED}>ARCHIVED</MenuItem>
                                <MenuItem value={DocumentStatus.PUBLISHED}>PUBLISHED</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    <TextField
                        label="Content"
                        placeholder="Enter document content"
                        fullWidth
                        multiline
                        minRows={10}
                        {...register("content", { required: "Content is required" })}
                        error={!!formState.errors.content}
                        helperText={formState.errors.content?.message}
                    />

                    <TextField
                        label="Selected key"
                        value={selectedKey}
                        fullWidth
                        disabled
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} variant="outlined">
                    Cancel
                </Button>
                <Button onClick={submit} variant="contained" disabled={!formState.isValid}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
});
