import React, { useEffect, useMemo } from "react";
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
} from "@mui/material";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicFilters } from "@/widgets/public/PublicFiltersDrawer";

import { publicShipmentsApi } from "@/shared/api/publicShipmentsApi";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import type { GeoImportItem } from "@/shared/api/geoImportApi";
import { useLocalizedGeo, useLocalizedLookup } from "@/shared/utils/lookupUtils";

import type { IdOption } from "@/shared/ui/lookup/IdAutocomplete";
import { RHFIdAutocomplete } from "@/shared/ui/lookup/RHFIdAutocomplete";
import { RHFIdMultiAutocomplete } from "@/shared/ui/lookup/RHFIdMultiAutocomplete";

type VehicleTypeOption = { value: string; label: string };

type FormValues = PublicFilters & { kind: ShipmentsKind };

type Props = {
    open: boolean;
    initialKind: ShipmentsKind;
    initialFilters: PublicFilters;

    onClose: () => void;
    onApply: (kind: ShipmentsKind, filters: PublicFilters) => void;
};

const MAX_REGIONS = 3;
const MAX_VEHICLES = 5;

const DEFAULT_KIND: ShipmentsKind = "cargo";
const DEFAULT_FILTERS: PublicFilters = {};

const digitsOnly = (v: string) => v.replace(/\D/g, "");

