import { useCallback, useMemo, useState } from "react";
import { Alert, Box, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Stack, Typography } from "@mui/material";

import { useDocuments } from "@/features/documents/manage/model/useDocuments";
import { DocumentsToolbar } from "@/features/documents/manage/ui/DocumentsToolbar";
import { DocumentsTable } from "@/features/documents/manage/ui/DocumentsTable";
import { DocumentEditorDialog } from "@/features/documents/manage/ui/DocumentEditorDialog";
import { DeleteDocumentDialog } from "@/features/documents/manage/ui/DeleteDocumentDialog";

import { DocumentKey, DOCUMENT_KEY_LABELS } from "@/entities/document/model/constants";
import type { DocumentEntity, CreateDocumentDto, UpdateDocumentDto } from "@/entities/document/model/types";

export default function DocumentsPage() {
    const { groupedByKey, loading, error, reload, create, update, remove } = useDocuments();

    const keyList = useMemo(() => Object.values(DocumentKey), []);
    const [selectedKey, setSelectedKey] = useState<string>(keyList[0]);

    const versions = useMemo(() => groupedByKey.get(selectedKey) ?? [], [groupedByKey, selectedKey]);

    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
    const [editing, setEditing] = useState<DocumentEntity | null>(null);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState<DocumentEntity | null>(null);

    const openCreate = useCallback(() => {
        setEditorMode("create");
        setEditing(null);
        setEditorOpen(true);
    }, []);

    const openEdit = useCallback((doc: DocumentEntity) => {
        setEditorMode("edit");
        setEditing(doc);
        setEditorOpen(true);
    }, []);

    const openDelete = useCallback((doc: DocumentEntity) => {
        setDeleting(doc);
        setDeleteOpen(true);
    }, []);

    const submitEditor = useCallback(
        async (dto: CreateDocumentDto | UpdateDocumentDto) => {
            if (editorMode === "create") {
                await create(dto as CreateDocumentDto);
            } else if (editing) {
                await update(editing.id, dto as UpdateDocumentDto);
            }
        },
        [create, update, editorMode, editing],
    );

    const confirmDelete = useCallback(async () => {
        if (!deleting) return;
        await remove(deleting.id);
        setDeleteOpen(false);
        setDeleting(null);
    }, [remove, deleting]);

    return (
        <Stack gap={2}>
            <DocumentsToolbar loading={loading} onReload={reload} onCreate={openCreate} />

            {error ? <Alert severity="error">{error}</Alert> : null}

            <Card>
                <CardContent>
                    <Stack gap={2}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                            <Typography variant="h6">Document</Typography>

                            <FormControl size="small" sx={{ minWidth: 260 }}>
                                <InputLabel>Key</InputLabel>
                                <Select
                                    label="Key"
                                    value={selectedKey}
                                    onChange={(e) => setSelectedKey(String(e.target.value))}
                                >
                                    {keyList.map((k) => (
                                        <MenuItem key={k} value={k}>
                                            {DOCUMENT_KEY_LABELS[k as DocumentKey] ?? k}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Box>

                        <DocumentsTable items={versions} onEdit={openEdit} onDelete={openDelete} />
                    </Stack>
                </CardContent>
            </Card>

            <DocumentEditorDialog
                open={editorOpen}
                mode={editorMode}
                initial={editing}
                defaultKey={selectedKey}
                onClose={() => setEditorOpen(false)}
                onSubmit={submitEditor}
            />

            <DeleteDocumentDialog
                open={deleteOpen}
                doc={deleting}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
            />
        </Stack>
    );
}
