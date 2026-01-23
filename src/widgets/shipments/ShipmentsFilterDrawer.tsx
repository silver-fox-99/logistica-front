import React, { useEffect, useMemo, useState } from "react";
import {
    Drawer,
    Box,
    Stack,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Divider,
    TextField,
    Switch,
    type InputBaseComponentProps,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";

import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/public/PublicFiltersDrawer";

import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

type VehicleTypeOption = { value: string; label: string };
type Option = {
    id: string;
    label: string;
    code?: string | null;
    countryCode?: string | null;
    stateCode?: string | null;
};

type Props = {
    open: boolean;
    value: ShipmentsKind;
    onChange: (v: ShipmentsKind) => void;
    filters: PublicFilters;
    onFiltersChange: (f: PublicFilters) => void;
    onClose: () => void;
    onApply: () => void;
    onReset: () => void;
};

const MAX_REGIONS = 3;
const MAX_VEHICLES = 5;

const clampIds = (ids: string[], max: number) => ids.slice(0, max);

export default function ShipmentsFilterDrawer({
                                                  open,
                                                  value,
                                                  onChange,
                                                  filters,
                                                  onFiltersChange,
                                                  onClose,
                                                  onApply,
                                                  onReset,
                                              }: Props) {
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

    const [data, setData] = useState<null | { vehicle_types: VehicleTypeOption[] }>(null);

    // --- helpers ---
    const setF = (patch: Partial<PublicFilters>) => onFiltersChange({ ...filters, ...patch });

    const digitsOnly = (v: string) => v.replace(/\D/g, "");
    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = digitsOnly(e.target.value);
        setF({ [key]: raw === "" ? undefined : Number(raw) } as any);
    };

    const numericInputProps: InputBaseComponentProps = {
        inputMode: "numeric",
        pattern: "[0-9]*",
    };

    // --- load remote filters (vehicle types) once on open ---
    useEffect(() => {
        if (!open || data) return;
        (async () => {
            try {
                const res = await publicShipmentsApi.getFilters();
                setData({ vehicle_types: res?.vehicle_types ?? [] });
            } catch (e) {
                console.error(e);
            }
        })();
    }, [open, data]);

    // geo preload
    useEffect(() => {
        if (open) void loadCountries();
    }, [open, loadCountries]);

    // ensure regions when country chosen
    useEffect(() => {
        ensureRegions(filters.pickup_country);
    }, [ensureRegions, filters.pickup_country]);

    useEffect(() => {
        ensureRegions(filters.dropoff_country);
    }, [ensureRegions, filters.dropoff_country]);

    // --- Multi regions (arrays) ---
    const pickupRegionIds = filters.pickup_region ?? [];
    const dropoffRegionIds = filters.dropoff_region ?? [];

    const pickupRegionForCities = pickupRegionIds.length === 1 ? pickupRegionIds[0] : undefined;
    const dropoffRegionForCities = dropoffRegionIds.length === 1 ? dropoffRegionIds[0] : undefined;

    // ensure cities ONLY when exactly one region selected
    useEffect(() => {
        if (!filters.pickup_country || !pickupRegionForCities) return;
        ensureCities(filters.pickup_country, pickupRegionForCities);
    }, [ensureCities, filters.pickup_country, pickupRegionForCities]);

    useEffect(() => {
        if (!filters.dropoff_country || !dropoffRegionForCities) return;
        ensureCities(filters.dropoff_country, dropoffRegionForCities);
    }, [ensureCities, filters.dropoff_country, dropoffRegionForCities]);

    // if >1 region selected -> clear city and disable it
    useEffect(() => {
        if ((filters.pickup_region?.length ?? 0) > 1 && filters.pickup_city) {
            setF({ pickup_city: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.pickup_region]);

    useEffect(() => {
        if ((filters.dropoff_region?.length ?? 0) > 1 && filters.dropoff_city) {
            setF({ dropoff_city: undefined });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters.dropoff_region]);

    // --- options mapping ---
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

    // pickup lists
    const pickupRegions = getRegions(filters.pickup_country);
    const pickupCities = pickupRegionForCities
        ? getCities(filters.pickup_country, pickupRegionForCities)
        : [];

    // dropoff lists
    const dropoffRegions = getRegions(filters.dropoff_country);
    const dropoffCities = dropoffRegionForCities
        ? getCities(filters.dropoff_country, dropoffRegionForCities)
        : [];

    // disabled flags
    const pickupRegionsDisabled =
        !filters.pickup_country ||
        (pickupRegions.length === 0 && geoLoading.regionsFor !== (filters.pickup_country || ""));

    const pickupCitiesDisabled =
        !filters.pickup_country ||
        pickupRegionIds.length !== 1 ||
        !pickupRegionForCities ||
        (pickupCities.length === 0 &&
            geoLoading.citiesFor !== `${filters.pickup_country}/${pickupRegionForCities}`);

    const dropoffRegionsDisabled =
        !filters.dropoff_country ||
        (dropoffRegions.length === 0 && geoLoading.regionsFor !== (filters.dropoff_country || ""));

    const dropoffCitiesDisabled =
        !filters.dropoff_country ||
        dropoffRegionIds.length !== 1 ||
        !dropoffRegionForCities ||
        (dropoffCities.length === 0 &&
            geoLoading.citiesFor !== `${filters.dropoff_country}/${dropoffRegionForCities}`);

    // selected values: countries
    const pickupCountryValue: Option | null = useMemo(
        () => countriesOpts.find((o) => o.id === filters.pickup_country) ?? null,
        [countriesOpts, filters.pickup_country]
    );

    const dropoffCountryValue: Option | null = useMemo(
        () => countriesOpts.find((o) => o.id === filters.dropoff_country) ?? null,
        [countriesOpts, filters.dropoff_country]
    );

    // selected values: regions (multi)
    const pickupRegionOptions = useMemo(
        () => asOptions(pickupRegions),
        [pickupRegions, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const dropoffRegionOptions = useMemo(
        () => asOptions(dropoffRegions),
        [dropoffRegions, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const pickupRegionValue: Option[] = useMemo(
        () => pickupRegionOptions.filter((o) => pickupRegionIds.includes(o.id)),
        [pickupRegionOptions, pickupRegionIds]
    );

    const dropoffRegionValue: Option[] = useMemo(
        () => dropoffRegionOptions.filter((o) => dropoffRegionIds.includes(o.id)),
        [dropoffRegionOptions, dropoffRegionIds]
    );

    // selected values: cities (single; only when exactly one region)
    const pickupCityValue: Option | null = useMemo(() => {
        if (!pickupRegionForCities) return null;
        return asOptions(pickupCities).find((o) => o.id === filters.pickup_city) ?? null;
    }, [pickupCities, filters.pickup_city, pickupRegionForCities, getLocalizedGeoName, i18n.resolvedLanguage]);

    const dropoffCityValue: Option | null = useMemo(() => {
        if (!dropoffRegionForCities) return null;
        return asOptions(dropoffCities).find((o) => o.id === filters.dropoff_city) ?? null;
    }, [dropoffCities, filters.dropoff_city, dropoffRegionForCities, getLocalizedGeoName, i18n.resolvedLanguage]);

    // vehicle types options (multi)
    const vehicleTypes = data?.vehicle_types ?? [];
    const vehicleOpts: Option[] = useMemo(() => {
        return vehicleTypes.map((v) => {
            const lookup = lookups?.vehicleType?.find((l) => l.slug === v.value);
            if (lookup) {
                return { id: v.value, label: getLocalizedLabel(lookup) };
            }
            return { id: v.value, label: v.label };
        });
    }, [vehicleTypes, lookups, getLocalizedLabel]);

    const vehicleIds = filters.vehicle_type ?? [];
    const vehicleValue: Option[] = useMemo(
        () => vehicleOpts.filter((o) => vehicleIds.includes(o.id)),
        [vehicleOpts, vehicleIds]
    );

    // handlers
    const handlePickupCountry = (opt: Option | null) =>
        setF({
            pickup_country: opt?.id,
            pickup_region: undefined,
            pickup_city: undefined,
        });

    const handleDropoffCountry = (opt: Option | null) =>
        setF({
            dropoff_country: opt?.id,
            dropoff_region: undefined,
            dropoff_city: undefined,
        });

    const handlePickupRegions = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_REGIONS);

        // city allowed only if exactly 1 region selected
        const prevSingle = pickupRegionForCities;
        const nextSingle = ids.length === 1 ? ids[0] : undefined;

        const shouldClearCity = ids.length !== 1 || (prevSingle && nextSingle && prevSingle !== nextSingle);

        setF({
            pickup_region: ids.length ? ids : undefined,
            pickup_city: shouldClearCity ? undefined : filters.pickup_city,
        });
    };

    const handleDropoffRegions = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_REGIONS);

        const prevSingle = dropoffRegionForCities;
        const nextSingle = ids.length === 1 ? ids[0] : undefined;

        const shouldClearCity = ids.length !== 1 || (prevSingle && nextSingle && prevSingle !== nextSingle);

        setF({
            dropoff_region: ids.length ? ids : undefined,
            dropoff_city: shouldClearCity ? undefined : filters.dropoff_city,
        });
    };

    const handleVehicleTypes = (opts: Option[]) => {
        const ids = clampIds(opts.map((o) => o.id), MAX_VEHICLES);
        setF({ vehicle_type: ids.length ? ids : undefined });
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 360, p: 2 }}>
                <Typography variant="h6" mb={1}>
                    {t("shipments.filters.title", { defaultValue: "Filters" })}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t("shipments.filters.searchLabel", { defaultValue: "Refine your search results." })}
                </Typography>

                {/* kind */}
                <Stack spacing={1.5}>
                    <Typography variant="subtitle2">
                        {t("shipments.filters.kind", { defaultValue: "Type" })}
                    </Typography>
                    <RadioGroup value={value} onChange={(e) => onChange(e.target.value as ShipmentsKind)}>
                        <FormControlLabel
                            value="cargo"
                            control={<Radio />}
                            label={t("shipments.filters.cargo", { defaultValue: "Cargo" })}
                        />
                        <FormControlLabel
                            value="transport"
                            control={<Radio />}
                            label={t("shipments.filters.transport", { defaultValue: "Transport" })}
                        />
                    </RadioGroup>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {user && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.favorites_only ?? false}
                                onChange={(e) => setF({ favorites_only: e.target.checked })}
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
                    <Autocomplete
                        options={countriesOpts}
                        value={pickupCountryValue}
                        onChange={(_, opt) => handlePickupCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={geoLoading.countries}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.country", { defaultValue: "Country" })}
                            />
                        )}
                    />

                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={pickupRegionOptions}
                        value={pickupRegionValue}
                        onChange={(_, opts) => handlePickupRegions(opts)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        getOptionDisabled={(opt) =>
                            pickupRegionValue.length >= MAX_REGIONS && !pickupRegionIds.includes(opt.id)
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                            />
                        )}
                        loading={geoLoading.regionsFor === (filters.pickup_country || "")}
                        disabled={pickupRegionsDisabled}
                    />

                    <Autocomplete
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF({ pickup_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.city", { defaultValue: "City" })}
                                helperText={
                                    pickupRegionIds.length > 1
                                        ? t("shipments.filters.cityDisabled", { defaultValue: "City is available only when exactly 1 region is selected." })
                                        : undefined
                                }
                            />
                        )}
                        loading={
                            !!pickupRegionForCities &&
                            geoLoading.citiesFor === `${filters.pickup_country}/${pickupRegionForCities}`
                        }
                        disabled={pickupCitiesDisabled}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.from", { defaultValue: "From" })}
                            InputLabelProps={{ shrink: true }}
                            value={filters.pickup_date_from ?? ""}
                            onChange={(e) => setF({ pickup_date_from: e.target.value || undefined })}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="date"
                            label={t("shipments.filters.to", { defaultValue: "To" })}
                            InputLabelProps={{ shrink: true }}
                            value={filters.pickup_date_to ?? ""}
                            onChange={(e) => setF({ pickup_date_to: e.target.value || undefined })}
                        />
                    </Stack>
                </Stack>

                {/* DROPOFF */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.dropoff", { defaultValue: "Dropoff" })}
                </Typography>

                <Stack gap={1.2}>
                    <Autocomplete
                        options={countriesOpts}
                        value={dropoffCountryValue}
                        onChange={(_, opt) => handleDropoffCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        loading={geoLoading.countries}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.country", { defaultValue: "Country" })}
                            />
                        )}
                    />

                    <Autocomplete
                        multiple
                        disableCloseOnSelect
                        options={dropoffRegionOptions}
                        value={dropoffRegionValue}
                        onChange={(_, opts) => handleDropoffRegions(opts)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        getOptionDisabled={(opt) =>
                            dropoffRegionValue.length >= MAX_REGIONS && !dropoffRegionIds.includes(opt.id)
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                            />
                        )}
                        loading={geoLoading.regionsFor === (filters.dropoff_country || "")}
                        disabled={dropoffRegionsDisabled}
                    />

                    <Autocomplete
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF({ dropoff_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                label={t("shipments.filters.city", { defaultValue: "City" })}
                                helperText={
                                    dropoffRegionIds.length > 1
                                        ? t("shipments.filters.cityDisabled", { defaultValue: "City is available only when exactly 1 region is selected." })
                                        : undefined
                                }
                            />
                        )}
                        loading={
                            !!dropoffRegionForCities &&
                            geoLoading.citiesFor === `${filters.dropoff_country}/${dropoffRegionForCities}`
                        }
                        disabled={dropoffCitiesDisabled}
                    />
                </Stack>

                {/* VEHICLE / RANGES */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.vehicle", { defaultValue: "Vehicle" })}
                </Typography>

                <Autocomplete
                    multiple
                    disableCloseOnSelect
                    options={vehicleOpts}
                    value={vehicleValue}
                    onChange={(_, opts) => handleVehicleTypes(opts)}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    getOptionDisabled={(opt) =>
                        vehicleValue.length >= MAX_VEHICLES && !vehicleIds.includes(opt.id)
                    }
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            size="small"
                            label={t("shipments.filters.vehicleType", { defaultValue: "Vehicle type (up to 5)" })}
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
                        inputProps={numericInputProps}
                        value={filters.weight_min ?? ""}
                        onChange={setNum("weight_min")}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        inputProps={numericInputProps}
                        value={filters.weight_max ?? ""}
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
                        inputProps={numericInputProps}
                        value={filters.volume_min ?? ""}
                        onChange={setNum("volume_min")}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        type="text"
                        label={t("shipments.filters.max", { defaultValue: "Max" })}
                        inputProps={numericInputProps}
                        value={filters.volume_max ?? ""}
                        onChange={setNum("volume_max")}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="text" onClick={onReset}>
                        {t("shipments.filters.reset", { defaultValue: "Reset" })}
                    </Button>
                    <Button variant="contained" onClick={onApply}>
                        {t("shipments.filters.apply", { defaultValue: "Apply" })}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
