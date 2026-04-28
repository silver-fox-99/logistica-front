import { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    Stack,
    Typography,
    Button,
    Divider,
    TextField,
    Switch,
    ToggleButton,
    ToggleButtonGroup,
    FormControlLabel,
    Collapse,
} from "@mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiArrowRight, FiMap } from "react-icons/fi";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters, LocationFilterPlaceType } from "@/widgets/public/PublicFiltersDrawer";

import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";

import { RHFIdMultiAutocomplete } from "@/shared/ui/lookup/RHFIdMultiAutocomplete";
import { RHFLocationAutocomplete } from "@/shared/ui/lookup/RHFLocationAutocomplete";
import type { MapsLocationSuggestion } from "@/entities/maps/model/types";

import { ShipmentFilterMapPreview } from "@/widgets/shipments/ShipmentFilterMapPreview";

type FormValues = PublicFilters & {
    kind: ShipmentsKind;
};

type Props = {
    open: boolean;
    initialKind: ShipmentsKind;
    initialFilters: PublicFilters;
    onClose: () => void;
    onApply: (kind: ShipmentsKind, filters: PublicFilters) => void;
};

const MAX_VEHICLES = 5;

const digitsOnly = (value: string) => value.replace(/\D/g, "");

function normalizeNumber(value: string) {
    const raw = digitsOnly(value);
    return raw === "" ? undefined : Number(raw);
}

function normalizeFilters(filters: PublicFilters): PublicFilters {
    const out: PublicFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;

        (out as any)[key] = value;
    });

    return out;
}

function toNumberOrUndefined(value: unknown) {
    const num = Number(value);
    return Number.isFinite(num) ? num : undefined;
}

function getLocationLat(location: MapsLocationSuggestion | null) {
    return toNumberOrUndefined((location as any)?.lat ?? (location as any)?.latitude);
}

function getLocationLon(location: MapsLocationSuggestion | null) {
    return toNumberOrUndefined(
        (location as any)?.lon ?? (location as any)?.lng ?? (location as any)?.longitude,
    );
}

function getPlaceType(location: MapsLocationSuggestion | null): LocationFilterPlaceType {
    if (!location) return "unknown";

    const rawType =
        (location as any).place_type ||
        (location as any).type ||
        (location as any).osm_type ||
        "";

    const value = String(rawType).toLowerCase();

    if (value.includes("country")) return "country";
    if (value.includes("region") || value.includes("state") || value.includes("province")) return "region";
    if (value.includes("city") || value.includes("town") || value.includes("village")) return "city";
    if (value.includes("address") || value.includes("house") || value.includes("road")) return "address";

    if (location.city) return "city";
    if (location.region) return "region";
    if (location.country) return "country";

    return "unknown";
}

