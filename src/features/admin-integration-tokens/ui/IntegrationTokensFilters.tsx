import React from "react";
import {
    Autocomplete,
    Button,
    Card,
    CardContent,
    CardHeader,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";

import { getIntegrationOwnerLabel } from "@/entities/integration/lib/formatters";
import type { IntegrationFiltersState } from "../model/types";
import type { IntegrationStatus } from "@/entities/integration/model/types";
import type { AdminUser } from "@/shared/api/adminUsersApi";

type Props = {
    filters: IntegrationFiltersState;
    userOptions: AdminUser[];
    usersLoading: boolean;
    ownerInputValue: string;
    onOwnerInputChange: (value: string) => void;
    onFilterChange: <K extends keyof IntegrationFiltersState>(
        key: K,
        value: IntegrationFiltersState[K],
    ) => void;
    onApply: () => void;
    onReset: () => void;
};

export const IntegrationTokensFilters = React.memo(function IntegrationTokensFilters({
                                                                                         filters,
                                                                                         userOptions,
                                                                                         usersLoading,
                                                                                         ownerInputValue,
                                                                                         onOwnerInputChange,
                                                                                         onFilterChange,
                                                                                         onApply,
                                                                                         onReset,
                                                                                     }: Props) {
    return (
        <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardHeader title="Filters" />
            <CardContent>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <TextField
                            fullWidth
                            label="Search"
                            value={filters.search}
                            onChange={(e) => onFilterChange("search", e.target.value)}
                            placeholder="Name, company, token prefix"
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 3 }}>
                        <Autocomplete
                            options={userOptions}
                            value={filters.owner}
                            loading={usersLoading}
                            inputValue={ownerInputValue}
                            onInputChange={(_, value) => onOwnerInputChange(value)}
                            onChange={(_, value) => onFilterChange("owner", value)}
                            getOptionLabel={(option) => getIntegrationOwnerLabel(option)}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Owner"
                                    placeholder="Search user"
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                label="Status"
                                value={filters.status}
                                onChange={(e) =>
                                    onFilterChange(
                                        "status",
                                        e.target.value as "" | IntegrationStatus,
                                    )
                                }
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                <MenuItem value="REVOKED">REVOKED</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Activity</InputLabel>
                            <Select
                                label="Activity"
                                value={filters.is_active}
                                onChange={(e) =>
                                    onFilterChange(
                                        "is_active",
                                        e.target.value as "" | "true" | "false",
                                    )
                                }
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="true">Only active</MenuItem>
                                <MenuItem value="false">Only inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <Stack direction="row" spacing={1}>
                            <Button
                                fullWidth
                                variant="contained"
                                onClick={onApply}
                                sx={{ height: 56, textTransform: "none", borderRadius: 2 }}
                            >
                                Apply
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={onReset}
                                sx={{ height: 56, textTransform: "none", borderRadius: 2 }}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
});