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
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import {
    publicGeoApi,
    type PublicGeoLocationItem,
    type PublicGeoLocationType,
} from "@/shared/api/publicGeoApi.ts";

export type PublicFilters = {
    pickup_geo_location_name?: string;
    pickup_geo_location_type?: PublicGeoLocationType;

    dropoff_geo_location_name?: string;
    dropoff_geo_location_type?: PublicGeoLocationType;

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

type GeoAutocompleteProps = {
    label: string;
    placeholder?: string;
    value?: string;
    type?: PublicGeoLocationType;
    onChange: (location: PublicGeoLocationItem | null) => void;
};

const MAX_VEHICLES = 5;

const digitsOnly = (v: string) => v.replace(/\D/g, "");

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

const getGeoTypeLabel = (type: PublicGeoLocationType) => {
    if (type === "COUNTRY") return "Country";
    if (type === "REGION") return "Region";
    return "City";
};

const getStorageKey = (kind: "cargo" | "transport") => {
    return `shipments:public-filters:${kind}`;
};

const getStoredFilters = (kind: "cargo" | "transport"): PublicFilters | null => {
    if (typeof window === "undefined") return null;

    try {
        const raw = window.localStorage.getItem(getStorageKey(kind));
        if (!raw) return null;

        return JSON.parse(raw) as PublicFilters;
    } catch {
        return null;
    }
};

const setStoredFilters = (kind: "cargo" | "transport", filters: PublicFilters) => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(getStorageKey(kind), JSON.stringify(filters));
};

const removeStoredFilters = (kind: "cargo" | "transport") => {
    if (typeof window === "undefined") return;

    window.localStorage.removeItem(getStorageKey(kind));
};

function GeoLocationAutocomplete({
                                     label,
                                     placeholder,
                                     value,
                                     onChange,
                                 }: GeoAutocompleteProps) {
    const { getLocalizedGeoName } = useLocalizedGeo();

    const [inputValue, setInputValue] = useState(value ?? "");
    const [selected, setSelected] = useState<PublicGeoLocationItem | null>(null);
    const [options, setOptions] = useState<PublicGeoLocationItem[]>([]);
    const [loading, setLoading] = useState(false);

    const query = inputValue.trim();

    useEffect(() => {
        setInputValue(value ?? "");

        if (!value) {
            setSelected(null);
        }
    }, [value]);

    useEffect(() => {
        if (query.length < 2) {
            setOptions([]);
            return;
        }

        let active = true;

        const timer = window.setTimeout(() => {
            setLoading(true);

            publicGeoApi
                .search(query)
                .then((data) => {
                    if (!active) return;
                    setOptions(Array.isArray(data) ? data : []);
                })
                .catch(() => {
                    if (!active) return;
                    setOptions([]);
                })
                .finally(() => {
                    if (!active) return;
                    setLoading(false);
                });
        }, 350);

        return () => {
            active = false;
            window.clearTimeout(timer);
        };
    }, [query]);

    return (
        <Autocomplete<PublicGeoLocationItem, false, false, false>
            options={options}
            loading={loading}
            value={selected}
            inputValue={inputValue}
            filterOptions={(items) => items}
            isOptionEqualToValue={(option, currentValue) => option.id === currentValue.id}
            getOptionLabel={(option) => {
                const title = getLocalizedGeoName(option);

                const meta = [
                    option.region ? getLocalizedGeoName(option.region) : null,
                    option.country ? getLocalizedGeoName(option.country) : null,
                ].filter(Boolean);

                return meta.length ? `${title}, ${meta.join(", ")}` : title;
            }}
            onInputChange={(_, nextValue, reason) => {
                setInputValue(nextValue);

                if (reason === "input" && !nextValue.trim()) {
                    setSelected(null);
                    onChange(null);
                }

                if (reason === "clear") {
                    setSelected(null);
                    onChange(null);
                }
            }}
            onChange={(_, nextValue) => {
                setSelected(nextValue);

                if (!nextValue) {
                    setInputValue("");
                    onChange(null);
                    return;
                }

                setInputValue(getLocalizedGeoName(nextValue));
                onChange(nextValue);
            }}
            renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                    <Stack spacing={0.25}>
                        <Typography variant="body2">
                            {getLocalizedGeoName(option)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                            {getGeoTypeLabel(option.type)}
                            {option.region ? ` · ${getLocalizedGeoName(option.region)}` : ""}
                            {option.country ? ` · ${getLocalizedGeoName(option.country)}` : ""}
                        </Typography>
                    </Stack>
                </Box>
            )}
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

export function PublicFiltersDrawer({
                                        open,
                                        initial,
                                        onClose,
                                        onApply,
                                        kind,
                                    }: Props) {
    const { t } = useTranslation();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();
    const user = useUserStore((s) => s.user);

    const getInitialFilters = (init?: PublicFilters): PublicFilters => {
        const stored = getStoredFilters(kind);

        if (stored) {
            return stored;
        }

        if (init && Object.keys(init).length > 0) {
            return { ...init };
        }

        return {};
    };

    const [f, setF] = useState<PublicFilters>(() => getInitialFilters(initial));
    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOption[] }>(null);

    useEffect(() => {
        if (!open) return;

        setF(getInitialFilters(initial));
    }, [open, initial, kind]);

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
        removeStoredFilters(kind);
        setF({});
        onApply({});
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

    const handlePickupLocation = (location: PublicGeoLocationItem | null) => {
        setF((v) => ({
            ...v,
            pickup_geo_location_name: location?.name || undefined,
            pickup_geo_location_type: location?.type || undefined,
        }));
    };

    const handleDropoffLocation = (location: PublicGeoLocationItem | null) => {
        setF((v) => ({
            ...v,
            dropoff_geo_location_name: location?.name || undefined,
            dropoff_geo_location_type: location?.type || undefined,
        }));
    };

    const handleApply = () => {
        const nextFilters = compactFilters(f);

        setStoredFilters(kind, nextFilters);
        onApply(nextFilters);
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
                    <GeoLocationAutocomplete
                        label={t("shipments.filters.pickupLocation", {
                            defaultValue: "Pickup location",
                        })}
                        placeholder={t("shipments.filters.locationPlaceholder", {
                            defaultValue: "Search country, region or city",
                        })}
                        value={f.pickup_geo_location_name}
                        type={f.pickup_geo_location_type}
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
                    <GeoLocationAutocomplete
                        label={t("shipments.filters.dropoffLocation", {
                            defaultValue: "Dropoff location",
                        })}
                        placeholder={t("shipments.filters.locationPlaceholder", {
                            defaultValue: "Search country, region or city",
                        })}
                        value={f.dropoff_geo_location_name}
                        type={f.dropoff_geo_location_type}
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
                    getOptionLabel={(option) => option.label}
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