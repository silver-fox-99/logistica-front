import {
    Card, CardHeader, CardContent, Tabs, Tab, Box, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import type { TopCountry } from "@/shared/api/dashboardApi";
import { useState } from "react";

function CountriesTable({ rows }: { rows: TopCountry[] }) {
    return (
        <Table size="small">
            <TableHead>
                <TableRow>
                    <TableCell>Страна</TableCell>
                    <TableCell align="right">Объявлений</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((r, i) => (
                    <TableRow key={i}>
                        <TableCell>{r.country || "-"}</TableCell>
                        <TableCell align="right">{r.cnt}</TableCell>
                    </TableRow>
                ))}
                {rows.length === 0 && (
                    <TableRow><TableCell colSpan={2}>Нет данных</TableCell></TableRow>
                )}
            </TableBody>
        </Table>
    );
}

export default function TopCountriesTabs({
                                             cargoPickup, cargoDrop, transDep, transArr,
                                         }: {
    cargoPickup: TopCountry[];
    cargoDrop: TopCountry[];
    transDep: TopCountry[];
    transArr: TopCountry[];
}) {
    const [tab, setTab] = useState(0);
    return (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
            <CardHeader title="Популярные страны" subheader="По роли в маршруте" />
            <CardContent sx={{ pt: 0 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
                    <Tab label="Груз — Откуда" />
                    <Tab label="Груз — Куда" />
                    <Tab label="Транспорт — Отправление" />
                    <Tab label="Транспорт — Прибытие" />
                </Tabs>
                <Box sx={{ mt: 2 }}>
                    {tab === 0 && <CountriesTable rows={cargoPickup} />}
                    {tab === 1 && <CountriesTable rows={cargoDrop} />}
                    {tab === 2 && <CountriesTable rows={transDep} />}
                    {tab === 3 && <CountriesTable rows={transArr} />}
                </Box>
            </CardContent>
        </Card>
    );
}
