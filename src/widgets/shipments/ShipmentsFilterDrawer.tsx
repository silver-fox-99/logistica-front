import { useEffect, useMemo } from "react";
import {
  Drawer,
  Box,
  Stack,
  Typography,
  Button,
  Divider,
  TextField,
  Switch,
  FormControlLabel,
  Autocomplete,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicGeoLocationType } from "@/shared/api/publicGeoApi";
import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useFilterSettingsStore } from "@/shared/store/filterSettingsStore";
import { resolveFilters } from "@/shared/utils/filterSettings";
import { RHFIdMultiAutocomplete } from "@/shared/ui/lookup/RHFIdMultiAutocomplete";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { publicGeoApi } from "@/shared/api/publicGeoApi";

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

type FormValues = PublicFilters & {
  kind: ShipmentsKind;
  pickup_country?: any;
  pickup_region?: any;
  pickup_city?: any;
  dropoff_country?: any;
  dropoff_region?: any;
  dropoff_city?: any;
};

type Props = {
  open: boolean;
  pageKey: "search" | "my" | "home";
  initialKind: ShipmentsKind;
  initialFilters: PublicFilters;
  onClose: () => void;
  onApply: (kind: ShipmentsKind, filters: PublicFilters) => void;
  showKindSelect?: boolean;
};

const MAX_VEHICLES = 5;

const EMPTY_FILTERS: Record<keyof PublicFilters, any> = {
  pickup_geo_location_name: null,
  pickup_geo_location_type: null,
  dropoff_geo_location_name: null,
  dropoff_geo_location_type: null,
  pickup_date_from: null,
  pickup_date_to: null,
  dropoff_date_from: null,
  dropoff_date_to: null,
  weight_min: null,
  weight_max: null,
  volume_min: null,
  volume_max: null,
  vehicle_type: [],
  favorites_only: false,
};

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

const getStorageKey = (
  pageKey: "search" | "my" | "home",
  kind: ShipmentsKind,
) => {
  if (pageKey === "home") {
    return `shipments:public-filters:${kind}`;
  }
  return "shipments:filters:drawer-form";
};

const saveStoredValues = (
  pageKey: "search" | "my" | "home",
  kind: ShipmentsKind,
  filters: PublicFilters,
) => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(pageKey, kind);
  if (pageKey === "home") {
    window.localStorage.setItem(key, JSON.stringify(filters));
  } else {
    window.localStorage.setItem(key, JSON.stringify({ kind, ...filters }));
  }
};

const clearStoredValues = (
  pageKey: "search" | "my" | "home",
  kind: ShipmentsKind,
) => {
  if (typeof window === "undefined") return;
  const key = getStorageKey(pageKey, kind);
  window.localStorage.removeItem(key);
};

const getLocalizedName = (item: any, lang: string) => {
  if (!item) return "";
  if (lang.startsWith("ru")) return item.name_ru || item.name;
  if (lang.startsWith("uz")) return item.name_uz || item.name;
  return item.name;
};

const toImportItem = (row: any): any => ({
  id: String(row.id),
  name: row.name || "",
  name_ru: row.name_ru ?? null,
  name_uz: row.name_uz ?? null,
  parent_id: row.parent_id ?? null,
  type: row.type ?? null,
});

