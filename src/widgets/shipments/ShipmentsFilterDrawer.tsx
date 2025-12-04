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
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

type VehicleTypeOption = { value: string; label: string };
type Option = { id: string; label: string; code?: string | null; countryCode?: string | null; stateCode?: string | null };

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
    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading: geoLoading
    } = useGeoCascade();
    const [data, setData] = useState<null | { vehicle_types: VehicleTypeOption[] }>(null);

    // при открытии можно подмешать актуальные (если не загружали раньше)
    useEffect(() => {
        if (!open || data) return;
        (async () => {
            const res = await publicShipmentsApi.getFilters();
            setData({ vehicle_types: res?.vehicle_types ?? [] });
        })();
    }, [open, data]);

    useEffect(() => { if (open) void loadCountries(); }, [open]);
    useEffect(() => { ensureRegions(filters.pickup_country); }, [ensureRegions, filters.pickup_country]);
    useEffect(() => { ensureRegions(filters.dropoff_country); }, [ensureRegions, filters.dropoff_country]);
    useEffect(() => { ensureCities(filters.pickup_country, filters.pickup_region); }, [ensureCities, filters.pickup_country, filters.pickup_region]);
    useEffect(() => { ensureCities(filters.dropoff_country, filters.dropoff_region); }, [ensureCities, filters.dropoff_country, filters.dropoff_region]);

    const setF = (patch: Partial<PublicFilters>) => onFiltersChange({ ...filters, ...patch });
    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setF({ [key]: raw === "" ? undefined : Number(raw) } as any);
    };

    const asOptions = (items: GeoImportItem[]): Option[] =>
        items.map(i => ({ id: i.id, label: getLocalizedGeoName(i), code: i.iso2 || i.code, countryCode: i.countryCode, stateCode: (i as any).stateCode || i.code }));
    const countriesOpts = useMemo(() => asOptions(countries), [countries, getLocalizedGeoName, i18n.resolvedLanguage]);

    const pickupRegions = getRegions(filters.pickup_country);
    const pickupCities  = getCities(filters.pickup_country, filters.pickup_region);

    const pickupRegionsDisabled = !filters.pickup_country || (pickupRegions.length === 0 && geoLoading.regionsFor !== (filters.pickup_country || ""));
    const pickupCitiesDisabled  = !filters.pickup_country || !filters.pickup_region || (pickupCities.length === 0 && geoLoading.citiesFor !== `${filters.pickup_country}/${filters.pickup_region}`);

    const dropoffRegions = getRegions(filters.dropoff_country);
    const dropoffCities  = getCities(filters.dropoff_country, filters.dropoff_region);

    const dropoffRegionsDisabled = !filters.dropoff_country || (dropoffRegions.length === 0 && geoLoading.regionsFor !== (filters.dropoff_country || ""));
    const dropoffCitiesDisabled  = !filters.dropoff_country || !filters.dropoff_region || (dropoffCities.length === 0 && geoLoading.citiesFor !== `${filters.dropoff_country}/${filters.dropoff_region}`);

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
                        loading={geoLoading.countries}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.country')} />}
                    />
                    <Autocomplete
                        options={asOptions(pickupRegions)}
                        value={pickupRegionValue}
                        onChange={(_, opt) => handlePickupRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.region')} />}
                        loading={geoLoading.regionsFor === (filters.pickup_country || "")}
                        disabled={pickupRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF({ pickup_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        loading={geoLoading.citiesFor === `${filters.pickup_country}/${filters.pickup_region}`}
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
                        loading={geoLoading.countries}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.country')} />}
                    />
                    <Autocomplete
                        options={asOptions(dropoffRegions)}
                        value={dropoffRegionValue}
                        onChange={(_, opt) => handleDropoffRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.region')} />}
                        loading={geoLoading.regionsFor === (filters.dropoff_country || "")}
                        disabled={dropoffRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF({ dropoff_city: opt?.id })}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        loading={geoLoading.citiesFor === `${filters.dropoff_country}/${filters.dropoff_region}`}
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
