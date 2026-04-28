import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    Stack,
    Typography,
    Divider,
    TextField,
    Button,
    FormControlLabel,
    Switch,
    CircularProgress,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import { mapsApi } from "@/shared/api/mapsApi";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import type { MapsLocationSuggestion } from "@/entities/maps/model/types";

export type LocationFilterPlaceType = "country" | "region" | "city" | "address" | "unknown";

export type PublicFilters = {
    pickup_location_label?: string;
    pickup_country?: string;
    pickup_region?: string;
    pickup_city?: string;
    pickup_lat?: number;
    pickup_lon?: number;
    pickup_place_type?: LocationFilterPlaceType;

    dropoff_location_label?: string;
    dropoff_country?: string;
    dropoff_region?: string;
    dropoff_city?: string;
    dropoff_lat?: number;
    dropoff_lon?: number;
    dropoff_place_type?: LocationFilterPlaceType;

    pickup_date_from?: string;
    pickup_date_to?: string;

    dropoff_date_from?: string;
    dropoff_date_to?: string;

    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;

    vehicle_type?: string[];
    favorites_only?: boolean;
};

type Props = {
    open: boolean;
    initial?: PublicFilters;
    onClose: () => void;
    onApply: (f: PublicFilters) => void;
    kind: "cargo" | "transport";
};

type VehicleTypeOption = {
    value: string;
    label: string;
};

type Option = {
    id: string;
    label: string;
};

type LocationAutocompleteProps = {
    label: string;
    placeholder?: string;
    value?: string;
    onChange: (label: string, location: MapsLocationSuggestion | null) => void;
};

const MAX_VEHICLES = 5;

const digitsOnly = (v: string) => v.replace(/\D/g, "");

const getTodayDate = () => new Date().toISOString().split("T")[0];

const getDefaultDatePlus30 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
};

const compactFilters = (filters: PublicFilters): PublicFilters => {
    const out: PublicFilters = {};

    Object.entries(filters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === "") return;
        if (Array.isArray(value) && value.length === 0) return;

        (out as any)[key] = value;
    });

    return out;
};

const clampIds = (ids: string[], max: number) => ids.slice(0, max);

const getLocationLabel = (location: MapsLocationSuggestion | string | null) => {
    if (!location) return "";

    if (typeof location === "string") {
        return location;
    }

    return (
        location.display_name ||
        [location.city, location.region, location.country].filter(Boolean).join(", ") ||
        location.address ||
        ""
    );
};

const toNumberOrUndefined = (value: unknown) => {
    const num = Number(value);

    return Number.isFinite(num) ? num : undefined;
};

const getLocationLat = (location: MapsLocationSuggestion | null) => {
    return toNumberOrUndefined((location as any)?.lat ?? (location as any)?.latitude);
};

const getLocationLon = (location: MapsLocationSuggestion | null) => {
    return toNumberOrUndefined(
        (location as any)?.lon ?? (location as any)?.lng ?? (location as any)?.longitude,
    );
};

const getPlaceType = (location: MapsLocationSuggestion | null): LocationFilterPlaceType => {
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
};

function LocationAutocomplete({
                                  label,
                                  placeholder,
                                  value,
                                  onChange,
                              }: LocationAutocompleteProps) {
    const [inputValue, setInputValue] = useState(value ?? "");
    const [options, setOptions] = useState<MapsLocationSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    const query = inputValue.trim();

    useEffect(() => {
        setInputValue(value ?? "");
    }, [value]);

    useEffect(() => {
        if (query.length < 2) {
            setOptions([]);
            return;
        }

        const timer = window.setTimeout(() => {
            setLoading(true);

            mapsApi
                .searchLocations({
                    q: query,
                    limit: 10,
                } as any)
                .then((data) => {
                    setOptions(Array.isArray(data) ? data : []);
                })
                .catch(() => {
                    setOptions([]);
                })
                .finally(() => {
                    setLoading(false);
                });
        }, 350);

        return () => {
            window.clearTimeout(timer);
        };
    }, [query]);

    return (
        <Autocomplete<MapsLocationSuggestion, false, false, true>
            freeSolo
            options={options}
            loading={loading}
            inputValue={inputValue}
            value={value ?? ""}
            filterOptions={(items) => items}
            getOptionLabel={getLocationLabel}
            isOptionEqualToValue={(option, currentValue) => {
                if (typeof currentValue === "string") {
                    return getLocationLabel(option) === currentValue;
                }

                return getLocationLabel(option) === getLocationLabel(currentValue);
            }}
            onInputChange={(_, nextValue, reason) => {
                setInputValue(nextValue);

                if (reason === "input") {
                    onChange(nextValue, null);
                }

                if (!nextValue) {
                    onChange("", null);
                }
            }}
            onChange={(_, selected) => {
                if (!selected) {
                    setInputValue("");
                    onChange("", null);
                    return;
                }

                if (typeof selected === "string") {
                    setInputValue(selected);
                    onChange(selected, null);
                    return;
                }

                const nextLabel = getLocationLabel(selected);

                setInputValue(nextLabel);
                onChange(nextLabel, selected);
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    size="small"
                    label={label}
                    placeholder={placeholder}
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            endAdornment: (
                                <>
                                    {loading ? <CircularProgress size={18} /> : null}
                                    {params.InputProps.endAdornment}
                                </>
                            ),
                        },
                    }}
                />
            )}
        />
    );
}