export function ShipmentsFilterDrawerForm({
                                              open,
                                              initialKind,
                                              initialFilters,
                                              onClose,
                                              onApply,
                                          }: Props) {
    const { t } = useTranslation();
    const user = useUserStore((s) => s.user);

    const { lookups } = useInitStore();
    const { getLocalizedLabel } = useLocalizedLookup();

    const [mapOpen, setMapOpen] = useState(false);

    const { control, reset, handleSubmit, setValue, getValues } = useForm<FormValues>({
        defaultValues: {
            kind: initialKind,
            ...(initialFilters as any),
        },
    });

    const watched = useWatch({ control });

    useEffect(() => {
        if (!open) return;

        reset({
            kind: initialKind,
            ...(initialFilters as any),
        });

        setMapOpen(false);
    }, [open, initialKind, initialFilters, reset]);

    const vehicleOptions = useMemo(() => {
        return (lookups?.vehicleType || []).map((item: any) => ({
            id: item.slug,
            label: getLocalizedLabel(item),
        }));
    }, [lookups?.vehicleType, getLocalizedLabel]);

    const hasMapPoints = Boolean(
        (typeof watched.pickup_lat === "number" && typeof watched.pickup_lon === "number") ||
        (typeof watched.dropoff_lat === "number" && typeof watched.dropoff_lon === "number"),
    );

    const clearPickupStructuredLocation = () => {
        setValue("pickup_country", undefined, { shouldDirty: true });
        setValue("pickup_region", undefined, { shouldDirty: true });
        setValue("pickup_city", undefined, { shouldDirty: true });
        setValue("pickup_lat", undefined, { shouldDirty: true });
        setValue("pickup_lon", undefined, { shouldDirty: true });
        setValue("pickup_place_type", undefined, { shouldDirty: true });
    };

    const clearDropoffStructuredLocation = () => {
        setValue("dropoff_country", undefined, { shouldDirty: true });
        setValue("dropoff_region", undefined, { shouldDirty: true });
        setValue("dropoff_city", undefined, { shouldDirty: true });
        setValue("dropoff_lat", undefined, { shouldDirty: true });
        setValue("dropoff_lon", undefined, { shouldDirty: true });
        setValue("dropoff_place_type", undefined, { shouldDirty: true });
    };

    const handlePickupLocationSelect = (location: MapsLocationSuggestion | null, label: string) => {
        setValue("pickup_location_label", label || undefined, { shouldDirty: true });

        if (!location) {
            clearPickupStructuredLocation();
            return;
        }

        setValue("pickup_country", location.country || undefined, { shouldDirty: true });
        setValue("pickup_region", location.region || undefined, { shouldDirty: true });
        setValue("pickup_city", location.city || undefined, { shouldDirty: true });
        setValue("pickup_lat", getLocationLat(location), { shouldDirty: true });
        setValue("pickup_lon", getLocationLon(location), { shouldDirty: true });
        setValue("pickup_place_type", getPlaceType(location), { shouldDirty: true });
    };

    const handleDropoffLocationSelect = (location: MapsLocationSuggestion | null, label: string) => {
        setValue("dropoff_location_label", label || undefined, { shouldDirty: true });

        if (!location) {
            clearDropoffStructuredLocation();
            return;
        }

        setValue("dropoff_country", location.country || undefined, { shouldDirty: true });
        setValue("dropoff_region", location.region || undefined, { shouldDirty: true });
        setValue("dropoff_city", location.city || undefined, { shouldDirty: true });
        setValue("dropoff_lat", getLocationLat(location), { shouldDirty: true });
        setValue("dropoff_lon", getLocationLon(location), { shouldDirty: true });
        setValue("dropoff_place_type", getPlaceType(location), { shouldDirty: true });
    };

    const submit = handleSubmit((values) => {
        const { kind, ...filters } = values;
        onApply(kind, normalizeFilters(filters));
    });

    const handleReset = () => {
        const currentKind = getValues("kind");

        reset({
            kind: currentKind,
        } as FormValues);

        setMapOpen(false);
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose} ModalProps={{ keepMounted: true }}>
            <Box sx={{ width: { xs: "100vw", sm: 520 }, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ p: 2 }}>
                    <Stack spacing={1.5}>
                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {t("shipments.filters.title", { defaultValue: "Filters" })}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    {t("shipments.filters.searchLabel", {
                                        defaultValue: "Refine your search results.",
                                    })}
                                </Typography>
                            </Box>

                            <Controller
                                control={control}
                                name="kind"
                                render={({ field }) => (
                                    <ToggleButtonGroup
                                        exclusive
                                        size="small"
                                        value={field.value}
                                        onChange={(_, value: ShipmentsKind | null) => {
                                            if (value) field.onChange(value);
                                        }}
                                        sx={{
                                            flexShrink: 0,
                                            "& .MuiToggleButton-root": {
                                                px: 1.5,
                                                textTransform: "none",
                                            },
                                        }}
                                    >
                                        <ToggleButton value="cargo">
                                            {t("shipments.filters.cargo", { defaultValue: "Cargo" })}
                                        </ToggleButton>
                                        <ToggleButton value="transport">
                                            {t("shipments.filters.transport", { defaultValue: "Transport" })}
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                )}
                            />
                        </Stack>

                        {user && (
                            <Controller
                                control={control}
                                name="favorites_only"
                                render={({ field }) => (
                                    <FormControlLabel
                                        sx={{ m: 0 }}
                                        control={
                                            <Switch
                                                checked={!!field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                            />
                                        }
                                        label={t("shipments.filters.favorites", {
                                            defaultValue: "Favorites only",
                                        })}
                                    />
                                )}
                            />
                        )}
                    </Stack>
                </Box>

                <Divider />

                <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                    <Stack spacing={2}>
                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.route", { defaultValue: "Route" })}
                            </Typography>

                            <Stack
                                direction={{ xs: "column", sm: "row" }}
                                spacing={1}
                                alignItems={{ xs: "stretch", sm: "center" }}
                            >
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <RHFLocationAutocomplete
                                        control={control}
                                        name="pickup_location_label"
                                        label={t("shipments.filters.pickupLocation", {
                                            defaultValue: "Pickup location",
                                        })}
                                        placeholder={t("shipments.filters.locationPlaceholder", {
                                            defaultValue: "Search location",
                                        })}
                                        icon={<FiMapPin size={16} />}
                                        onLocationSelect={handlePickupLocationSelect}
                                    />
                                </Box>

                                <Box
                                    sx={{
                                        display: { xs: "none", sm: "flex" },
                                        alignItems: "center",
                                        color: "text.secondary",
                                    }}
                                >
                                    <FiArrowRight size={18} />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <RHFLocationAutocomplete
                                        control={control}
                                        name="dropoff_location_label"
                                        label={t("shipments.filters.dropoffLocation", {
                                            defaultValue: "Dropoff location",
                                        })}
                                        placeholder={t("shipments.filters.locationPlaceholder", {
                                            defaultValue: "Search location",
                                        })}
                                        icon={<FiMapPin size={16} />}
                                        onLocationSelect={handleDropoffLocationSelect}
                                    />
                                </Box>
                            </Stack>

                            {hasMapPoints ? (
                                <Button
                                    size="small"
                                    variant="text"
                                    startIcon={<FiMap />}
                                    sx={{ mt: 1, textTransform: "none" }}
                                    onClick={() => setMapOpen((value) => !value)}
                                >
                                    {mapOpen
                                        ? t("shipments.filters.hideMap", { defaultValue: "Hide map" })
                                        : t("shipments.filters.showMap", { defaultValue: "Show on map" })}
                                </Button>
                            ) : null}

                            <Collapse in={mapOpen && hasMapPoints} unmountOnExit>
                                <ShipmentFilterMapPreview
                                    pickup={{
                                        lat: watched.pickup_lat,
                                        lon: watched.pickup_lon,
                                        label: watched.pickup_location_label,
                                    }}
                                    dropoff={{
                                        lat: watched.dropoff_lat,
                                        lon: watched.dropoff_lon,
                                        label: watched.dropoff_location_label,
                                    }}
                                />
                            </Collapse>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.pickupDates", { defaultValue: "Pickup dates" })}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Controller
                                    control={control}
                                    name="pickup_date_from"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="date"
                                            label={t("shipments.filters.from", { defaultValue: "From" })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="pickup_date_to"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="date"
                                            label={t("shipments.filters.to", { defaultValue: "To" })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                        />
                                    )}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.dropoffDates", { defaultValue: "Dropoff dates" })}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Controller
                                    control={control}
                                    name="dropoff_date_from"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="date"
                                            label={t("shipments.filters.from", { defaultValue: "From" })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="dropoff_date_to"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            type="date"
                                            label={t("shipments.filters.to", { defaultValue: "To" })}
                                            slotProps={{ inputLabel: { shrink: true } }}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value || undefined)}
                                        />
                                    )}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.vehicle", { defaultValue: "Vehicle" })}
                            </Typography>

                            <RHFIdMultiAutocomplete
                                control={control}
                                name="vehicle_type"
                                label={t("shipments.filters.vehicleType", {
                                    defaultValue: "Vehicle type (up to 5)",
                                })}
                                options={vehicleOptions}
                                maxSelected={MAX_VEHICLES}
                            />
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.weight", { defaultValue: "Weight" })}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Controller
                                    control={control}
                                    name="weight_min"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t("shipments.filters.min", { defaultValue: "Min" })}
                                            value={field.value ?? ""}
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: "numeric",
                                                    pattern: "[0-9]*",
                                                },
                                            }}
                                            onChange={(e) => field.onChange(normalizeNumber(e.target.value))}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="weight_max"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t("shipments.filters.max", { defaultValue: "Max" })}
                                            value={field.value ?? ""}
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: "numeric",
                                                    pattern: "[0-9]*",
                                                },
                                            }}
                                            onChange={(e) => field.onChange(normalizeNumber(e.target.value))}
                                        />
                                    )}
                                />
                            </Stack>
                        </Box>

                        <Box>
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>
                                {t("shipments.filters.volume", { defaultValue: "Volume" })}
                            </Typography>

                            <Stack direction="row" spacing={1}>
                                <Controller
                                    control={control}
                                    name="volume_min"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t("shipments.filters.min", { defaultValue: "Min" })}
                                            value={field.value ?? ""}
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: "numeric",
                                                    pattern: "[0-9]*",
                                                },
                                            }}
                                            onChange={(e) => field.onChange(normalizeNumber(e.target.value))}
                                        />
                                    )}
                                />

                                <Controller
                                    control={control}
                                    name="volume_max"
                                    render={({ field }) => (
                                        <TextField
                                            fullWidth
                                            size="small"
                                            label={t("shipments.filters.max", { defaultValue: "Max" })}
                                            value={field.value ?? ""}
                                            slotProps={{
                                                htmlInput: {
                                                    inputMode: "numeric",
                                                    pattern: "[0-9]*",
                                                },
                                            }}
                                            onChange={(e) => field.onChange(normalizeNumber(e.target.value))}
                                        />
                                    )}
                                />
                            </Stack>
                        </Box>
                    </Stack>
                </Box>

                <Box
                    sx={{
                        p: 2,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        bgcolor: "background.paper",
                    }}
                >
                    <Stack direction="row" spacing={1}>
                        <Button fullWidth variant="outlined" onClick={handleReset}>
                            {t("shipments.filters.reset", { defaultValue: "Reset" })}
                        </Button>

                        <Button fullWidth variant="contained" onClick={submit}>
                            {t("shipments.filters.apply", { defaultValue: "Apply" })}
                        </Button>
                    </Stack>
                </Box>
            </Box>
        </Drawer>
    );
}