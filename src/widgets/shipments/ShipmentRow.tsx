import { useState } from "react";
import {
    Box, Stack, Chip, Typography, IconButton, Button, Tooltip, Divider
} from "@mui/material";
import Grid from "@mui/material/Grid";
import {
    FiClock, FiMapPin, FiPackage, FiTruck, FiBookmark,
    FiRepeat, FiTrash2, FiEdit2, FiCopy, FiChevronDown, FiChevronUp, FiMail, FiUser, FiPhone
} from "react-icons/fi";

import type {ShipmentRowData, ShipmentsKind} from "@/entities/shipment/model/type";
import "./ShipmentRow.scss";

type Props = {
    data: ShipmentRowData;
    scope: "public" | "my";
    onBookmark?: (id: string) => void;
    onMoreOpen?: (id: string) => void;
    kind: ShipmentsKind;
    /** Экшены для scope="my" */
    onUp?: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete?: (id: string) => void;
    onCopy?: (id: string) => void;
};

export default function ShipmentRow({
                                        data, kind, onBookmark, onMoreOpen, scope, onUp, onEdit, onDelete, onCopy
                                    }: Props) {
    const [expanded, setExpanded] = useState(false);

    const openMore = () => {
        if (!expanded) onMoreOpen?.(data.id);
        setExpanded((s) => !s);
    };

    return (
        <Box
            sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}
            className="shipment-row"
        >
            <Grid container spacing={1.5} alignItems="center">
                {/* ЛЕВАЯ КОЛОНКА */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="nowrap">
                            <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0, flexShrink: 0 }}>
                                <FiMapPin />
                                <Tooltip title={data.routeFrom}>
                                    <Typography fontWeight={700} noWrap sx={{ maxWidth: { xs: 180, md: 300 } }}>
                                        {data.routeFrom}
                                    </Typography>
                                </Tooltip>
                            </Box>
                            <Typography color="text.secondary" sx={{ flexShrink: 0 }}>→</Typography>
                            <Box display="inline-flex" alignItems="center" gap={0.75} sx={{ minWidth: 0, flexShrink: 0 }}>
                                <FiMapPin />
                                <Tooltip title={data.routeTo}>
                                    <Typography fontWeight={700} noWrap sx={{ maxWidth: { xs: 180, md: 300 } }}>
                                        {data.routeTo}
                                    </Typography>
                                </Tooltip>
                            </Box>

                        </Stack>

                        {/* Тип карточки и даты */}
                        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                            <Chip
                                size="small"
                                icon={kind === "cargo" ? <FiPackage /> : <FiTruck />}
                                label={kind === "cargo" ? "Cargo" : "Transport"}
                                className={`shipment-row__chip ${kind === "cargo" ? "shipment-row__chip--cargo" : "shipment-row__chip--transport"}`}
                            />
                            <Chip
                                size="small"
                                icon={<FiClock />}
                                variant="outlined"
                                label={`${data.dates.from} – ${data.dates.to}`}
                                className="shipment-row__chip shipment-row__chip--dates"
                            />
                        </Stack>

                        <Stack spacing={1}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                {data.distanceKm > 0 && (
                                    <Chip
                                        size="small"
                                        color="primary"
                                        label={`${data.distanceKm} km`}
                                        className="shipment-row__chip shipment-row__chip--distance"
                                    />
                                )}
                                {data.dims && (
                                    <Chip
                                        size="small"
                                        variant="outlined"
                                        icon={<FiPackage />}
                                        label={data.dims}
                                        className="shipment-row__chip shipment-row__chip--dimensions"
                                    />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
                                {data.typeTags.map((t) => (
                                    <Chip
                                        key={t}
                                        size="small"
                                        variant="outlined"
                                        label={t}
                                        className="shipment-row__chip shipment-row__chip--type"
                                    />
                                ))}
                            </Stack>
                        </Stack>

                        {!!data.badges?.length && (
                            <Stack direction="row" spacing={1} flexWrap="wrap" className="shipment-row__badges">
                                {data.badges.map((b) => (
                                    <Chip
                                        key={b}
                                        size="small"
                                        label={b}
                                        className="shipment-row__chip shipment-row__chip--badge"
                                    />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Grid>

                {/* ПРАВАЯ КОЛОНКА */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack
                        direction={{ xs: "row", md: "column" }}
                        spacing={1}
                        alignItems={{ xs: "flex-start", md: "flex-end" }}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" justifyContent="flex-end">
                            {typeof data.repeats === "number" && data.repeats > 0 && (
                                <Chip
                                    size="small"
                                    label={`Repeats: ${data.repeats}`}
                                    className="shipment-row__chip shipment-row__chip--repeats"
                                />
                            )}
                            {typeof data.views === "number" && data.views > 0 && (
                                <Chip
                                    size="small"
                                    label={`Views: ${data.views}`}
                                    className="shipment-row__chip shipment-row__chip--views"
                                />
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                            {data.paymentType && (
                                <Chip
                                    size="small"
                                    color="success"
                                    label={data.paymentType}
                                    className="shipment-row__chip shipment-row__chip--payment"
                                />
                            )}
                            {data.price && (
                                <Chip
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    label={data.price}
                                    className="shipment-row__chip shipment-row__chip--price"
                                />
                            )}
                            {data.pricePerKm && (
                                <Typography variant="caption" color="text.secondary" className="shipment-row__price-per-km">
                                    {data.pricePerKm}
                                </Typography>
                            )}
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                            <Tooltip title="Save to favorites">
                                <IconButton onClick={() => onBookmark?.(data.id)}>
                                    <FiBookmark />
                                </IconButton>
                            </Tooltip>

                            <Button
                                size="small"
                                variant="contained"
                                onClick={openMore}
                                endIcon={expanded ? <FiChevronUp /> : <FiChevronDown />}
                                sx={{ textTransform: "none" }}
                            >
                                {expanded ? "Collapse" : "More"}
                            </Button>
                        </Stack>

                        {data.timeAgo && (
                            <Typography variant="caption" color="text.secondary">
                                {data.timeAgo}
                            </Typography>
                        )}
                    </Stack>
                </Grid>
            </Grid>

            {expanded && (
                <>
                    <Divider sx={{ my: 1.5 }} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                Контактная информация
                            </Typography>
                            <Stack spacing={1} color="text.secondary">
                                {data.contact?.name && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiUser />
                                        <Typography>{data.contact.name}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.email && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiMail />
                                        <Typography>{data.contact.email}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.phone1 && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone />
                                        <Typography>{data.contact.phone1}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.phone2 && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone />
                                        <Typography>{data.contact.phone2}</Typography>
                                    </Stack>
                                )}
                                {data.contactExtraPhone && (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <FiPhone />
                                        <Typography>Доп. телефон: {data.contactExtraPhone}</Typography>
                                    </Stack>
                                )}
                                {data.contact?.telegram && <Typography>{data.contact.telegram}</Typography>}
                            </Stack>
                        </Grid>

                        {/* Правая колонка - Детали заказа */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography variant="subtitle2" fontWeight={600} mb={1}>
                                Детали заказа
                            </Typography>
                            <Stack spacing={0.75} color="text.secondary">
                                {data.vehicleType && (
                                    <Typography variant="body2">
                                        <strong>Тип автомобиля:</strong> {data.vehicleType}
                                    </Typography>
                                )}
                                {data.cargoType && (
                                    <Typography variant="body2">
                                        <strong>Тип груза:</strong> {data.cargoType}
                                    </Typography>
                                )}
                                {data.loadType && (
                                    <Typography variant="body2">
                                        <strong>Тип загрузки:</strong> {data.loadType}
                                    </Typography>
                                )}
                                {data.carsCount != null && data.carsCount > 0 && (
                                    <Typography variant="body2">
                                        <strong>Количество автомобилей:</strong> {data.carsCount}
                                    </Typography>
                                )}
                                {data.palletsCount != null && data.palletsCount > 0 && (
                                    <Typography variant="body2">
                                        <strong>Количество паллет:</strong> {data.palletsCount}
                                    </Typography>
                                )}
                                {data.weightT != null && data.weightT > 0 && (
                                    <Typography variant="body2">
                                        <strong>Вес:</strong> {data.weightT} т
                                    </Typography>
                                )}
                                {data.volumeM3 != null && data.volumeM3 > 0 && (
                                    <Typography variant="body2">
                                        <strong>Объем:</strong> {data.volumeM3} м³
                                    </Typography>
                                )}
                                {data.allowPartialLoad != null && (
                                    <Typography variant="body2">
                                        <strong>Дозагрузка:</strong> {data.allowPartialLoad ? "Возможна" : "Невозможна"}
                                    </Typography>
                                )}
                                {data.paymentTerm && (
                                    <Typography variant="body2">
                                        <strong>Срок оплаты:</strong> {data.paymentTerm}
                                    </Typography>
                                )}
                                {data.bargain && (
                                    <Typography variant="body2">
                                        <strong>Торг:</strong> {data.bargain === "ALLOWED" ? "Возможен" : "Невозможен"}
                                    </Typography>
                                )}
                            </Stack>
                        </Grid>

                        {/* Дополнительная информация (примечания) */}
                        {data.note && (
                            <Grid size={{ xs: 12 }}>
                                <Typography variant="subtitle2" fontWeight={600} mb={0.5}>
                                    Дополнительная информация
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {data.note}
                                </Typography>
                            </Grid>
                        )}

                        {/* Кнопки действий для "my" scope */}
                        {scope === "my" && (
                            <Grid size={{ xs: 12 }}>
                                <Divider sx={{ my: 1 }} />
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    justifyContent={{ xs: "flex-start", md: "flex-end" }}
                                >
                                    <Tooltip title="Поднять вверх">
                                        <IconButton onClick={() => onUp?.(data.id)}>
                                            <FiRepeat />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Редактировать">
                                        <IconButton onClick={() => onEdit?.(data.id)}>
                                            <FiEdit2 />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Копировать">
                                        <IconButton onClick={() => onCopy?.(data.id)}>
                                            <FiCopy />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Удалить">
                                        <IconButton color="error" onClick={() => onDelete?.(data.id)}>
                                            <FiTrash2 />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </>
            )}
        </Box>
    );
}
