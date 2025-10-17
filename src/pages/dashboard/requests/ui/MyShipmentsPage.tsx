import { useMemo, useState } from "react";
import {
    Box, Paper, Stack, Typography, Button, MenuItem, Select, type SelectChangeEvent, Pagination
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { FiSliders } from "react-icons/fi";
import ShipmentRow, { type ShipmentRowData } from "@/widgets/shipments/ShipmentRow";
import ShipmentsFilterDrawer, { type ShipmentsKind } from "@/widgets/shipments/ShipmentsFilterDrawer";


const mock: (ShipmentRowData & { kind: ShipmentsKind })[] = [
    { id: "row-1", kind: "cargo",   routeFrom: "Klaipėda", routeTo: "Chernihiv", distanceKm: 999,
        dates: { from: "02.02.25", to: "04.02.25" }, dims: "13.4m × 2.5m × 2.7m",
        typeTags: ["Tarp", "10t", "86m³"], badges: ["Sealed", "Pallets: 33", "Cargo info"],
        paymentType: "Cash", price: "200 000 UAH", pricePerKm: "132.45 UAH/km",
        repeats: 3, views: 12, timeAgo: "3 minutes ago",
        contact: { name: "Ivan Ivanovich", email: "mail@gmail.com", phone1: "+123 123 123", telegram: "@username" } },
    { id: "row-2", kind: "transport", routeFrom: "Warsaw", routeTo: "Kyiv", distanceKm: 680,
        dates: { from: "10.02.25", to: "12.02.25" }, dims: "7.2m × 2.4m × 2.6m",
        typeTags: ["Curtain", "5t"], badges: ["ADR"], paymentType: "Bank",
        price: "120 000 UAH", pricePerKm: "176.47 UAH/km", repeats: 1, views: 4, timeAgo: "12 minutes ago" },
    { id: "row-3", kind: "cargo",   routeFrom: "Vilnius", routeTo: "Riga", distanceKm: 295,
        dates: { from: "05.02.25", to: "06.02.25" }, dims: "8.0m × 2.45m × 2.6m",
        typeTags: ["Reefer", "8t", "60m³"], badges: ["Temperature control", "Sealed"],
        paymentType: "Card", price: "2 800 EUR", pricePerKm: "9.49 EUR/km", repeats: 0, views: 9, timeAgo: "1 hour ago" },
    { id: "row-4", kind: "transport", routeFrom: "Odessa", routeTo: "Lviv", distanceKm: 790,
        dates: { from: "14.02.25", to: "16.02.25" }, typeTags: ["Box", "3.5t"], badges: ["Express"],
        paymentType: "Cash", price: "85 000 UAH", pricePerKm: "107.59 UAH/km", repeats: 2, views: 6, timeAgo: "2 hours ago" },
    { id: "row-5", kind: "cargo", routeFrom: "Poznań", routeTo: "Berlin", distanceKm: 240,
        dates: { from: "08.02.25", to: "08.02.25" }, dims: "6.0m × 2.2m × 2.4m",
        typeTags: ["Van", "1.5t"], badges: ["Fragile"], paymentType: "Bank",
        price: "950 EUR", pricePerKm: "3.96 EUR/km", repeats: 0, views: 3, timeAgo: "yesterday" },
    { id: "row-6", kind: "transport", routeFrom: "Bucharest", routeTo: "Sofia", distanceKm: 360,
        dates: { from: "09.02.25", to: "10.02.25" }, dims: "13.6m × 2.45m × 2.7m",
        typeTags: ["Tautliner", "22t", "90m³"], badges: ["Pallets: 33"], paymentType: "Cash",
        price: "1 400 EUR", pricePerKm: "3.88 EUR/km", repeats: 5, views: 25, timeAgo: "2 days ago",
        contact: { name: "Andrei Popescu", phone1: "+40 700 111 222", phone2: "+40 700 333 444" } },
    { id: "row-7", kind: "transport", routeFrom: "Prague", routeTo: "Vienna", distanceKm: 330,
        dates: { from: "11.02.25", to: "12.02.25" }, typeTags: ["Flatbed", "20t"], badges: ["Oversize"],
        paymentType: "Bank", price: "1 150 EUR", pricePerKm: "3.48 EUR/km", repeats: 1, views: 7, timeAgo: "3 days ago" },
    { id: "row-8", kind: "cargo", routeFrom: "Tallinn", routeTo: "Helsinki", distanceKm: 90,
        dates: { from: "15.02.25", to: "15.02.25" }, dims: "5.0m × 2.1m × 2.3m",
        typeTags: ["Van", "1t"], badges: ["Ferry"], paymentType: "Card",
        price: "350 EUR", pricePerKm: "3.89 EUR/km", repeats: 0, views: 2, timeAgo: "a week ago" },
];

export default function MyShipmentsPage() {
    const [period, setPeriod] = useState("all");


    const [drawerOpen, setDrawerOpen] = useState(false);
    const [draftKind, setDraftKind] = useState<ShipmentsKind>("cargo");
    const [appliedKind, setAppliedKind] = useState<ShipmentsKind>("cargo");

    const handlePeriod = (e: SelectChangeEvent) => setPeriod(e.target.value);


    const list = useMemo(
        () => mock.filter((i) => i.kind === appliedKind),
        [appliedKind]
    );

    return (
        <Box>

            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "divider", mb: 2 }}>
                <Typography variant="h6">My shipments</Typography>
                <Typography variant="body2" color="text.secondary">
                    Your created orders with transport and cargo.
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
                    <Select variant="outlined" size="small" value={period} onChange={handlePeriod} sx={{ minWidth: 160 }}>
                        <MenuItem value="all">All time</MenuItem>
                        <MenuItem value="7d">Last 7 days</MenuItem>
                        <MenuItem value="30d">Last 30 days</MenuItem>
                        <MenuItem value="ytd">Year to date</MenuItem>
                    </Select>
                </Stack>
            </Stack>


            <Grid container spacing={1.5}>
                {list.map((item) => (
                    <Grid key={item.id} size={{xs:12}} >
                        <ShipmentRow
                            data={item}
                            onBookmark={(id) => console.log("bookmark", id)}
                            onMoreOpen={(id) => console.log("more", id)}
                        />
                    </Grid>
                ))}
            </Grid>


            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 2 }}>
                <Button variant="text" disabled>Back</Button>
                <Pagination count={10} page={1} siblingCount={1} />
                <Button variant="text">Next</Button>
            </Stack>


            <ShipmentsFilterDrawer
                open={drawerOpen}
                value={draftKind}
                onChange={setDraftKind}
                onClose={() => setDrawerOpen(false)}
                onReset={() => setDraftKind("cargo")}
                onApply={() => {
                    setAppliedKind(draftKind);
                    setDrawerOpen(false);
                }}
            />
        </Box>
    );
}
