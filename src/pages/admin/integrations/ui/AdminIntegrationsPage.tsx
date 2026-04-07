import {
    Alert,
    Box,
    Button,
    Stack,
    Typography,
} from "@mui/material";
import { FiPlus, FiRefreshCw } from "react-icons/fi";

import { useIntegrationTokensPage } from "@/features/admin-integration-tokens/model/useIntegrationTokensPage";
import { IntegrationTokensFilters } from "@/features/admin-integration-tokens/ui/IntegrationTokensFilters";
import { IntegrationTokensTable } from "@/features/admin-integration-tokens/ui/IntegrationTokensTable";
import { IntegrationTokenDialog } from "@/features/admin-integration-tokens/ui/IntegrationTokenDialog";
import { DeleteIntegrationTokenDialog } from "@/features/admin-integration-tokens/ui/DeleteIntegrationTokenDialog";
import { RevealedTokenAlert } from "@/features/admin-integration-tokens/ui/RevealedTokenAlert";

export default function AdminIntegrationsPage() {
    const { state, actions } = useIntegrationTokensPage();

    return (
        <Box>
            <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Box>
                    <Typography variant="h4" fontWeight={800}>
                        Интеграции
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Управление API-токенами для внешних интеграций компании.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        startIcon={<FiRefreshCw />}
                        onClick={() => void actions.reload()}
                        disabled={state.loading || state.submitting}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Обновить
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<FiPlus />}
                        onClick={actions.openCreateDialog}
                        disabled={state.submitting}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Создать токен
                    </Button>
                </Stack>
            </Stack>

            {state.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {state.error}
                </Alert>
            )}

            {state.success && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {state.success}
                </Alert>
            )}

            <RevealedTokenAlert
                token={state.revealedToken}
                onCopy={() => void actions.copyRevealedToken()}
            />

            <IntegrationTokensFilters
                filters={state.filters}
                userOptions={state.userOptions}
                usersLoading={state.usersLoading}
                ownerInputValue={state.filterOwnerInput}
                onOwnerInputChange={actions.setFilterOwnerInput}
                onFilterChange={actions.updateFilter}
                onApply={actions.applyFilters}
                onReset={actions.resetFilters}
            />

            <IntegrationTokensTable
                items={state.items}
                total={state.total}
                page={state.page}
                pages={state.pages}
                loading={state.loading}
                submitting={state.submitting}
                onPageChange={actions.setPage}
                onEdit={actions.openEditDialog}
                onRegenerate={(item) => void actions.regenerateToken(item)}
                onToggle={(item) => void actions.toggleToken(item)}
                onDelete={actions.openDeleteDialog}
            />

            <IntegrationTokenDialog
                open={state.createOpen}
                title="Создание токена интеграции"
                form={state.form}
                loading={state.submitting}
                submitLabel="Создать"
                userOptions={state.userOptions}
                usersLoading={state.usersLoading}
                ownerInputValue={state.formOwnerInput}
                onOwnerInputChange={actions.setFormOwnerInput}
                onFormChange={actions.updateForm}
                onClose={actions.closeAllDialogs}
                onSubmit={() => void actions.createToken()}
            />

            <IntegrationTokenDialog
                open={state.editOpen}
                title="Редактирование токена интеграции"
                form={state.form}
                loading={state.submitting}
                submitLabel="Сохранить"
                userOptions={state.userOptions}
                usersLoading={state.usersLoading}
                ownerInputValue={state.formOwnerInput}
                onOwnerInputChange={actions.setFormOwnerInput}
                onFormChange={actions.updateForm}
                onClose={actions.closeAllDialogs}
                onSubmit={() => void actions.updateToken()}
            />

            <DeleteIntegrationTokenDialog
                open={state.deleteOpen}
                item={state.selected}
                loading={state.submitting}
                onClose={actions.closeAllDialogs}
                onConfirm={() => void actions.deleteToken()}
            />
        </Box>
    );
}