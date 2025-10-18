
import { useMemo, useState } from "react";
import { Box, Paper, Stack, Typography, Button, MenuItem, Select, Pagination } from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiSliders } from "react-icons/fi";

import { useShipments } from "@/entities/shipment/model/useShipments";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import ShipmentRow from "@/widgets/shipments/ShipmentRow";
import ShipmentsFilterDrawer from "@/widgets/shipments/ShipmentsFilterDrawer";

type Props = {
    scope: "public" | "my";
};

export default function ShipmentsListPage({ scope }: Props) {
    const [period, setPeriod] = useState("all");
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draftKind, setDraftKind] = useState<ShipmentsKind>("cargo");
    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>("cargo");

    const [page, setPage] = useState(1);
    const limit = 10;

    const { items, pages, loading } = useShipments(appliedKind, scope, page, limit);

    const list = useMemo(() => items, [items]);

    return (
        <Box>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "divider", mb: 2 }}>
                <Typography variant="h6">
                    {scope === "my" ? "My shipments" : "Search shipments"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {scope === "my"
                        ? "Your created orders with transport and cargo."
                        : "Browse available cargo and transport offers."}
                </Typography>
            </Paper>

            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                <Button
                    variant="contained"
                    startIcon={<FiSliders />}
                    sx={{ textTransform: "none" }}
                    onClick={() => setDrawerOpen(true)}
                >
                    Filter
                </Button>

                <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" color="text.secondary">Period:</Typography>
                    <Select variant="outlined" size="small" value={period} onChange={(e) => setPeriod(e.target.value)} sx={{ minWidth: 160 }}>
                        <MenuItem value="all">All time</MenuItem>
                        <MenuItem value="7d">Last 7 days</MenuItem>
                        <MenuItem value="30d">Last 30 days</MenuItem>
                        <MenuItem value="ytd">Year to date</MenuItem>
                    </Select>
                </Stack>
            </Stack>

            <Grid container spacing={1.5}>
                {list.map((item) => (
                    <Grid key={item.id} size={{ xs: 12 }}>
                        <ShipmentRow
                            scope={scope}
                            data={item}
                            onBookmark={(id) => console.log("bookmark", id)}
                            onMoreOpen={(id) => console.log("more", id)}
                        />
                    </Grid>
                ))}
                {loading && (
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">Loading...</Typography>
                    </Grid>
                )}
            </Grid>

            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                <Button variant="text" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>Back</Button>
                <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} siblingCount={1} />
                <Button variant="text" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages}>Next</Button>
            </Stack>

            <ShipmentsFilterDrawer
                open={drawerOpen}
                value={draftKind}
                onChange={setDraftKind}
                onClose={() => setDrawerOpen(false)}
                onReset={() => setDraftKind("cargo")}
                onApply={() => {
                    setPage(1);
                    setDrawerOpen(false);
                    setAppliedKind(draftKind);
                }}
            />
        </Box>
    );
}