export function PublicFiltersDrawer({ open, initial, onClose, onApply, kind }: Props) {
    const { t } = useTranslation();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();
    const user = useUserStore((s) => s.user);

    const getInitialFilters = (init?: PublicFilters): PublicFilters => {
        if (init && Object.keys(init).length > 0) {
            const result: PublicFilters = { ...init };

         //   if (!result.pickup_date_from) result.pickup_date_from = getTodayDate();
         //   if (!result.pickup_date_to) result.pickup_date_to = getDefaultDatePlus30();

            return result;
        }

        return {
            pickup_date_from: getTodayDate(),
            pickup_date_to: getDefaultDatePlus30(),
        };
    };

    const [f, setF] = useState<PublicFilters>(getInitialFilters(initial));
    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOption[] }>(null);

    useEffect(() => {
        if (!open) return;

       // setF(getInitialFilters(initial));
    }, [open, initial]);

    useEffect(() => {
        publicShipmentsApi
            .getFilters()
            .then((data) => {
                setFiltersData({
                    vehicle_types: data?.vehicle_types ?? [],
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    const vehicleTypes = filtersData?.vehicle_types ?? [];

    const vehicleOpts: Option[] = useMemo(() => {
        return vehicleTypes.map((v) => {
            const lookup = lookups?.vehicleType?.find((item: any) => item.slug === v.value);

            return {
                id: v.value,
                label: lookup ? getLocalizedLabel(lookup) : v.label,
            };
        });
    }, [vehicleTypes, lookups, getLocalizedLabel]);

    const vehicleIds = f.vehicle_type ?? [];

    const vehicleValue: Option[] = useMemo(() => {
        return vehicleOpts.filter((option) => vehicleIds.includes(option.id));
    }, [vehicleOpts, vehicleIds]);

    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = digitsOnly(e.target.value);

        setF((v) => ({
            ...v,
            [key]: raw === "" ? undefined : Number(raw),
        }));
    };

    const onReset = () => {
        setF({
          //  pickup_date_from: getTodayDate(),
          //  pickup_date_to: getDefaultDatePlus30(),
        });
    };

    const handleVehicleTypes = (opts: Option[]) => {
        const ids = clampIds(
            opts.map((o) => o.id),
            MAX_VEHICLES,
        );

        setF((v) => ({
            ...v,
            vehicle_type: ids.length ? ids : undefined,
        }));
    };

    const handlePickupLocation = (label: string, location: MapsLocationSuggestion | null) => {
        setF((v) => ({
            ...v,
            pickup_location_label: label || undefined,

            pickup_country: location?.country || undefined,
            pickup_region: location?.region || undefined,
            pickup_city: location?.city || undefined,
            pickup_lat: getLocationLat(location),
            pickup_lon: getLocationLon(location),
            pickup_place_type: location ? getPlaceType(location) : undefined,
        }));
    };

    const handleDropoffLocation = (label: string, location: MapsLocationSuggestion | null) => {
        setF((v) => ({
            ...v,
            dropoff_location_label: label || undefined,

            dropoff_country: location?.country || undefined,
            dropoff_region: location?.region || undefined,
            dropoff_city: location?.city || undefined,
            dropoff_lat: getLocationLat(location),
            dropoff_lon: getLocationLon(location),
            dropoff_place_type: location ? getPlaceType(location) : undefined,
        }));
    };

    const handleApply = () => {
        onApply(compactFilters(f));
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 360, p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>
                        {t("shipments.filters.title", { defaultValue: "Filters" })}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                        {kind === "cargo"
                            ? t("shipments.filters.cargo", { defaultValue: "Cargo" })
                            : t("shipments.filters.transport", { defaultValue: "Transport" })}
                    </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {user && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={f.favorites_only ?? false}
                                onChange={(e) =>
                                    setF((v) => ({
                                        ...v,
                                        favorites_only: e.target.checked,
                                    }))
                                }
                            />
                        }
                        label={t("shipments.filters.favorites", { defaultValue: "Favorites only" })}
                        sx={{ mb: 2 }}
                    />
                )}

                <Typography variant="subtitle2" gutterBottom>
                    {t("shipments.filters.pickup", { defaultValue: "Pickup" })}
                </Typography>

                <Stack gap={1.2}>
                    <LocationAutocomplete
                        label={t("shipments.filters.pickupLocation", {
                            defaultValue: "Pickup location",
                        })}
                        placeholder={t("shipments.filters.locationPlaceholder", {
                            defaultValue: "Search country, region, city or address",
                        })}
                        value={f.pickup_location_label}
                        onChange={handlePickupLocation}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.from", { defaultValue: "From" })}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={f.pickup_date_from ?? ""}
                            onChange={(e) =>
                                setF((v) => ({
                                    ...v,
                                    pickup_date_from: e.target.value || undefined,
                                }))
                            }
                        />

                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.to", { defaultValue: "To" })}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={f.pickup_date_to ?? ""}
                            onChange={(e) =>
                                setF((v) => ({
                                    ...v,
                                    pickup_date_to: e.target.value || undefined,
                                }))
                            }
                        />
                    </Stack>
                </Stack>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.dropoff", { defaultValue: "Dropoff" })}
                </Typography>

                <Stack gap={1.2}>
                    <LocationAutocomplete
                        label={t("shipments.filters.dropoffLocation", {
                            defaultValue: "Dropoff location",
                        })}
                        placeholder={t("shipments.filters.locationPlaceholder", {
                            defaultValue: "Search country, region, city or address",
                        })}
                        value={f.dropoff_location_label}
                        onChange={handleDropoffLocation}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.from", { defaultValue: "From" })}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={f.dropoff_date_from ?? ""}
                            onChange={(e) =>
                                setF((v) => ({
                                    ...v,
                                    dropoff_date_from: e.target.value || undefined,
                                }))
                            }
                        />

                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.to", { defaultValue: "To" })}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                            value={f.dropoff_date_to ?? ""}
                            onChange={(e) =>
                                setF((v) => ({
                                    ...v,
                                    dropoff_date_to: e.target.value || undefined,
                                }))
                            }
                        />
                    </Stack>
                </Stack>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.vehicle", { defaultValue: "Vehicle" })}
                </Typography>

                <Autocomplete<Option, true, false, false>
                    multiple
                    disableCloseOnSelect
                    options={vehicleOpts}
                    value={vehicleValue}
                    onChange={(_, opts) => handleVehicleTypes(opts)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionDisabled={(opt) => vehicleValue.length >= MAX_VEHICLES && !vehicleIds.includes(opt.id)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            label={t("shipments.filters.vehicleType", {
                                defaultValue: "Vehicle type (up to 5)",
                            })}
                        />
                    )}
                />

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.weight", { defaultValue: "Weight" })}
                </Typography>

                <Stack direction="row" gap={1.2}>
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.min", { defaultValue: "Min" })}
                        slotProps={{
                            htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            },
                        }}
                        value={f.weight_min ?? ""}
                        onChange={setNum("weight_min")}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        slotProps={{
                            htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            },
                        }}
                        value={f.weight_max ?? ""}
                        onChange={setNum("weight_max")}
                    />
                </Stack>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.volume", { defaultValue: "Volume" })}
                </Typography>

                <Stack direction="row" gap={1.2}>
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.min", { defaultValue: "Min" })}
                        slotProps={{
                            htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            },
                        }}
                        value={f.volume_min ?? ""}
                        onChange={setNum("volume_min")}
                    />

                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        slotProps={{
                            htmlInput: {
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                            },
                        }}
                        value={f.volume_max ?? ""}
                        onChange={setNum("volume_max")}
                    />
                </Stack>

                <Stack direction="row" gap={1} sx={{ mt: 3 }}>
                    <Button fullWidth variant="contained" startIcon={<FiFilter />} onClick={handleApply}>
                        {t("shipments.filters.apply", { defaultValue: "Apply" })}
                    </Button>

                    <Button fullWidth variant="outlined" startIcon={<FiRefreshCw />} onClick={onReset}>
                        {t("shipments.filters.reset", { defaultValue: "Reset" })}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}