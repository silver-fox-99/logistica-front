import { useEffect, useMemo, useState } from "react";
import {
    Drawer, Box, Stack, Typography, Divider, TextField, Button, FormControlLabel, Switch,
    type InputBaseComponentProps
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi.ts";
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";

export type PublicFilters = {
    pickup_country?: string;
    pickup_region?: string;
    pickup_city?: string;
    dropoff_country?: string;
    dropoff_region?: string;
    dropoff_city?: string;

    pickup_date_from?: string;
    pickup_date_to?: string;
    dropoff_date_from?: string;
    dropoff_date_to?: string;

    weight_min?: number;
    weight_max?: number;
    volume_min?: number;
    volume_max?: number;
    vehicle_type?: string;
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

type Option = { id: string; label: string; code?: string | null; countryCode?: string | null; stateCode?: string | null };

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
        loading: geoLoading
    } = useGeoCascade();
    
    const getTodayDate = () => {
        const today = new Date();
        return today.toISOString().split('T')[0];
    };

    const getDefaultDatePlus30 = () => {
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date.toISOString().split('T')[0];
    };

    const getInitialFilters = (init?: PublicFilters): PublicFilters => {
        if (init && Object.keys(init).length > 0) {
            const result = { ...init };
            if (!result.pickup_date_from) {
                result.pickup_date_from = getTodayDate();
            }
            if (!result.pickup_date_to) {
                result.pickup_date_to = getDefaultDatePlus30();
            }
            return result;
        }
        return {
            pickup_date_from: getTodayDate(),
            pickup_date_to: getDefaultDatePlus30()
        };
    };

    const [f, setF] = useState<PublicFilters>(getInitialFilters(initial));
    const [filtersData, setFiltersData] = useState<null | {
        vehicle_types: VehicleTypeOption[];
    }>(null);

    useEffect(() => { 
        if (open) {
            setF(getInitialFilters(initial));
        }
    }, [open, initial]);

    useEffect(() => {
        (async () => {
            const data = await publicShipmentsApi.getFilters();
            setFiltersData({ vehicle_types: data?.vehicle_types ?? [] });
        })();
    }, []);

    useEffect(() => {
        if (open) void loadCountries();
    }, [open]);

    useEffect(() => { ensureRegions(f.pickup_country); }, [ensureRegions, f.pickup_country]);
    useEffect(() => { ensureRegions(f.dropoff_country); }, [ensureRegions, f.dropoff_country]);
    useEffect(() => { ensureCities(f.pickup_country, f.pickup_region); }, [ensureCities, f.pickup_country, f.pickup_region]);
    useEffect(() => { ensureCities(f.dropoff_country, f.dropoff_region); }, [ensureCities, f.dropoff_country, f.dropoff_region]);

    const digitsOnly = (v: string) => v.replace(/\D/g, "");
    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = digitsOnly(e.target.value);
        setF(v => ({ ...v, [key]: raw === "" ? undefined : Number(raw) }));
    };
    const numericInputProps: InputBaseComponentProps = { inputMode: "numeric", pattern: "[0-9]*" };

    const onReset = () => setF({
        pickup_date_from: getTodayDate(),
        pickup_date_to: getDefaultDatePlus30()
    });

    const asOptions = (items: GeoImportItem[]): Option[] =>
        items.map(i => ({ id: i.id, label: getLocalizedGeoName(i), code: i.iso2 || i.code, countryCode: i.countryCode, stateCode: (i as any).stateCode || i.code }));
    const countriesOpts = useMemo(() => asOptions(countries), [countries, getLocalizedGeoName, i18n.resolvedLanguage]);

    const pickupRegions = getRegions(f.pickup_country);
    const pickupCities = getCities(f.pickup_country, f.pickup_region);

    const pickupRegionsDisabled = !f.pickup_country || (pickupRegions.length === 0 && geoLoading.regionsFor !== (f.pickup_country || ""));
    const pickupCitiesDisabled  = !f.pickup_country || !f.pickup_region || (pickupCities.length === 0 && geoLoading.citiesFor !== `${f.pickup_country}/${f.pickup_region}`);

    const pickupCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === f.pickup_country) ?? null,
        [countriesOpts, f.pickup_country]
    );
    const pickupRegionValue: Option | null = useMemo(
        () => asOptions(pickupRegions).find(o => o.id === f.pickup_region) ?? null,
        [pickupRegions, f.pickup_region, getLocalizedGeoName, i18n.resolvedLanguage]
    );
    const pickupCityValue: Option | null = useMemo(
        () => asOptions(pickupCities).find(o => o.id === f.pickup_city) ?? null,
        [pickupCities, f.pickup_city, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const dropoffRegions = getRegions(f.dropoff_country);
    const dropoffCities = getCities(f.dropoff_country, f.dropoff_region);

    const dropoffRegionsDisabled = !f.dropoff_country || (dropoffRegions.length === 0 && geoLoading.regionsFor !== (f.dropoff_country || ""));
    const dropoffCitiesDisabled  = !f.dropoff_country || !f.dropoff_region || (dropoffCities.length === 0 && geoLoading.citiesFor !== `${f.dropoff_country}/${f.dropoff_region}`);

    const dropoffCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === f.dropoff_country) ?? null,
        [countriesOpts, f.dropoff_country]
    );
    const dropoffRegionValue: Option | null = useMemo(
        () => asOptions(dropoffRegions).find(o => o.id === f.dropoff_region) ?? null,
        [dropoffRegions, f.dropoff_region, getLocalizedGeoName, i18n.resolvedLanguage]
    );
    const dropoffCityValue: Option | null = useMemo(
        () => asOptions(dropoffCities).find(o => o.id === f.dropoff_city) ?? null,
        [dropoffCities, f.dropoff_city, getLocalizedGeoName, i18n.resolvedLanguage]
    );

    const vehicleTypes = filtersData?.vehicle_types ?? [];
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
        () => vehicleOpts.find(o => o.id === f.vehicle_type) ?? null,
        [vehicleOpts, f.vehicle_type]
    );

    // handlers
    const handlePickupCountry = (opt: Option | null) => {
        setF(v => ({ ...v, pickup_country: opt?.id, pickup_region: undefined, pickup_city: undefined }));
    };
    const handlePickupRegion = (opt: Option | null) => {
        setF(v => ({ ...v, pickup_region: opt?.id, pickup_city: undefined }));
    };

    const handleDropoffCountry = (opt: Option | null) => {
        setF(v => ({ ...v, dropoff_country: opt?.id, dropoff_region: undefined, dropoff_city: undefined }));
    };
    const handleDropoffRegion = (opt: Option | null) => {
        setF(v => ({ ...v, dropoff_region: opt?.id, dropoff_city: undefined }));
    };

    return (
        <Drawer anchor="right" open={open} onClose={onClose}>
            <Box sx={{ width: 360, p: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" fontWeight={700}>{t('shipments.filters.title')}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>
                        {kind === "cargo" ? t('shipments.filters.cargo') : t('shipments.filters.transport')}
                    </Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {user && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={f.favorites_only ?? false}
                                onChange={(e) => setF(v => ({ ...v, favorites_only: e.target.checked }))}
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
                        loading={geoLoading.regionsFor === (f.pickup_country || "")}
                        disabled={pickupRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF(v => ({ ...v, pickup_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        loading={geoLoading.citiesFor === `${f.pickup_country}/${f.pickup_region}`}
                        disabled={pickupCitiesDisabled}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField fullWidth size="small" type="date" label={t('shipments.filters.from')} InputLabelProps={{ shrink: true }}
                                   value={f.pickup_date_from ?? ""} onChange={(e)=>setF(v=>({...v,pickup_date_from:e.target.value||undefined}))}/>
                        <TextField fullWidth size="small" type="date" label={t('shipments.filters.to')} InputLabelProps={{ shrink: true }}
                                   value={f.pickup_date_to ?? ""} onChange={(e)=>setF(v=>({...v,pickup_date_to:e.target.value||undefined}))}/>
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
                        loading={geoLoading.regionsFor === (f.dropoff_country || "")}
                        disabled={dropoffRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF(v => ({ ...v, dropoff_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.city')} />}
                        loading={geoLoading.citiesFor === `${f.dropoff_country}/${f.dropoff_region}`}
                        disabled={dropoffCitiesDisabled}
                    />

                    {/*<Stack direction="row" gap={1.2}>*/}
                    {/*    <TextField fullWidth size="small" type="date" label="From" InputLabelProps={{ shrink: true }}*/}
                    {/*               value={f.dropoff_date_from ?? ""} onChange={(e)=>setF(v=>({...v,dropoff_date_from:e.target.value||undefined}))}/>*/}
                    {/*    <TextField fullWidth size="small" type="date" label="To" InputLabelProps={{ shrink: true }}*/}
                    {/*               value={f.dropoff_date_to ?? ""} onChange={(e)=>setF(v=>({...v,dropoff_date_to:e.target.value||undefined}))}/>*/}
                    {/*</Stack>*/}
                </Stack>

                {/* VEHICLE */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.vehicle')}</Typography>
                <Autocomplete
                    options={vehicleOpts}
                    value={vehicleValue}
                    onChange={(_, opt) => setF(v => ({ ...v, vehicle_type: opt?.id }))}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    renderInput={(params) => <TextField {...params} size="small" label={t('shipments.filters.vehicleType')} />}
                />

                {/* WEIGHT */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.weight')}</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="text" label={t('shipments.filters.min')} inputProps={numericInputProps}
                               value={f.weight_min ?? ""} onChange={setNum("weight_min")}/>
                    <TextField fullWidth size="small" type="text" label={t('shipments.filters.max')} inputProps={numericInputProps}
                               value={f.weight_max ?? ""} onChange={setNum("weight_max")}/>
                </Stack>

                {/* VOLUME */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>{t('shipments.filters.volume')}</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="text" label={t('shipments.filters.min')} inputProps={numericInputProps}
                               value={f.volume_min ?? ""} onChange={setNum("volume_min")}/>
                    <TextField fullWidth size="small" type="text" label={t('shipments.filters.max')} inputProps={numericInputProps}
                               value={f.volume_max ?? ""} onChange={setNum("volume_max")}/>
                </Stack>

                <Stack direction="row" gap={1} sx={{ mt: 3 }}>
                    <Button fullWidth variant="contained" startIcon={<FiFilter />} onClick={() => onApply(f)}>{t('shipments.filters.apply')}</Button>
                    <Button fullWidth variant="outlined" startIcon={<FiRefreshCw />} onClick={onReset}>{t('shipments.filters.reset')}</Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
