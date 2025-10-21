import { List, ListItemButton, ListItemText, ListSubheader, IconButton, Stack, Tooltip } from "@mui/material";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import type { LookupGroup } from "@/shared/api/lookupsApi";

export function GroupList({
                              groups, currentId, onSelect, onCreate, onEdit, onDelete,
                          }: {
    groups: LookupGroup[];
    currentId?: string | null;
    onSelect: (g: LookupGroup) => void;
    onCreate: () => void;
    onEdit: (g: LookupGroup) => void;
    onDelete: (g: LookupGroup) => void;
}) {
    return (
        <List
            subheader={
                <ListSubheader component="div">
                    Groups
                    <Tooltip title="Create group">
                        <IconButton size="small" onClick={onCreate} sx={{ ml: 1 }}>
                            <FiPlus />
                        </IconButton>
                    </Tooltip>
                </ListSubheader>
            }
            sx={{ bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}
        >
            {groups.map(g => (
                <ListItemButton key={g.id} selected={Boolean(currentId && g.id === currentId)} onClick={() => onSelect(g)}>
                    <ListItemText primary={g.title} secondary={g.code} />
                    <Stack direction="row" spacing={0.5}>
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(g); }}><FiEdit2/></IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); onDelete(g); }}><FiTrash2/></IconButton>
                    </Stack>
                </ListItemButton>
            ))}
        </List>
    );
}
