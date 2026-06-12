import {
    Card, CardHeader, CardContent, Tabs, Tab, Box, Table, TableHead, TableRow, TableCell, TableBody,
} from "@mui/material";
import type { TopCountry } from "@/shared/api/dashboardApi";
import { useState } from "react";

function CountriesTable({ rows }: { rows: TopCountry[] }) {
    return (
        <Table size="medium">
            <TableHead>
                <TableRow sx={{ "& th": { fontWeight: 700, color: "text.secondary", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" } }}>
                    <TableCell>Страна</TableCell>
                    <TableCell align="right">Объявлений</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {rows.map((r, i) => (
                    <TableRow key={i} sx={{ "&:hover": { bgcolor: "action.hover" } }}>
                        <TableCell sx={{ py: 1.5, fontWeight: 500 }}>{r.country || "-"}</TableCell>
                        <TableCell align="right" sx={{ py: 1.5, fontWeight: 700 }}>{r.cnt}</TableCell>
                    </TableRow>
                ))}
                {rows.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={2} align="center" sx={{ py: 3, color: "text.secondary" }}>
                            Нет данных
                        </TableCell>
                    </TableRow>
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
        <Card
            variant="outlined"
            sx={{
                borderRadius: 4,
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.03)",
                },
            }}
        >
            <CardHeader
                title="Популярные страны"
                subheader="Рейтинг активности в разрезе стран отправления и назначения"
                titleTypographyProps={{ fontWeight: 800, fontSize: "1.1rem" }}
                subheaderTypographyProps={{ fontSize: "0.85rem", color: "text.secondary" }}
            />
            <CardContent sx={{ pt: 0 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    allowScrollButtonsMobile
                    sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        "& .MuiTab-root": {
                            fontWeight: 600,
                            textTransform: "none",
                            fontSize: "13px",
                            pb: 1.5,
                        }
                    }}
                >
                    <Tab label="Груз — Откуда" />
                    <Tab label="Груз — Куда" />
                    <Tab label="Транспорт — Отправление" />
                    <Tab label="Транспорт — Прибытие" />
                </Tabs>
                <Box sx={{ mt: 2, overflowX: "auto" }}>
                    {tab === 0 && <CountriesTable rows={cargoPickup} />}
                    {tab === 1 && <CountriesTable rows={cargoDrop} />}
                    {tab === 2 && <CountriesTable rows={transDep} />}
                    {tab === 3 && <CountriesTable rows={transArr} />}
                </Box>
            </CardContent>
        </Card>
    );
}
