import { useEffect, useMemo, useState } from "react";
import {
    Drawer, Box, Stack, Typography, Divider, TextField, Button
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import { FiFilter, FiRefreshCw } from "react-icons/fi";
import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi.ts";

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
};

type Props = {
    open: boolean;
    initial?: PublicFilters;
    onClose: () => void;
    onApply: (f: PublicFilters) => void;
    kind: "cargo" | "transport";
};

type Geo = {
    id: string;
    parent_id: string | null;
    type: "COUNTRY" | "REGION" | "CITY";
    name: string;
    code: string | null;
    iso2: string | null;
    slug: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

type VehicleTypeOption = { value: string; label: string };

type Option = { id: string; label: string };

export function PublicFiltersDrawer({ open, initial, onClose, onApply, kind }: Props) {
    const [f, setF] = useState<PublicFilters>(initial ?? {});
    const [filtersData, setFiltersData] = useState<null | {
        geos: Geo[];
        vehicle_types: VehicleTypeOption[];
    }>(null);

    useEffect(() => { if (open) setF(initial ?? {}); }, [open, initial]);

    useEffect(() => {
        (async () => {
            const data = await publicShipmentsApi.getFilters();
            setFiltersData(data);
        })();
    }, []);

    const setNum = (key: keyof PublicFilters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value;
        setF(v => ({ ...v, [key]: raw === "" ? undefined : Number(raw) }));
    };

    const onReset = () => setF({});

    // ===== GEO helpers =====
    const geos = filtersData?.geos ?? [];
    const countries = useMemo(() => geos.filter(g => g.type === "COUNTRY" && g.is_active), [geos]);
    const regionsByCountry = (countryId?: string) =>
        geos.filter(g => g.type === "REGION" && g.parent_id === (countryId ?? "") && g.is_active);
    const citiesByParent = (parentId?: string) =>
        geos.filter(g => g.type === "CITY" && g.parent_id === (parentId ?? "") && g.is_active);

    // options mappers
    const asOptions = (items: Geo[]): Option[] => items.map(i => ({ id: i.id, label: i.name }));
    const countriesOpts = useMemo(() => asOptions(countries), [countries]);

    // PICKUP lists + disable rules
    const pickupRegions = useMemo(() => regionsByCountry(f.pickup_country), [geos, f.pickup_country]);
    const pickupCities = useMemo(() => {
        if (!f.pickup_country) return [];
        if (pickupRegions.length === 0) return [];
        if (!f.pickup_region) return [];
        return citiesByParent(f.pickup_region);
    }, [geos, f.pickup_country, f.pickup_region, pickupRegions]);

    const pickupRegionsDisabled = !f.pickup_country || pickupRegions.length === 0;
    const pickupCitiesDisabled  = !f.pickup_country || pickupRegions.length === 0 || !f.pickup_region;

    const pickupCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === f.pickup_country) ?? null,
        [countriesOpts, f.pickup_country]
    );
    const pickupRegionValue: Option | null = useMemo(
        () => asOptions(pickupRegions).find(o => o.id === f.pickup_region) ?? null,
        [pickupRegions, f.pickup_region]
    );
    const pickupCityValue: Option | null = useMemo(
        () => asOptions(pickupCities).find(o => o.id === f.pickup_city) ?? null,
        [pickupCities, f.pickup_city]
    );

    // DROPOFF lists + disable rules
    const dropoffRegions = useMemo(() => regionsByCountry(f.dropoff_country), [geos, f.dropoff_country]);
    const dropoffCities = useMemo(() => {
        if (!f.dropoff_country) return [];
        if (dropoffRegions.length === 0) return [];
        if (!f.dropoff_region) return [];
        return citiesByParent(f.dropoff_region);
    }, [geos, f.dropoff_country, f.dropoff_region, dropoffRegions]);

    const dropoffRegionsDisabled = !f.dropoff_country || dropoffRegions.length === 0;
    const dropoffCitiesDisabled  = !f.dropoff_country || dropoffRegions.length === 0 || !f.dropoff_region;

    const dropoffCountryValue: Option | null = useMemo(
        () => countriesOpts.find(o => o.id === f.dropoff_country) ?? null,
        [countriesOpts, f.dropoff_country]
    );
    const dropoffRegionValue: Option | null = useMemo(
        () => asOptions(dropoffRegions).find(o => o.id === f.dropoff_region) ?? null,
        [dropoffRegions, f.dropoff_region]
    );
    const dropoffCityValue: Option | null = useMemo(
        () => asOptions(dropoffCities).find(o => o.id === f.dropoff_city) ?? null,
        [dropoffCities, f.dropoff_city]
    );

    // VEHICLE
    const vehicleTypes = filtersData?.vehicle_types ?? [];
    const vehicleOpts: Option[] = useMemo(
        () => vehicleTypes.map(v => ({ id: v.value, label: v.label })),
        [vehicleTypes]
    );
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
                    <Typography variant="h6" fontWeight={700}>Filters</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textTransform: "capitalize" }}>{kind}</Typography>
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* PICKUP */}
                <Typography variant="subtitle2" gutterBottom>Pickup</Typography>
                <Stack gap={1.2}>
                    <Autocomplete
                        options={countriesOpts}
                        value={pickupCountryValue}
                        onChange={(_, opt) => handlePickupCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="Country" />}
                    />
                    <Autocomplete
                        options={asOptions(pickupRegions)}
                        value={pickupRegionValue}
                        onChange={(_, opt) => handlePickupRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="Region" />}
                        disabled={pickupRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(pickupCities)}
                        value={pickupCityValue}
                        onChange={(_, opt) => setF(v => ({ ...v, pickup_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="City" />}
                        disabled={pickupCitiesDisabled}
                    />

                    <Stack direction="row" gap={1.2}>
                        <TextField fullWidth size="small" type="date" label="From" InputLabelProps={{ shrink: true }}
                                   value={f.pickup_date_from ?? ""} onChange={(e)=>setF(v=>({...v,pickup_date_from:e.target.value||undefined}))}/>
                        <TextField fullWidth size="small" type="date" label="To" InputLabelProps={{ shrink: true }}
                                   value={f.pickup_date_to ?? ""} onChange={(e)=>setF(v=>({...v,pickup_date_to:e.target.value||undefined}))}/>
                    </Stack>
                </Stack>

                {/* DROPOFF */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Dropoff</Typography>
                <Stack gap={1.2}>
                    <Autocomplete
                        options={countriesOpts}
                        value={dropoffCountryValue}
                        onChange={(_, opt) => handleDropoffCountry(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="Country" />}
                    />
                    <Autocomplete
                        options={asOptions(dropoffRegions)}
                        value={dropoffRegionValue}
                        onChange={(_, opt) => handleDropoffRegion(opt)}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="Region" />}
                        disabled={dropoffRegionsDisabled}
                    />
                    <Autocomplete
                        options={asOptions(dropoffCities)}
                        value={dropoffCityValue}
                        onChange={(_, opt) => setF(v => ({ ...v, dropoff_city: opt?.id }))}
                        isOptionEqualToValue={(o, v) => o.id === v.id}
                        renderInput={(params) => <TextField {...params} size="small" label="City" />}
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
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Vehicle</Typography>
                <Autocomplete
                    options={vehicleOpts}
                    value={vehicleValue}
                    onChange={(_, opt) => setF(v => ({ ...v, vehicle_type: opt?.id }))}
                    isOptionEqualToValue={(o, v) => o.id === v.id}
                    renderInput={(params) => <TextField {...params} size="small" label="Vehicle type" />}
                />

                {/* WEIGHT */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Weight (t)</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="number" label="Min" inputProps={{ step: "0.001", min: 0 }}
                               value={f.weight_min ?? ""} onChange={setNum("weight_min")}/>
                    <TextField fullWidth size="small" type="number" label="Max" inputProps={{ step: "0.001", min: 0 }}
                               value={f.weight_max ?? ""} onChange={setNum("weight_max")}/>
                </Stack>

                {/* VOLUME */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>Volume (m³)</Typography>
                <Stack direction="row" gap={1.2}>
                    <TextField fullWidth size="small" type="number" label="Min" inputProps={{ step: "0.001", min: 0 }}
                               value={f.volume_min ?? ""} onChange={setNum("volume_min")}/>
                    <TextField fullWidth size="small" type="number" label="Max" inputProps={{ step: "0.001", min: 0 }}
                               value={f.volume_max ?? ""} onChange={setNum("volume_max")}/>
                </Stack>

                <Stack direction="row" gap={1} sx={{ mt: 3 }}>
                    <Button fullWidth variant="contained" startIcon={<FiFilter />} onClick={() => onApply(f)}>Apply</Button>
                    <Button fullWidth variant="outlined" startIcon={<FiRefreshCw />} onClick={onReset}>Reset</Button>
                </Stack>
            </Box>
        </Drawer>
    );
}
