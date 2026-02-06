import React from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { FiPlus, FiRefreshCw } from "react-icons/fi";

type Props = {
    title?: string;
    loading?: boolean;
    onCreate: () => void;
    onReload: () => void;
};

export const DocumentsToolbar = React.memo(function DocumentsToolbar({
                                                                         title = "Documents",
                                                                         loading,
                                                                         onCreate,
                                                                         onReload,
                                                                     }: Props) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
            <Stack direction="row" alignItems="center" gap={1}>
                <Typography variant="h5">{title}</Typography>
                {loading ? <CircularProgress size={18} /> : null}
            </Stack>

            <Stack direction="row" gap={1}>
                <Button variant="outlined" onClick={onReload} startIcon={<FiRefreshCw />}>
                    Refresh
                </Button>
                <Button variant="contained" onClick={onCreate} startIcon={<FiPlus />}>
                    Create version
                </Button>
            </Stack>
        </Box>
    );
});
