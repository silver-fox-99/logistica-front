import { useEffect, useMemo, useState } from "react";
import {
    Drawer, Box, Stack, Typography, RadioGroup, FormControlLabel, Radio,
    Button, Divider, TextField, Switch
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { useTranslation } from "react-i18next";

import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import type {ShipmentsKind} from "@/entities/shipment/model/type.ts";
import type {PublicFilters} from "@/widgets/public/PublicFiltersDrawer.tsx";
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";


type Geo = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    name_ru?: string | null;
    name_uz?: string | null;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    order?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

function sortByOrder(a: Geo, b: Geo): number {
    const orderA = a.order ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.order ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
        return orderA - orderB;
    }
    return a.name.localeCompare(b.name);
}

type VehicleTypeOption = { value: string; label: string };
type Option = { id: string; label: string };

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

export default function ShipmentsFilterDrawer({
                                                  open, value, onChange, filters, onFiltersChange, onClose, onApply, onReset
                                              }: Props) {
    const { t, i18n } = useTranslation();
    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();
    const user = useUserStore((s) => s.user);
    const [data, setData] = useState<null | { geos: Geo[]; vehicle_types: VehicleTypeOption[] }>(null);

    // при открытии можно подмешать актуальные (если не загружали раньше)
    useEffect(() => {
        if (!open || data) return;
        (async () => {
            const res = await publicShipmentsApi.getFilters();
            setData(res);
        })();
    }, [open, data]);

    const setF = (patch: Partial<PublicFilters>) => onFiltersChange({ ...filters, ...patch });
    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setF({ [key]: raw === "" ? undefined : Number(raw) } as any);
    };

    const geos = data?.geos ?? [];
    const countries = useMemo(() => {
        const filtered = geos.filter(g => g.type === "COUNTRY" && g.is_active);
        return [...filtered].sort(sortByOrder);
    }, [geos]);
    const regionsByCountry = (countryId?: string) => {
        const filtered = geos.filter(g => g.type === "REGION" && g.parent_id === (countryId ?? "") && g.is_active);
        return [...filtered].sort(sortByOrder);
    };
    const citiesByParent = (parentId?: string) => {
        const filtered = geos.filter(g => g.type === "CITY" && g.parent_id === (parentId ?? "") && g.is_active);
        return [...filtered].sort(sortByOrder);
    };

    const asOptions = (items: Geo[]): Option[] => items.map(i => ({ id: i.id, label: getLocalizedGeoName(i) }));
    const countriesOpts = useMemo(() => asOptions(countries), [countries, getLocalizedGeoName, i18n.resolvedLanguage]);

    const pickupRegions = useMemo(() => regionsByCountry(filters.pickup_country), [geos, filters.pickup_country]);
    const pickupCities  = useMemo(() => {
        if (!filters.pickup_country) return [];
        if (pickupRegions.length === 0) return [];
        if (!filters.pickup_region) return [];
        return citiesByParent(filters.pickup_region);
    }, [geos, filters.pickup_country, filters.pickup_region, pickupRegions]);

    const pickupRegionsDisabled = !filters.pickup_country || pickupRegions.length === 0;
    const pickupCitiesDisabled  = !filters.pickup_country || pickupRegions.length === 0 || !filters.pickup_region;

    const dropoffRegions = useMemo(() => regionsByCountry(filters.dropoff_country), [geos, filters.dropoff_country]);
    const dropoffCities  = useMemo(() => {
        if (!filters.dropoff_country) return [];
        if (dropoffRegions.length === 0) return [];
        if (!filters.dropoff_region) return [];
        return citiesByParent(filters.dropoff_region);
    }, [geos, filters.dropoff_country, filters.dropoff_region, dropoffRegions]);

    const dropoffRegionsDisabled = !filters.dropoff_country || dropoffRegions.length === 0;
    const dropoffCitiesDisabled  = !filters.dropoff_country || dropoffRegions.length === 0 || !filters.dropoff_region;

    // selected values
    const pickupCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === filters.pickup_country) ?? null, [countriesOpts, filters.pickup_country]
    );
    const pickupRegionValue: Option | null = useMemo(
        () => asOptions(pickupRegions).find(o => o.id === filters.pickup_region) ?? null, 
        [pickupRegions, filters.pickup_region, getLocalizedGeoName, i18n.resolvedLanguage]
    );
    const pickupCityValue: Option | null = useMemo(
        () => asOptions(pickupCities).find(o => o.id === filters.pickup_city) ?? null, 
        [pickupCities, filters.pickup_city, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const dropoffCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === filters.dropoff_country) ?? null, [countriesOpts, filters.dropoff_country]
    );
    const dropoffRegionValue: Option | null = useMemo(
        () => asOptions(dropoffRegions).find(o => o.id === filters.dropoff_region) ?? null, 
        [dropoffRegions, filters.dropoff_region, getLocalizedGeoName, i18n.resolvedLanguage]
    );
    const dropoffCityValue: Option | null = useMemo(
        () => asOptions(dropoffCities).find(o => o.id === filters.dropoff_city) ?? null, 
        [dropoffCities, filters.dropoff_city, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const vehicleTypes = data?.vehicle_types ?? [];
    const vehicleOpts: Option[] = useMemo(() => {
        return vehicleTypes.map(v => {
            const lookup = lookups?.vehicleType?.find(l => l.slug === v.value);
            if (lookup) {
                return {
                    id: v.value,
                    label: getLocalizedLabel(lookup)
                };
            }
            return { id: v.value, label: v.label };
        });
    }, [vehicleTypes, lookups, getLocalizedLabel]);
    const vehicleValue: Option | null = useMemo(
        () => vehicleOpts.find(o => o.id === filters.vehicle_type) ?? null, [vehicleOpts, filters.vehicle_type]
    );

    // handlers
    const handlePickupCountry = (opt: Option | null) => setF({ pickup_country: opt?.id, pickup_region: undefined, pickup_city: undefined });
    const handlePickupRegion  = (opt: Option | null) => setF({ pickup_region: opt?.id, pickup_city: undefined });
    const handleDropoffCountry = (opt: Option | null) => setF({ dropoff_country: opt?.id, dropoff_region: undefined, dropoff_city: undefined });
    const handleDropoffRegion  = (opt: Option | null) => setF({ dropoff_region: opt?.id, dropoff_city: undefined });

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 360, p: 2 }}>
                <Typography variant="h6" mb={1}>{t('shipments.filters.title')}</Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('shipments.filters.searchLabel')}
                </Typography>

                {/* тип списка */}
                <Stack spacing={1.5}>
                    <Typography variant="subtitle2">{t('shipments.filters.title')}</Typography>
                    <RadioGroup value={value} onChange={(e) => onChange(e.target.value as ShipmentsKind)}>
                        <FormControlLabel value="cargo" control={<Radio />} label={t('shipments.filters.cargo')} />
                        <FormControlLabel value="transport" control={<Radio />} label={t('shipments.filters.transport')} />
                    </RadioGroup>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {user && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={filters.favorites_only ?? false}
                                onChange={(e) => onFiltersChange({ ...filters, favorites_only: e.target.checked })}
                            />
                        }
                        label={t('shipments.filters.favorites')}
                        sx={{ mb: 2 }}
                    />
                )}

                {/* PICKUP */}
                <Typography variant="subtitle2" gutterBottom>{t('shipments.filters.pickup')}</Typography>
                <Stack gap={1.2}>
                    <Autocomplete
                        options={countriesOpts}
                        value={pickupCountryValue}
                        onChange={(_, opt) => handlePickupCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.country')} />}
                    />
                    <Autocomplete
                        options={asOptions(pickupRegions)}
                        value={pickupRegionValue}
                        onChange={(_, opt) => handlePickupRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.region')} />}
                        disabled={pickupRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF({ pickup_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        disabled={pickupCitiesDisabled}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField fullWidth size="small" type="date" label={t('shipments.filters.from')} InputLabelProps={{ shrink: true }}
                                   value={filters.pickup_date_from ?? ""} onChange={(e) => setF({ pickup_date_from: e.target.value || undefined })}/>
                        <TextField fullWidth size="small" type="date" label={t('shipments.filters.to')} InputLabelProps={{ shrink: true }}
                                   value={filters.pickup_date_to ?? ""} onChange={(e) => setF({ pickup_date_to: e.target.value || undefined })}/>
                    </Stack>
                </Stack>

                {/* DROPOFF */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.dropoff')}</Typography>
                <Stack gap={1.2}>
                    <Autocomplete
                        options={countriesOpts}
                        value={dropoffCountryValue}
                        onChange={(_, opt) => handleDropoffCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.country')} />}
                    />
                    <Autocomplete
                        options={asOptions(dropoffRegions)}
                        value={dropoffRegionValue}
                        onChange={(_, opt) => handleDropoffRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.region')} />}
                        disabled={dropoffRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF({ dropoff_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        disabled={dropoffCitiesDisabled}
                    />

                    {/*<Stack direction="row" gap={1.2}>*/}
                    {/*    <TextField fullWidth size="small" type="date" label="From" InputLabelProps={{ shrink: true }}*/}
                    {/*               value={filters.dropoff_date_from ?? ""} onChange={(e) => setF({ dropoff_date_from: e.target.value || undefined })}/>*/}
                    {/*    <TextField fullWidth size="small" type="date" label="To" InputLabelProps={{ shrink: true }}*/}
                    {/*               value={filters.dropoff_date_to ?? ""} onChange={(e) => setF({ dropoff_date_to: e.target.value || undefined })}/>*/}
                    {/*</Stack>*/}
                </Stack>

                {/* VEHICLE / RANGES */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.vehicle')}</Typography>
                <Autocomplete
                    options={vehicleOpts}
                    value={vehicleValue}
                    onChange={(_, opt) => setF({ vehicle_type: opt?.id })}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.vehicleType')} />}
                />

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.weight')}</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="number" label={t('shipments.filters.min')} inputProps={{ step: "0.001", min: 0 }}
                               value={filters.weight_min ?? ""} onChange={setNum("weight_min")}/>
                    <TextField fullWidth size="small" type="number" label={t('shipments.filters.max')} inputProps={{ step: "0.001", min: 0 }}
                               value={filters.weight_max ?? ""} onChange={setNum("weight_max")}/>
                </Stack>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.volume')}</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="number" label={t('shipments.filters.min')} inputProps={{ step: "0.001", min: 0 }}
                               value={filters.volume_min ?? ""} onChange={setNum("volume_min")}/>
                    <TextField fullWidth size="small" type="number" label={t('shipments.filters.max')} inputProps={{ step: "0.001", min: 0 }}
                               value={filters.volume_max ?? ""} onChange={setNum("volume_max")}/>
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="text" onClick={onReset}>{t('shipments.filters.reset')}</Button>
                    <Button variant="contained" onClick={onApply}>{t('shipments.filters.apply')}</Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
