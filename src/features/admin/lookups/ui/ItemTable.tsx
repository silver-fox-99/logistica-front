import Grid from "@mui/material/Grid";
import { Card, CardContent, Stack, Typography, IconButton, Tooltip, Chip, Button, TextField } from "@mui/material";
import { FiPlus, FiEdit2, FiTrash2, FiArrowDown, FiArrowUp, FiRefreshCw } from "react-icons/fi";
import type { LookupItem } from "@/shared/api/lookupsApi";

export function ItemTable({
                              groupTitle, items, onCreate, onEdit, onDelete, onMove, onReload, onQuickFilter,
                          }: {
    groupTitle?: string;
    items: LookupItem[];
    onCreate: () => void;
    onEdit: (it: LookupItem) => void;
    onDelete: (it: LookupItem) => void;
    onMove: (id: string, dir: "up" | "down") => void;
    onReload: () => void;
    onQuickFilter?: (text: string) => void;
}) {
    return (
        <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="h6" fontWeight={700}>{groupTitle ? `Элементы — ${groupTitle}` : "Элементы"}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <TextField size="small" placeholder="Быстрый фильтр…" onChange={(e) => onQuickFilter?.(e.target.value)} />
                        <Tooltip title="Обновить"><IconButton onClick={onReload}><FiRefreshCw/></IconButton></Tooltip>
                        <Button startIcon={<FiPlus/>} variant="contained" onClick={onCreate}>Новый элемент</Button>
                    </Stack>
                </Stack>
                <Grid container spacing={1}>
                    {items.map((it, idx) => (
                        <Grid key={it.id} size={{ xs: 12 }}>
                            <Stack direction={{ xs: "column", sm: "row" }}
                                   spacing={1} alignItems={{ sm: "center" }} justifyContent="space-between"
                                   sx={{ p: 1, borderRadius: 1, border: "1px solid", borderColor: "divider" }}>
                                <Stack spacing={0.25}>
                                    <Typography fontWeight={600}>{it.label}</Typography>
                                    <Typography variant="caption" color="text.secondary">слаг: {it.slug} • порядок: {it.sort_order}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip size="small" label={it.active ? "Активен" : "Неактивен"} color={it.active ? "success" : "default"} />
                                    <Tooltip title="Переместить вверх">
                                        <span><IconButton size="small" disabled={idx === 0} onClick={() => onMove(it.id, "up")}><FiArrowUp/></IconButton></span>
                                    </Tooltip>
                                    <Tooltip title="Переместить вниз">
                                        <span><IconButton size="small" disabled={idx === items.length - 1} onClick={() => onMove(it.id, "down")}><FiArrowDown/></IconButton></span>
                                    </Tooltip>
                                    <IconButton size="small" onClick={() => onEdit(it)}><FiEdit2/></IconButton>
                                    <IconButton size="small" color="error" onClick={() => onDelete(it)}><FiTrash2/></IconButton>
                                </Stack>
                            </Stack>
                        </Grid>
                    ))}
                    {!items.length && (
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="body2" color="text.secondary">Элементы не найдены</Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
