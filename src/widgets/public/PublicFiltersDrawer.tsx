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
    type InputBaseComponentProps,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "react-i18next";

import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

export type PublicFilters = {
    pickup_country?: string;
    pickup_region?: string[]; // multi (<=3)
    pickup_city?: string;

    dropoff_country?: string;
    dropoff_region?: string[]; // multi (<=3)
    dropoff_city?: string;

    pickup_date_from?: string;
    pickup_date_to?: string;

    dropoff_date_from?: string;
    dropoff_date_to?: string;

    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;

    vehicle_type?: string[]; // multi (<=5)
    favorites_only?: boolean;
};

type Props = {
    open: boolean;
    initial?: PublicFilters;
    onClose: () => void;
    onApply: (f: PublicFilters) => void;
    kind: "cargo" | "transport";
};

type VehicleTypeOption = { value: string; label: string };

type Option = {
    id: string;
    label: string;
    code?: string | null;
    countryCode?: string | null;
    stateCode?: string | null;
};

const MAX_REGIONS = 3;
const MAX_VEHICLES = 5;

const clampIds = (ids: string[], max: number) => ids.slice(0, max);

const digitsOnly = (v: string) => v.replace(/\D/g, "");

const getTodayDate = () => new Date().toISOString().split("T")[0];
const getDefaultDatePlus30 = () => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split("T")[0];
};

