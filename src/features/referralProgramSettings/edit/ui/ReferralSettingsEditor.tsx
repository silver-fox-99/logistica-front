import { useMemo, useRef } from "react";
import { Alert, Box, Button, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { FiAward, FiRefreshCw, FiSave, FiTrash2 } from "react-icons/fi";
import ReferralSettingsForm, { type ReferralSettingsFormRef } from "./ReferralSettingsForm";
import DeleteSettingsDialog from "./DeleteSettingsDialog";
import { useReferralSettingsEditor } from "../model/useReferralSettingsEditor";

export default function ReferralSettingsEditor() {
    const {
        loading,
        saving,
        error,
        setError,

        settings,
        activeId,
        setActiveId,
        active,

        documents,
        documentKeys,

        deleteOpen,
        openDelete,
        closeDelete,

        loadAll,
        save,
        removeActive,
    } = useReferralSettingsEditor();

    const formRef = useRef<ReferralSettingsFormRef | null>(null);
    const canDelete = useMemo(() => !!active?.id, [active?.id]);

    if (loading) {
        return (
            <Box sx={{ p: 0 }}>
                <Stack direction="row" alignItems="center" gap={1.5}>
                    <CircularProgress size={20} />
                    <Typography>Загрузка настроек реферальной программы...</Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <Box>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2} sx={{ mb: 2 }}>
                <Stack direction="row" alignItems="center" gap={1.25}>
                    <FiAward size={22} />
                    <Typography variant="h5" fontWeight={700}>
                        Настройки реферальной программы
                    </Typography>
                </Stack>

                <Stack direction="row" gap={1}>
                    <Button
                        variant="outlined"
                        startIcon={<FiRefreshCw />}
                        onClick={() => void loadAll()}
                        disabled={saving}
                    >
                        Обновить
                    </Button>

                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<FiTrash2 />}
                        onClick={openDelete}
                        disabled={!canDelete || saving}
                    >
                        Удалить
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={saving ? <CircularProgress size={16} /> : <FiSave />}
                        onClick={() => formRef.current?.submit()}
                        disabled={saving}
                    >
                        Сохранить
                    </Button>
                </Stack>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper sx={{ p: 2.25, borderRadius: 3 }}>
                <ReferralSettingsForm
                    ref={formRef}
                    settings={settings}
                    activeId={activeId}
                    onChangeActiveId={setActiveId}
                    active={active}
                    documents={documents}
                    documentKeys={documentKeys}
                    saving={saving}
                    setError={setError}
                    onSave={save}
                />
            </Paper>

            <DeleteSettingsDialog
                open={deleteOpen}
                onClose={closeDelete}
                onConfirm={() => void removeActive()}
                saving={saving}
            />
        </Box>
    );
}