export const ShipmentsFilterDrawerForm = React.memo(function ShipmentsFilterDrawerForm({
                                                                                           open,
                                                                                           initialKind,
                                                                                           initialFilters,
                                                                                           onClose,
                                                                                           onApply,
                                                                                       }: Props) {
    const { t, i18n } = useTranslation();
    const user = useUserStore((s) => s.user);

    const { getLocalizedGeoName } = useLocalizedGeo();
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups } = useInitStore();

    const {
        countries,
        getRegions,
        getCities,
        loadCountries,
        ensureRegions,
        ensureCities,
        loading: geoLoading,
    } = useGeoCascade();

    const { control, reset, handleSubmit, setValue } = useForm<FormValues>({
        defaultValues: { kind: initialKind, ...(initialFilters as any) },
    });

    // reset draft on open
    useEffect(() => {
        if (!open) return;
        reset({ kind: initialKind, ...(initialFilters as any) });
    }, [open, reset, initialKind, initialFilters]);

    // preload geo
    useEffect(() => {
        if (open) void loadCountries();
    }, [open, loadCountries]);

    // load vehicle filters once per open (или один раз вообще — по желанию)
    const [vehicleTypes, setVehicleTypes] = React.useState<VehicleTypeOption[]>([]);
    useEffect(() => {
        if (!open) return;
        if (vehicleTypes.length) return;

        (async () => {
            try {
                const res = await publicShipmentsApi.getFilters();
                setVehicleTypes(res?.vehicle_types ?? []);
            } catch (e) {
                console.error(e);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const vehicleOpts: IdOption[] = useMemo(() => {
        return vehicleTypes.map((v) => {
            const lookup = lookups?.vehicleType?.find((l) => l.slug === v.value);
            return { id: v.value, label: lookup ? getLocalizedLabel(lookup) : v.label };
        });
    }, [vehicleTypes, lookups, getLocalizedLabel, i18n.resolvedLanguage]);

    const asGeoOptions = (items: GeoImportItem[]): IdOption[] =>
        items.map((i) => ({
            id: i.id,
            label: getLocalizedGeoName(i),
        }));

    const countriesOpts = useMemo(() => asGeoOptions(countries), [countries, i18n.resolvedLanguage]);

    // watch dependencies
    const pickupCountry = useWatch({ control, name: "pickup_country" });
    const dropoffCountry = useWatch({ control, name: "dropoff_country" });

    const pickupRegionIds = useWatch({ control, name: "pickup_region" }) ?? [];
    const dropoffRegionIds = useWatch({ control, name: "dropoff_region" }) ?? [];

    const pickupRegionForCities = Array.isArray(pickupRegionIds) && pickupRegionIds.length === 1 ? pickupRegionIds[0] : undefined;
    const dropoffRegionForCities = Array.isArray(dropoffRegionIds) && dropoffRegionIds.length === 1 ? dropoffRegionIds[0] : undefined;

    // ensure regions
    useEffect(() => {
        ensureRegions(pickupCountry);
    }, [ensureRegions, pickupCountry]);

    useEffect(() => {
        ensureRegions(dropoffCountry);
    }, [ensureRegions, dropoffCountry]);

    // ensure cities only when exactly 1 region selected
    useEffect(() => {
        if (!pickupCountry || !pickupRegionForCities) return;
        ensureCities(pickupCountry, pickupRegionForCities);
    }, [ensureCities, pickupCountry, pickupRegionForCities]);

    useEffect(() => {
        if (!dropoffCountry || !dropoffRegionForCities) return;
        ensureCities(dropoffCountry, dropoffRegionForCities);
    }, [ensureCities, dropoffCountry, dropoffRegionForCities]);

    // clear city if > 1 region selected
    useEffect(() => {
        if ((pickupRegionIds?.length ?? 0) > 1) setValue("pickup_city", undefined);
    }, [pickupRegionIds, setValue]);

    useEffect(() => {
        if ((dropoffRegionIds?.length ?? 0) > 1) setValue("dropoff_city", undefined);
    }, [dropoffRegionIds, setValue]);

    const pickupRegions = getRegions(pickupCountry);
    const dropoffRegions = getRegions(dropoffCountry);

    const pickupRegionOptions = useMemo(() => asGeoOptions(pickupRegions), [pickupRegions, i18n.resolvedLanguage]);
    const dropoffRegionOptions = useMemo(() => asGeoOptions(dropoffRegions), [dropoffRegions, i18n.resolvedLanguage]);

    const pickupCities = pickupRegionForCities ? getCities(pickupCountry, pickupRegionForCities) : [];
    const dropoffCities = dropoffRegionForCities ? getCities(dropoffCountry, dropoffRegionForCities) : [];

    const pickupCityOptions = useMemo(() => asGeoOptions(pickupCities), [pickupCities, i18n.resolvedLanguage]);
    const dropoffCityOptions = useMemo(() => asGeoOptions(dropoffCities), [dropoffCities, i18n.resolvedLanguage]);

    const pickupRegionsDisabled =
        !pickupCountry || (pickupRegions.length === 0 && geoLoading.regionsFor !== (pickupCountry || ""));

    const pickupCitiesDisabled =
        !pickupCountry ||
        pickupRegionIds.length !== 1 ||
        !pickupRegionForCities ||
        (pickupCities.length === 0 && geoLoading.citiesFor !== `${pickupCountry}/${pickupRegionForCities}`);

    const dropoffRegionsDisabled =
        !dropoffCountry || (dropoffRegions.length === 0 && geoLoading.regionsFor !== (dropoffCountry || ""));

    const dropoffCitiesDisabled =
        !dropoffCountry ||
        dropoffRegionIds.length !== 1 ||
        !dropoffRegionForCities ||
        (dropoffCities.length === 0 && geoLoading.citiesFor !== `${dropoffCountry}/${dropoffRegionForCities}`);

    const submit = handleSubmit((values) => {
        const { kind, ...filters } = values;
        onApply(kind, filters);
    });

    const handleReset = () => {
        reset({ kind: DEFAULT_KIND, ...(DEFAULT_FILTERS as any) });
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            ModalProps={{ keepMounted: true }} // снижает стоимость mount/unmount
        >
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

                    <Controller
                        control={control}
                        name="kind"
                        render={({ field }) => (
                            <RadioGroup value={field.value} onChange={(e) => field.onChange(e.target.value as ShipmentsKind)}>
                                <FormControlLabel value="cargo" control={<Radio />} label={t("shipments.filters.cargo", { defaultValue: "Cargo" })} />
                                <FormControlLabel value="transport" control={<Radio />} label={t("shipments.filters.transport", { defaultValue: "Transport" })} />
                            </RadioGroup>
                        )}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                {user && (
                    <Controller
                        control={control}
                        name="favorites_only"
                        render={({ field }) => (
                            <FormControlLabel
                                control={<Switch checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
                                label={t("shipments.filters.favorites", { defaultValue: "Favorites only" })}
                                sx={{ mb: 2 }}
                            />
                        )}
                    />
                )}

                {/* PICKUP */}
                <Typography variant="subtitle2" gutterBottom>
                    {t("shipments.filters.pickup", { defaultValue: "Pickup" })}
                </Typography>

                <Stack gap={1.2}>
                    <RHFIdAutocomplete control={control} name={"pickup_country" as any} label={t("shipments.filters.country", { defaultValue: "Country" })} options={countriesOpts} loading={geoLoading.countries} />

                    <RHFIdMultiAutocomplete
                        control={control}
                        name={"pickup_region" as any}
                        label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                        options={pickupRegionOptions}
                        maxSelected={MAX_REGIONS}
                        loading={geoLoading.regionsFor === (pickupCountry || "")}
                        disabled={pickupRegionsDisabled}
                    />

                    <RHFIdAutocomplete
                        control={control}
                        name={"pickup_city" as any}
                        label={t("shipments.filters.city", { defaultValue: "City" })}
                        options={pickupCityOptions}
                        loading={!!pickupRegionForCities && geoLoading.citiesFor === `${pickupCountry}/${pickupRegionForCities}`}
                        disabled={pickupCitiesDisabled}
                        helperText={
                            pickupRegionIds.length > 1
                                ? t("shipments.filters.cityDisabled", { defaultValue: "City is available only when exactly 1 region is selected." })
                                : undefined
                        }
                    />

                    <Stack direction="row" gap={1.2}>
                        <Controller
                            control={control}
                            name="pickup_date_from"
                            render={({ field }) => (
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="date"
                                    label={t("shipments.filters.from", { defaultValue: "From" })}
                                    InputLabelProps={{ shrink: true }}
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
                                    InputLabelProps={{ shrink: true }}
                                    value={field.value ?? ""}
                                    onChange={(e) => field.onChange(e.target.value || undefined)}
                                />
                            )}
                        />
                    </Stack>
                </Stack>

                {/* DROPOFF */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.dropoff", { defaultValue: "Dropoff" })}
                </Typography>

                <Stack gap={1.2}>
                    <RHFIdAutocomplete control={control} name={"dropoff_country" as any} label={t("shipments.filters.country", { defaultValue: "Country" })} options={countriesOpts} loading={geoLoading.countries} />

                    <RHFIdMultiAutocomplete
                        control={control}
                        name={"dropoff_region" as any}
                        label={t("shipments.filters.region", { defaultValue: "Region (up to 3)" })}
                        options={dropoffRegionOptions}
                        maxSelected={MAX_REGIONS}
                        loading={geoLoading.regionsFor === (dropoffCountry || "")}
                        disabled={dropoffRegionsDisabled}
                    />

                    <RHFIdAutocomplete
                        control={control}
                        name={"dropoff_city" as any}
                        label={t("shipments.filters.city", { defaultValue: "City" })}
                        options={dropoffCityOptions}
                        loading={!!dropoffRegionForCities && geoLoading.citiesFor === `${dropoffCountry}/${dropoffRegionForCities}`}
                        disabled={dropoffCitiesDisabled}
                        helperText={
                            dropoffRegionIds.length > 1
                                ? t("shipments.filters.cityDisabled", { defaultValue: "City is available only when exactly 1 region is selected." })
                                : undefined
                        }
                    />
                </Stack>

                {/* VEHICLE / RANGES */}
                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.vehicle", { defaultValue: "Vehicle" })}
                </Typography>

                <RHFIdMultiAutocomplete
                    control={control}
                    name={"vehicle_type" as any}
                    label={t("shipments.filters.vehicleType", { defaultValue: "Vehicle type (up to 5)" })}
                    options={vehicleOpts}
                    maxSelected={MAX_VEHICLES}
                />

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.weight", { defaultValue: "Weight" })}
                </Typography>

                <Stack direction="row" gap={1.2}>
                    <Controller
                        control={control}
                        name="weight_min"
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                size="small"
                                label={t("shipments.filters.min", { defaultValue: "Min" })}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    const raw = digitsOnly(e.target.value);
                                    field.onChange(raw === "" ? undefined : Number(raw));
                                }}
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
                                onChange={(e) => {
                                    const raw = digitsOnly(e.target.value);
                                    field.onChange(raw === "" ? undefined : Number(raw));
                                }}
                            />
                        )}
                    />
                </Stack>

                <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                    {t("shipments.filters.volume", { defaultValue: "Volume" })}
                </Typography>

                <Stack direction="row" gap={1.2}>
                    <Controller
                        control={control}
                        name="volume_min"
                        render={({ field }) => (
                            <TextField
                                fullWidth
                                size="small"
                                label={t("shipments.filters.min", { defaultValue: "Min" })}
                                value={field.value ?? ""}
                                onChange={(e) => {
                                    const raw = digitsOnly(e.target.value);
                                    field.onChange(raw === "" ? undefined : Number(raw));
                                }}
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
                                onChange={(e) => {
                                    const raw = digitsOnly(e.target.value);
                                    field.onChange(raw === "" ? undefined : Number(raw));
                                }}
                            />
                        )}
                    />
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="text" onClick={handleReset}>
                        {t("shipments.filters.reset", { defaultValue: "Reset" })}
                    </Button>
                    <Button variant="contained" onClick={submit}>
                        {t("shipments.filters.apply", { defaultValue: "Apply" })}
                    </Button>
                </Stack>
            </Box>
        </Drawer>
    );
});