export function ShipmentsFilterDrawer({
  open,
  pageKey,
  initialKind,
  initialFilters,
  onClose,
  onApply,
}: Props) {
  const { t, i18n } = useTranslation();
  const user = useUserStore((s) => s.user);

  const { lookups } = useInitStore();
  const { getLocalizedLabel } = useLocalizedLookup();

  const {
    countries,
    getRegions,
    getCities,
    loadCountries,
    ensureRegions,
    ensureCities,
  } = useGeoCascade();

  const { control, reset, handleSubmit, setValue, getValues, watch } =
    useForm<FormValues>({
      defaultValues: {
        kind: initialKind,
        ...EMPTY_FILTERS,
        ...(initialFilters as any),
        pickup_country: null,
        pickup_region: null,
        pickup_city: null,
        dropoff_country: null,
        dropoff_region: null,
        dropoff_city: null,
      },
    });

  const watchPickupCountry = watch("pickup_country");
  const watchPickupRegion = watch("pickup_region");
  const watchDropoffCountry = watch("dropoff_country");
  const watchDropoffRegion = watch("dropoff_region");

  useEffect(() => {
    if (watchPickupCountry?.id) {
      ensureRegions(watchPickupCountry.id);
    }
  }, [watchPickupCountry?.id, ensureRegions]);

  useEffect(() => {
    if (watchPickupCountry?.id && watchPickupRegion?.id) {
      ensureCities(watchPickupCountry.id, watchPickupRegion.id);
    }
  }, [watchPickupCountry?.id, watchPickupRegion?.id, ensureCities]);

  useEffect(() => {
    if (watchDropoffCountry?.id) {
      ensureRegions(watchDropoffCountry.id);
    }
  }, [watchDropoffCountry?.id, ensureRegions]);

  useEffect(() => {
    if (watchDropoffCountry?.id && watchDropoffRegion?.id) {
      ensureCities(watchDropoffCountry.id, watchDropoffRegion.id);
    }
  }, [watchDropoffCountry?.id, watchDropoffRegion?.id, ensureCities]);

  useEffect(() => {
    if (!open) return;

    reset({
      kind: initialKind,
      ...EMPTY_FILTERS,
      ...(initialFilters as any),
      pickup_country: null,
      pickup_region: null,
      pickup_city: null,
      dropoff_country: null,
      dropoff_region: null,
      dropoff_city: null,
    });

    const initGeo = async () => {
      await loadCountries();

      // Resolve pickup
      if (initialFilters.pickup_geo_location_name && initialFilters.pickup_geo_location_type) {
        const results = await publicGeoApi.search(initialFilters.pickup_geo_location_name).catch(() => []);
        const matched = results.find(
          (x) => x.name === initialFilters.pickup_geo_location_name && x.type === initialFilters.pickup_geo_location_type
        ) || results[0];

        if (matched) {
          let countryObj: any = null;
          let regionObj: any = null;
          let cityObj: any = null;

          if (matched.type === "COUNTRY") {
            countryObj = toImportItem({ ...matched, type: "COUNTRY" });
          } else if (matched.type === "REGION") {
            regionObj = toImportItem({ ...matched, type: "REGION" });
            if (matched.country) {
              countryObj = toImportItem({ ...matched.country, type: "COUNTRY" });
            }
          } else if (matched.type === "CITY") {
            cityObj = toImportItem({ ...matched, type: "CITY" });
            if (matched.region) {
              regionObj = toImportItem({ ...matched.region, type: "REGION" });
            }
            if (matched.country) {
              countryObj = toImportItem({ ...matched.country, type: "COUNTRY" });
            }
          }

          if (countryObj) {
            setValue("pickup_country", countryObj);
            await ensureRegions(countryObj.id);
          }
          if (regionObj) {
            setValue("pickup_region", regionObj);
            await ensureCities(countryObj?.id, regionObj.id);
          }
          if (cityObj) {
            setValue("pickup_city", cityObj);
          }
        }
      }

      // Resolve dropoff
      if (initialFilters.dropoff_geo_location_name && initialFilters.dropoff_geo_location_type) {
        const results = await publicGeoApi.search(initialFilters.dropoff_geo_location_name).catch(() => []);
        const matched = results.find(
          (x) => x.name === initialFilters.dropoff_geo_location_name && x.type === initialFilters.dropoff_geo_location_type
        ) || results[0];

        if (matched) {
          let countryObj: any = null;
          let regionObj: any = null;
          let cityObj: any = null;

          if (matched.type === "COUNTRY") {
            countryObj = toImportItem({ ...matched, type: "COUNTRY" });
          } else if (matched.type === "REGION") {
            regionObj = toImportItem({ ...matched, type: "REGION" });
            if (matched.country) {
              countryObj = toImportItem({ ...matched.country, type: "COUNTRY" });
            }
          } else if (matched.type === "CITY") {
            cityObj = toImportItem({ ...matched, type: "CITY" });
            if (matched.region) {
              regionObj = toImportItem({ ...matched.region, type: "REGION" });
            }
            if (matched.country) {
              countryObj = toImportItem({ ...matched.country, type: "COUNTRY" });
            }
          }

          if (countryObj) {
            setValue("dropoff_country", countryObj);
            await ensureRegions(countryObj.id);
          }
          if (regionObj) {
            setValue("dropoff_region", regionObj);
            await ensureCities(countryObj?.id, regionObj.id);
          }
          if (cityObj) {
            setValue("dropoff_city", cityObj);
          }
        }
      }
    };

    initGeo();
  }, [open, initialFilters, initialKind, reset, loadCountries, ensureRegions, ensureCities, setValue]);

  const vehicleOptions = useMemo(() => {
    return (lookups?.vehicleType || []).map((item: any) => ({
      id: item.slug,
      label: getLocalizedLabel(item),
    }));
  }, [lookups?.vehicleType, getLocalizedLabel]);

  const handlePickupCountryChange = (country: any) => {
    setValue("pickup_region", null);
    setValue("pickup_city", null);
    if (country?.id) {
      ensureRegions(country.id);
    }
  };

  const handlePickupRegionChange = (region: any) => {
    setValue("pickup_city", null);
    if (watchPickupCountry?.id && region?.id) {
      ensureCities(watchPickupCountry.id, region.id);
    }
  };

  const handleDropoffCountryChange = (country: any) => {
    setValue("dropoff_region", null);
    setValue("dropoff_city", null);
    if (country?.id) {
      ensureRegions(country.id);
    }
  };

  const handleDropoffRegionChange = (region: any) => {
    setValue("dropoff_city", null);
    if (watchDropoffCountry?.id && region?.id) {
      ensureCities(watchDropoffCountry.id, region.id);
    }
  };

  const submit = handleSubmit((values) => {
    const {
      kind,
      pickup_country,
      pickup_region,
      pickup_city,
      dropoff_country,
      dropoff_region,
      dropoff_city,
      ...filters
    } = values;

    // Resolve pickup
    if (pickup_city) {
      filters.pickup_geo_location_name = pickup_city.name;
      filters.pickup_geo_location_type = "CITY";
    } else if (pickup_region) {
      filters.pickup_geo_location_name = pickup_region.name;
      filters.pickup_geo_location_type = "REGION";
    } else if (pickup_country) {
      filters.pickup_geo_location_name = pickup_country.name;
      filters.pickup_geo_location_type = "COUNTRY";
    } else {
      filters.pickup_geo_location_name = undefined;
      filters.pickup_geo_location_type = undefined;
    }

    // Resolve dropoff
    if (dropoff_city) {
      filters.dropoff_geo_location_name = dropoff_city.name;
      filters.dropoff_geo_location_type = "CITY";
    } else if (dropoff_region) {
      filters.dropoff_geo_location_name = dropoff_region.name;
      filters.dropoff_geo_location_type = "REGION";
    } else if (dropoff_country) {
      filters.dropoff_geo_location_name = dropoff_country.name;
      filters.dropoff_geo_location_type = "COUNTRY";
    } else {
      filters.dropoff_geo_location_name = undefined;
      filters.dropoff_geo_location_type = undefined;
    }

    const normalizedFilters = normalizeFilters(filters);
    saveStoredValues(pageKey, kind, normalizedFilters);
    onApply(kind, normalizedFilters);
  });

  const handleReset = () => {
    const currentKind = getValues("kind");

    clearStoredValues(pageKey, currentKind);

    const pageSettings = useFilterSettingsStore.getState().settings?.[pageKey];
    const resetConfig = pageSettings?.reset || {};
    const resolvedResetFilters = resolveFilters(resetConfig);

    const resetValues = {
      kind: currentKind,
      ...EMPTY_FILTERS,
      ...resolvedResetFilters,
      pickup_country: null,
      pickup_region: null,
      pickup_city: null,
      dropoff_country: null,
      dropoff_region: null,
      dropoff_city: null,
    } as FormValues;

    reset(resetValues);
    onApply(currentKind, resolvedResetFilters);
  };

  const fieldSx = {
    width: "100%",
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      bgcolor: "background.paper",
      "& fieldset": {
        borderColor: "#E2E8F0",
      },
      "&:hover fieldset": {
        borderColor: "#CBD5E1",
      },
      "&.Mui-focused fieldset": {
        borderColor: "primary.main",
      },
    },
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
    >
      <Box
        sx={{
          width: { xs: "100vw", sm: 450 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
          bgcolor: "background.paper",
        }}
      >
        {/* Header */}
        <Box sx={{ px: 3, pt: 3, pb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#0F172A", mb: 0.5 }}>
            {t("shipments.filters.title", { defaultValue: "Фильтры" })}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {t("shipments.filters.searchLabel", { defaultValue: "Поиск заказов" })}
          </Typography>
        </Box>

        <Divider sx={{ mx: 3 }} />

        {/* Scrollable Content */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 3, py: 2 }}>
          <Stack spacing={2.5}>
            {/* Toggle favorites */}
            {user && (
              <Controller
                control={control}
                name="favorites_only"
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ m: 0, gap: 1.5 }}
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A" }}>
                        {t("shipments.filters.favorites", {
                          defaultValue: "Только избранное",
                        })}
                      </Typography>
                    }
                  />
                )}
              />
            )}

            {/* Section: Загрузка */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
                {t("shipments.filters.pickupSection", { defaultValue: "Загрузка" })}
              </Typography>

              <Stack spacing={1.5}>
                <Controller
                  control={control}
                  name="pickup_country"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      options={countries}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                        handlePickupCountryChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.country", "Страна")}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="pickup_region"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      disabled={!watchPickupCountry}
                      options={getRegions(watchPickupCountry?.id)}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                        handlePickupRegionChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.region", "Регион")}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="pickup_city"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      disabled={!watchPickupRegion}
                      options={getCities(watchPickupCountry?.id, watchPickupRegion?.id)}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.city", "Город")}
                        />
                      )}
                    />
                  )}
                />

                {/* Dates From / To */}
                <Stack direction="row" spacing={2} sx={{ pt: 0.5 }}>
                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {t("shipments.filters.from", "От")}
                    </Typography>
                    <Controller
                      control={control}
                      name="pickup_date_from"
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          sx={fieldSx}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      )}
                    />
                  </Stack>

                  <Stack spacing={0.5} flex={1}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
                      {t("shipments.filters.to", "До")}
                    </Typography>
                    <Controller
                      control={control}
                      name="pickup_date_to"
                      render={({ field }) => (
                        <TextField
                          fullWidth
                          size="small"
                          type="date"
                          sx={fieldSx}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value || undefined)}
                        />
                      )}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Box>

            {/* Section: Выгрузка */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
                {t("shipments.filters.dropoffSection", { defaultValue: "Выгрузка" })}
              </Typography>

              <Stack spacing={1.5}>
                <Controller
                  control={control}
                  name="dropoff_country"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      options={countries}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                        handleDropoffCountryChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.country", "Страна")}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dropoff_region"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      disabled={!watchDropoffCountry}
                      options={getRegions(watchDropoffCountry?.id)}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                        handleDropoffRegionChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.region", "Регион")}
                        />
                      )}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dropoff_city"
                  render={({ field }) => (
                    <Autocomplete
                      {...field}
                      size="small"
                      disabled={!watchDropoffRegion}
                      options={getCities(watchDropoffCountry?.id, watchDropoffRegion?.id)}
                      getOptionLabel={(option) => getLocalizedName(option, i18n.language)}
                      isOptionEqualToValue={(option, value) => option.id === value.id}
                      onChange={(_, value) => {
                        field.onChange(value);
                      }}
                      sx={fieldSx}
                      value={field.value || null}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          placeholder={t("shipments.filters.city", "Город")}
                        />
                      )}
                    />
                  )}
                />
              </Stack>
            </Box>

            {/* Section: Транспорт */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
                {t("shipments.filters.transport", { defaultValue: "Транспорт" })}
              </Typography>

              <RHFIdMultiAutocomplete
                control={control}
                name="vehicle_type"
                label=""
                placeholder={t("shipments.filters.vehicleTypePlaceholder", {
                  defaultValue: "Тип транспорта",
                })}
                options={vehicleOptions}
                maxSelected={MAX_VEHICLES}
              />
            </Box>

            {/* Weight and Volume Grid */}
            <Grid container spacing={3}>
              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
                  {t("shipments.filters.weightTitle", { defaultValue: "Вес (т)" })}
                </Typography>
                <Stack spacing={1.5}>
                  <Controller
                    control={control}
                    name="weight_min"
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        placeholder={t("shipments.filters.min", { defaultValue: "Мин" })}
                        value={field.value ?? ""}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                        onChange={(e) =>
                          field.onChange(normalizeNumber(e.target.value))
                        }
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
                        sx={fieldSx}
                        placeholder={t("shipments.filters.max", { defaultValue: "Макс" })}
                        value={field.value ?? ""}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                        onChange={(e) =>
                          field.onChange(normalizeNumber(e.target.value))
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>

              <Grid size={{ xs: 6 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#0F172A", mb: 1.5 }}>
                  {t("shipments.filters.volumeTitle", { defaultValue: "Объем (м3)" })}
                </Typography>
                <Stack spacing={1.5}>
                  <Controller
                    control={control}
                    name="volume_min"
                    render={({ field }) => (
                      <TextField
                        fullWidth
                        size="small"
                        sx={fieldSx}
                        placeholder={t("shipments.filters.min", { defaultValue: "Мин" })}
                        value={field.value ?? ""}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                        onChange={(e) =>
                          field.onChange(normalizeNumber(e.target.value))
                        }
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
                        sx={fieldSx}
                        placeholder={t("shipments.filters.max", { defaultValue: "Макс" })}
                        value={field.value ?? ""}
                        slotProps={{
                          htmlInput: {
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          },
                        }}
                        onChange={(e) =>
                          field.onChange(normalizeNumber(e.target.value))
                        }
                      />
                    )}
                  />
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box
          sx={{
            p: 3,
            bgcolor: "background.paper",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              onClick={handleReset}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                color: "primary.main",
                "&:hover": { bgcolor: "transparent", color: "primary.dark" },
              }}
            >
              {t("shipments.filters.reset", { defaultValue: "Сбросить" })}
            </Button>

            <Button
              variant="contained"
              onClick={submit}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: "8px",
                px: 3,
                py: 1,
                boxShadow: "none",
                "&:hover": { boxShadow: "none" },
              }}
            >
              {t("shipments.filters.apply", { defaultValue: "Применить" })}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
