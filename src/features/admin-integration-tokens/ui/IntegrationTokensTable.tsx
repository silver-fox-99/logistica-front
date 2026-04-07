import React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    IconButton,
    Pagination,
    Stack,
    Switch,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    FiEdit2,
    FiKey,
    FiTrash2,
} from "react-icons/fi";

import type { IntegrationTokenItem } from "@/entities/integration/model/types";
import {
    formatIntegrationDate,
    getIntegrationOwnerLabel,
} from "@/entities/integration/lib/formatters";

type Props = {
    items: IntegrationTokenItem[];
    total: number;
    page: number;
    pages: number;
    loading: boolean;
    submitting: boolean;
    onPageChange: (page: number) => void;
    onEdit: (item: IntegrationTokenItem) => void;
    onRegenerate: (item: IntegrationTokenItem) => void;
    onToggle: (item: IntegrationTokenItem) => void;
    onDelete: (item: IntegrationTokenItem) => void;
};

export const IntegrationTokensTable = React.memo(function IntegrationTokensTable({
                                                                                     items,
                                                                                     total,
                                                                                     page,
                                                                                     pages,
                                                                                     loading,
                                                                                     submitting,
                                                                                     onPageChange,
                                                                                     onEdit,
                                                                                     onRegenerate,
                                                                                     onToggle,
                                                                                     onDelete,
                                                                                 }: Props) {
    return (
        <Card sx={{ borderRadius: 3 }}>
            <CardHeader
                title="Integration tokens"
                subheader={`Total: ${total}`}
                action={loading ? <CircularProgress size={22} /> : null}
            />

            <CardContent>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Owner</TableCell>
                                <TableCell>Company</TableCell>
                                <TableCell>Prefix</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Scopes</TableCell>
                                <TableCell>Usage</TableCell>
                                <TableCell>Expires</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {!loading && items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9}>
                                        <Typography variant="body2" color="text.secondary">
                                            No integration tokens found
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}

                            {items.map((item) => (
                                <TableRow key={item.id} hover>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={700}>
                                            {item.name}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>{getIntegrationOwnerLabel(item.user)}</TableCell>
                                    <TableCell>{item.company_name || "—"}</TableCell>
                                    <TableCell>{item.token_prefix}</TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                                            <Chip
                                                size="small"
                                                label={item.status}
                                                color={item.status === "ACTIVE" ? "success" : "default"}
                                            />
                                            <Chip
                                                size="small"
                                                label={item.is_active ? "Enabled" : "Disabled"}
                                                variant="outlined"
                                            />
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                                            {item.scopes?.length ? (
                                                item.scopes.map((scope) => (
                                                    <Chip key={scope} size="small" label={scope} />
                                                ))
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    —
                                                </Typography>
                                            )}
                                        </Stack>
                                    </TableCell>

                                    <TableCell>
                                        {item.usage_count}
                                        {item.usage_limit != null ? ` / ${item.usage_limit}` : " / ∞"}
                                    </TableCell>

                                    <TableCell>{formatIntegrationDate(item.expires_at)}</TableCell>

                                    <TableCell align="right">
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            justifyContent="flex-end"
                                            alignItems="center"
                                        >
                                            <Tooltip title="Edit">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onEdit(item)}
                                                        disabled={submitting}
                                                    >
                                                        <FiEdit2 />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>

                                            <Tooltip title="Regenerate">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onRegenerate(item)}
                                                        disabled={submitting}
                                                    >
                                                        <FiKey />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>

                                            <Tooltip title={item.is_active ? "Disable" : "Enable"}>
                                                <span>
                                                    <Switch
                                                        checked={item.is_active}
                                                        onChange={() => onToggle(item)}
                                                        disabled={submitting}
                                                    />
                                                </span>
                                            </Tooltip>

                                            <Tooltip title="Delete">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onDelete(item)}
                                                        disabled={submitting}
                                                    >
                                                        <FiTrash2 />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                        page={page}
                        count={pages}
                        onChange={(_, value) => onPageChange(value)}
                        color="primary"
                    />
                </Stack>
            </CardContent>
        </Card>
    );
});