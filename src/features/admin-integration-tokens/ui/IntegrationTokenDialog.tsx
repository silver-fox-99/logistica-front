import React from "react";
import {
    Autocomplete,
    Button,
    Chip,
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
import Grid from "@mui/material/Grid";

import { AVAILABLE_INTEGRATION_SCOPES } from "@/entities/integration/model/constants";
import { getIntegrationOwnerLabel } from "@/entities/integration/lib/formatters";
import type { IntegrationScope } from "@/entities/integration/model/types";
import type { IntegrationTokenFormState } from "../model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

type Props = {
    open: boolean;
    title: string;
    form: IntegrationTokenFormState;
    loading: boolean;
    submitLabel: string;
    userOptions: AdminUser[];
    usersLoading: boolean;
    ownerInputValue: string;
    onOwnerInputChange: (value: string) => void;
    onFormChange: <K extends keyof IntegrationTokenFormState>(
        key: K,
        value: IntegrationTokenFormState[K],
    ) => void;
    onClose: () => void;
    onSubmit: () => void;
};

export const IntegrationTokenDialog = React.memo(function IntegrationTokenDialog({
                                                                                     open,
                                                                                     title,
                                                                                     form,
                                                                                     loading,
                                                                                     submitLabel,
                                                                                     userOptions,
                                                                                     usersLoading,
                                                                                     ownerInputValue,
                                                                                     onOwnerInputChange,
                                                                                     onFormChange,
                                                                                     onClose,
                                                                                     onSubmit,
                                                                                 }: Props) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{title}</DialogTitle>

            <DialogContent dividers>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <Autocomplete
                            options={userOptions}
                            value={form.owner}
                            loading={usersLoading}
                            inputValue={ownerInputValue}
                            onInputChange={(_, value) => onOwnerInputChange(value)}
                            onChange={(_, value) => {
                                onFormChange("owner", value);
                                onFormChange("user_id", value?.id ?? "");
                            }}
                            getOptionLabel={(option) => getIntegrationOwnerLabel(option)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Token owner"
                                    placeholder="Find user"
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={form.name}
                            onChange={(e) => onFormChange("name", e.target.value)}
                            placeholder="For example, ERP integration"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Company"
                            value={form.company_name}
                            onChange={(e) => onFormChange("company_name", e.target.value)}
                            placeholder="For example, Acme Logistics"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            label="Usage limit"
                            type="number"
                            value={form.usage_limit}
                            onChange={(e) => onFormChange("usage_limit", e.target.value)}
                            placeholder="Leave empty for unlimited"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                            fullWidth
                            type="datetime-local"
                            label="Expires at"
                            value={form.expires_at}
                            onChange={(e) => onFormChange("expires_at", e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <FormControl fullWidth>
                            <InputLabel>Scopes</InputLabel>
                            <Select
                                multiple
                                label="Scopes"
                                value={form.scopes}
                                onChange={(e) =>
                                    onFormChange("scopes", e.target.value as IntegrationScope[])
                                }
                                renderValue={(selected) => (
                                    <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                        {(selected as string[]).map((value) => (
                                            <Chip key={value} size="small" label={value} />
                                        ))}
                                    </Stack>
                                )}
                            >
                                {AVAILABLE_INTEGRATION_SCOPES.map((scope) => (
                                    <MenuItem key={scope} value={scope}>
                                        {scope}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={onSubmit} disabled={loading}>
                    {loading ? "Saving..." : submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
});