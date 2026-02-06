import React, { memo } from "react";
import { Box } from "@mui/material";

type Props = {
    value: number;
    index: number;
    children: React.ReactNode;
};

function TabPanelBase({ value, index, children }: Props) {
    if (value !== index) return null;
    return <Box sx={{ pt: 2 }}>{children}</Box>;
}

export const TabPanel = memo(TabPanelBase);