export function PublicFiltersDrawer({ open, initial, onClose, onApply, kind }: Props) {
    const { t, i18n } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();
    const user = useUserStore((s) => s.user);

    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading: geoLoading,
    } = useGeoCascade();

    const getInitialFilters = (init?: PublicFilters): PublicFilters => {
        if (init && Object.keys(init).length > 0) {
            const result: PublicFilters = { ...init };
            if (!result.pickup_date_from) result.pickup_date_from = getTodayDate();
            if (!result.pickup_date_to) result.pickup_date_to = getDefaultDatePlus30();
            return result;
        }
        return {
            pickup_date_from: getTodayDate(),
            pickup_date_to: getDefaultDatePlus30(),
        };
    };

    const [f, setF] = useState<PublicFilters>(getInitialFilters(initial));
    const [filtersData, setFiltersData] = useState<null | { vehicle_types: VehicleTypeOption[] }>(null);

    // reset on open
    useEffect(() => {
        if (open) setF(getInitialFilters(initial));
    }, [open, initial]);

    // load vehicle filters once
    useEffect(() => {
        (async () => {
            try {
                const data = await publicShipmentsApi.getFilters();
                setFiltersData({ vehicle_types: data?.vehicle_types ?? [] });
            } catch (e) {
                console.error(e);
            }
        })();
    }, []);

    // load countries when open
    useEffect(() => {
        if (open) void loadCountries();
    }, [open, loadCountries]);

    // ensure regions
    useEffect(() => {
        ensureRegions(f.pickup_country);
    }, [ensureRegions, f.pickup_country]);

    useEffect(() => {
        ensureRegions(f.dropoff_country);
    }, [ensureRegions, f.dropoff_country]);

    // region ids (multi)
    const pickupRegionIds = f.pickup_region ?? [];
    const dropoffRegionIds = f.dropoff_region ?? [];

    const pickupRegionForCities = pickupRegionIds.length === 1 ? pickupRegionIds[0] : undefined;
    const dropoffRegionForCities = dropoffRegionIds.length === 1 ? dropoffRegionIds[0] : undefined;

    // ensure cities ONLY if exactly one region selected
    useEffect(() => {
        if (!f.pickup_country || !pickupRegionForCities) return;
        ensureCities(f.pickup_country, pickupRegionForCities);
    }, [ensureCities, f.pickup_country, pickupRegionForCities]);

    useEffect(() => {
        if (!f.dropoff_country || !dropoffRegionForCities) return;
        ensureCities(f.dropoff_country, dropoffRegionForCities);
    }, [ensureCities, f.dropoff_country, dropoffRegionForCities]);

    // if >1 region, clear city
    useEffect(() => {
        if ((f.pickup_region?.length ?? 0) > 1 && f.pickup_city) {
            setF((v) => ({ ...v, pickup_city: undefined }));
        }
    }, [f.pickup_region, f.pickup_city]);

    useEffect(() => {
        if ((f.dropoff_region?.length ?? 0) > 1 && f.dropoff_city) {
            setF((v) => ({ ...v, dropoff_city: undefined }));
        }
    }, [f.dropoff_region, f.dropoff_city]);

    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = digitsOnly(e.target.value);
        setF((v) => ({ ...v, [key]: raw === "" ? undefined : Number(raw) }));
    };

    const numericInputProps: InputBaseComponentProps = { inputMode: "numeric", pattern: "[0-9]*" };

    const onReset = () =>
        setF({
            pickup_date_from: getTodayDate(),
            pickup_date_to: getDefaultDatePlus30(),
        });

    const asOptions = (items: GeoImportItem[]): Option[] =>
        items.map((i) => ({
            id: i.id,
            label: getLocalizedGeoName(i),
            code: i.iso2 || i.code,
            countryCode: i.countryCode,
            stateCode: (i as any).stateCode || i.code,
        }));

    const countriesOpts = useMemo(
        () => asOptions(countries),
        [countries, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    // lists
    const pickupRegions = getRegions(f.pickup_country);
    const dropoffRegions = getRegions(f.dropoff_country);

    const pickupRegionOptions = useMemo(
        () => asOptions(pickupRegions),
        [pickupRegions, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const dropoffRegionOptions = useMemo(
        () => asOptions(dropoffRegions),
        [dropoffRegions, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const pickupCities = pickupRegionForCities ? getCities(f.pickup_country, pickupRegionForCities) : [];
    const dropoffCities = dropoffRegionForCities ? getCities(f.dropoff_country, dropoffRegionForCities) : [];

    // disabled flags
    const pickupRegionsDisabled =
        !f.pickup_country || (pickupRegions.length === 0 && geoLoading.regionsFor !== (f.pickup_country || ""));

    const pickupCitiesDisabled =
        !f.pickup_country ||
        pickupRegionIds.length !== 1 ||
        !pickupRegionForCities ||
        (pickupCities.length === 0 && geoLoading.citiesFor !== `${f.pickup_country}/${pickupRegionForCities}`);

    const dropoffRegionsDisabled =
        !f.dropoff_country || (dropoffRegions.length === 0 && geoLoading.regionsFor !== (f.dropoff_country || ""));

    const dropoffCitiesDisabled =
        !f.dropoff_country ||
        dropoffRegionIds.length !== 1 ||
        !dropoffRegionForCities ||
        (dropoffCities.length === 0 && geoLoading.citiesFor !== `${f.dropoff_country}/${dropoffRegionForCities}`);

    // selected values
    const pickupCountryValue: Option | null = useMemo(
        () => countriesOpts.find((o) => o.id === f.pickup_country) ?? null,
        [countriesOpts, f.pickup_country]
    );

    const dropoffCountryValue: Option | null = useMemo(
        () => countriesOpts.find((o) => o.id === f.dropoff_country) ?? null,
        [countriesOpts, f.dropoff_country]
    );

    const pickupRegionValue: Option[] = useMemo(
        () => pickupRegionOptions.filter((o) => pickupRegionIds.includes(o.id)),
        [pickupRegionOptions, pickupRegionIds]
    );

    const dropoffRegionValue: Option[] = useMemo(
        () => dropoffRegionOptions.filter((o) => dropoffRegionIds.includes(o.id)),
        [dropoffRegionOptions, dropoffRegionIds]
    );

    const pickupCityValue: Option | null = useMemo(() => {
        if (!pickupRegionForCities) return null;
        return asOptions(pickupCities).find((o) => o.id === f.pickup_city) ?? null;
    }, [pickupCities, f.pickup_city, pickupRegionForCities, getLocalizedGeoName, i18n.resolvedLanguage]);

    const dropoffCityValue: Option | null = useMemo(() => {
        if (!dropoffRegionForCities) return null;
        return asOptions(dropoffCities).find((o) => o.id === f.dropoff_city) ?? null;
    }, [dropoffCities, f.dropoff_city, dropoffRegionForCities, getLocalizedGeoName, i18n.resolvedLanguage]);

    // vehicles (multi)
    const vehicleTypes = filtersData?.vehicle_types ?? [];
    const vehicleOpts: Option[] = useMemo(() => {
        return vehicleTypes.map((v) => {
            const lookup = lookups?.vehicleType?.find((l) => l.slug === v.value);
            if (lookup) return { id: v.value, label: getLocalizedLabel(lookup) };
            return { id: v.value, label: v.label };
        });
    }, [vehicleTypes, lookups, getLocalizedLabel]);

    const vehicleIds = f.vehicle_type ?? [];
    const vehicleValue: Option[] = useMemo(
        () => vehicleOpts.filter((o) => vehicleIds.includes(o.id)),
        [vehicleOpts, vehicleIds]
    );

    // handlers
    const handlePickupCountry = (opt: Option | null) => {
        setF((v) => ({
            ...v,
            pickup_country: opt?.id,
            pickup_region: undefined,
            pickup_city: undefined,
        }));
    };

    const handlePickupRegions = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_REGIONS);
        const prevSingle = pickupRegionForCities;
        const nextSingle = ids.length === 1 ? ids[0] : undefined;

        const shouldClearCity = ids.length !== 1 || (prevSingle && nextSingle && prevSingle !== nextSingle);

        setF((v) => ({
            ...v,
            pickup_region: ids.length ? ids : undefined,
            pickup_city: shouldClearCity ? undefined : v.pickup_city,
        }));
    };

    const handleDropoffCountry = (opt: Option | null) => {
        setF((v) => ({
            ...v,
            dropoff_country: opt?.id,
            dropoff_region: undefined,
            dropoff_city: undefined,
        }));
    };

    const handleDropoffRegions = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_REGIONS);
        const prevSingle = dropoffRegionForCities;
        const nextSingle = ids.length === 1 ? ids[0] : undefined;

        const shouldClearCity = ids.length !== 1 || (prevSingle && nextSingle && prevSingle !== nextSingle);

        setF((v) => ({
            ...v,
            dropoff_region: ids.length ? ids : undefined,
            dropoff_city: shouldClearCity ? undefined : v.dropoff_city,
        }));
    };

    const handleVehicleTypes = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_VEHICLES);
        setF((v) => ({ ...v, vehicle_type: ids.length ? ids : undefined }));
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
                                onChange={(e) => setF((v) => ({ ...v, favorites_only: e.target.checked }))}
                            />
                        }
                        label={t("shipments.filters.favorites", { defaultValue: "Favorites only" })}
                        sx={{ mb: 2 }}
                    />
                )}

                {/* PICKUP */}
                <Typography variant="subtitle2" gutterBottom>
                    {t("shipments.filters.pickup", { defaultValue: "Pickup" })}
                </Typography>

                <Stack gap={1.2}>
                    <Autocomplete<Option, false, false, false>
                        options={countriesOpts}
                        value={pickupCountryValue}
                        onChange={(_, opt) => handlePickupCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={geoLoading.countries}
                        renderInput={(params) => (
                            <TextField {...params} size="small" label={t("shipments.filters.country", { defaultValue: "Country" })} />
                        )}
                    />

                    <Autocomplete<Option, true, false, false>
                        multiple
                        disableCloseOnSelect
                        options={pickupRegionOptions}
                        value={pickupRegionValue}
                        onChange={(_, opts) => handlePickupRegions(opts)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        getOptionDisabled={(opt) =>
                            pickupRegionValue.length >= MAX_REGIONS && !pickupRegionIds.includes(opt.id)
                        }
                        loading={geoLoading.regionsFor === (f.pickup_country || "")}
                        disabled={pickupRegionsDisabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                            />
                        )}
                    />

                    <Autocomplete<Option, false, false, false>
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF((v) => ({ ...v, pickup_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={!!pickupRegionForCities && geoLoading.citiesFor === `${f.pickup_country}/${pickupRegionForCities}`}
                        disabled={pickupCitiesDisabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.city", { defaultValue: "City" })}
                                helperText={
                                    pickupRegionIds.length > 1
                                        ? t("shipments.filters.cityDisabled", {
                                            defaultValue: "City is available only when exactly 1 region is selected.",
                                        })
                                        : undefined
                                }
                            />
                        )}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.from", { defaultValue: "From" })}
                            InputLabelProps={{ shrink: true }}
                            value={f.pickup_date_from ?? ""}
                            onChange={(e) => setF((v) => ({ ...v, pickup_date_from: e.target.value || undefined }))}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.to", { defaultValue: "To" })}
                            InputLabelProps={{ shrink: true }}
                            value={f.pickup_date_to ?? ""}
                            onChange={(e) => setF((v) => ({ ...v, pickup_date_to: e.target.value || undefined }))}
                        />
                    </Stack>
                </Stack>

                {/* DROPOFF */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.dropoff", { defaultValue: "Dropoff" })}
                </Typography>

                <Stack gap={1.2}>
                    <Autocomplete<Option, false, false, false>
                        options={countriesOpts}
                        value={dropoffCountryValue}
                        onChange={(_, opt) => handleDropoffCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={geoLoading.countries}
                        renderInput={(params) => (
                            <TextField {...params} size="small" label={t("shipments.filters.country", { defaultValue: "Country" })} />
                        )}
                    />

                    <Autocomplete<Option, true, false, false>
                        multiple
                        disableCloseOnSelect
                        options={dropoffRegionOptions}
                        value={dropoffRegionValue}
                        onChange={(_, opts) => handleDropoffRegions(opts)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        getOptionDisabled={(opt) =>
                            dropoffRegionValue.length >= MAX_REGIONS && !dropoffRegionIds.includes(opt.id)
                        }
                        loading={geoLoading.regionsFor === (f.dropoff_country || "")}
                        disabled={dropoffRegionsDisabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                            />
                        )}
                    />

                    <Autocomplete<Option, false, false, false>
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF((v) => ({ ...v, dropoff_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={!!dropoffRegionForCities && geoLoading.citiesFor === `${f.dropoff_country}/${dropoffRegionForCities}`}
                        disabled={dropoffCitiesDisabled}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.city", { defaultValue: "City" })}
                                helperText={
                                    dropoffRegionIds.length > 1
                                        ? t("shipments.filters.cityDisabled", {
                                            defaultValue: "City is available only when exactly 1 region is selected.",
                                        })
                                        : undefined
                                }
                            />
                        )}
                    />
                </Stack>

                {/* VEHICLE */}
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
                            label={t("shipments.filters.vehicleType", { defaultValue: "Vehicle type (up to 5)" })}
                        />
                    )}
                />

                {/* WEIGHT */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.weight", { defaultValue: "Weight" })}
                </Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.min", { defaultValue: "Min" })}
                        inputProps={numericInputProps}
                        value={f.weight_min ?? ""}
                        onChange={setNum("weight_min")}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        inputProps={numericInputProps}
                        value={f.weight_max ?? ""}
                        onChange={setNum("weight_max")}
                    />
                </Stack>

                {/* VOLUME */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.volume", { defaultValue: "Volume" })}
                </Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.min", { defaultValue: "Min" })}
                        inputProps={numericInputProps}
                        value={f.volume_min ?? ""}
                        onChange={setNum("volume_min")}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        inputProps={numericInputProps}
                        value={f.volume_max ?? ""}
                        onChange={setNum("volume_max")}
                    />
                </Stack>

                <Stack direction="row" gap={1} sx={{ mt: 3 }}>
                    <Button fullWidth variant="contained" startIcon={<FiFilter />} onClick={() => onApply(f)}>
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
