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
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FiMapPin, FiArrowRight } from "react-icons/fi";

import type { ShipmentsKind } from "@/entities/shipment/model/type";
import type { PublicGeoLocationType } from "@/shared/api/publicGeoApi";

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

import { useInitStore } from "@/shared/store/initStore";
import { useUserStore } from "@/entities/user/model/user.store";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { useFilterSettingsStore } from "@/shared/store/filterSettingsStore";
import { resolveFilters } from "@/shared/utils/filterSettings";

import { RHFIdMultiAutocomplete } from "@/shared/ui/lookup/RHFIdMultiAutocomplete";
import { RHFPublicGeoAutocomplete } from "@/shared/ui/lookup/RHFPublicGeoAutocomplete.tsx";

type FormValues = PublicFilters & {
  kind: ShipmentsKind;
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

export function ShipmentsFilterDrawer({
  open,
  pageKey,
  initialKind,
  initialFilters,
  onClose,
  onApply,
  showKindSelect = true,
}: Props) {
  const { t } = useTranslation();
  const user = useUserStore((s) => s.user);

  const { lookups } = useInitStore();
  const { getLocalizedLabel } = useLocalizedLookup();

  const { control, reset, handleSubmit, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: {
        kind: initialKind,
        ...EMPTY_FILTERS,
        ...(initialFilters as any),
      },
    });

  useEffect(() => {
    if (!open) return;

    reset({
      kind: initialKind,
      ...EMPTY_FILTERS,
      ...(initialFilters as any),
    });
  }, [open, initialKind, initialFilters, reset]);

  const vehicleOptions = useMemo(() => {
    return (lookups?.vehicleType || []).map((item: any) => ({
      id: item.slug,
      label: getLocalizedLabel(item),
    }));
  }, [lookups?.vehicleType, getLocalizedLabel]);

  const submit = handleSubmit((values) => {
    const { kind, ...filters } = values;
    const normalizedFilters = normalizeFilters(filters);

    saveStoredValues(pageKey, kind, normalizedFilters);
    onApply(kind, normalizedFilters);
  });

  const handleReset = () => {
    const currentKind = getValues("kind");

    clearStoredValues(pageKey, currentKind);

    // Получаем настройки сброса для данной страницы из стора
    const pageSettings = useFilterSettingsStore.getState().settings?.[pageKey];
    const resetConfig = pageSettings?.reset || {};

    // Разрешаем динамические даты
    const resolvedResetFilters = resolveFilters(resetConfig);

    const resetValues = {
      kind: currentKind,
      ...EMPTY_FILTERS,
      ...resolvedResetFilters,
    } as FormValues;

    reset(resetValues);
    onApply(currentKind, resolvedResetFilters);
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
          width: { xs: "100vw", sm: 520 },
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack
              direction="row"
              alignItems="flex-start"
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {t("shipments.filters.title", { defaultValue: "Filters" })}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {t("shipments.filters.searchLabel", {
                    defaultValue: "Refine your search results.",
                  })}
                </Typography>
              </Box>

              {showKindSelect ? (
                <Controller
                  control={control}
                  name="kind"
                  render={({ field }) => (
                    <ToggleButtonGroup
                      exclusive
                      size="small"
                      value={field.value}
                      onChange={(_, value: ShipmentsKind | null) => {
                        if (value) field.onChange(value);
                      }}
                      sx={{
                        flexShrink: 0,
                        "& .MuiToggleButton-root": {
                          px: 1.5,
                          textTransform: "none",
                        },
                      }}
                    >
                      <ToggleButton value="cargo">
                        {t("shipments.filters.cargo", {
                          defaultValue: "Cargo",
                        })}
                      </ToggleButton>

                      <ToggleButton value="transport">
                        {t("shipments.filters.transport", {
                          defaultValue: "Transport",
                        })}
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                />
              ) : (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textTransform: "capitalize", fontWeight: 600 }}
                >
                  {initialKind === "cargo"
                    ? t("shipments.filters.cargo", { defaultValue: "Cargo" })
                    : t("shipments.filters.transport", {
                        defaultValue: "Transport",
                      })}
                </Typography>
              )}
            </Stack>

            {user && (
              <Controller
                control={control}
                name="favorites_only"
                render={({ field }) => (
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={
                      <Switch
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    }
                    label={t("shipments.filters.favorites", {
                      defaultValue: "Favorites only",
                    })}
                  />
                )}
              />
            )}
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.route", { defaultValue: "Route" })}
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ xs: "stretch", sm: "center" }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <RHFPublicGeoAutocomplete
                    control={control}
                    setValue={setValue}
                    name="pickup_geo_location_name"
                    typeName="pickup_geo_location_type"
                    label={t("shipments.filters.pickupLocation", {
                      defaultValue: "Pickup location",
                    })}
                    placeholder={t("shipments.filters.locationPlaceholder", {
                      defaultValue: "Search country, region or city",
                    })}
                    icon={<FiMapPin size={16} />}
                  />
                </Box>

                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    color: "text.secondary",
                  }}
                >
                  <FiArrowRight size={18} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <RHFPublicGeoAutocomplete
                    control={control}
                    setValue={setValue}
                    name="dropoff_geo_location_name"
                    typeName="dropoff_geo_location_type"
                    label={t("shipments.filters.dropoffLocation", {
                      defaultValue: "Dropoff location",
                    })}
                    placeholder={t("shipments.filters.locationPlaceholder", {
                      defaultValue: "Search country, region or city",
                    })}
                    icon={<FiMapPin size={16} />}
                  />
                </Box>
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.pickupDates", {
                  defaultValue: "Pickup dates",
                })}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Controller
                  control={control}
                  name="pickup_date_from"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={t("shipments.filters.from", {
                        defaultValue: "From",
                      })}
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
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
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  )}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.dropoffDates", {
                  defaultValue: "Dropoff dates",
                })}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Controller
                  control={control}
                  name="dropoff_date_from"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={t("shipments.filters.from", {
                        defaultValue: "From",
                      })}
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="dropoff_date_to"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      type="date"
                      label={t("shipments.filters.to", { defaultValue: "To" })}
                      slotProps={{ inputLabel: { shrink: true } }}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(e.target.value || undefined)
                      }
                    />
                  )}
                />
              </Stack>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.vehicle", { defaultValue: "Vehicle" })}
              </Typography>

              <RHFIdMultiAutocomplete
                control={control}
                name="vehicle_type"
                label={t("shipments.filters.vehicleType", {
                  defaultValue: "Vehicle type (up to 5)",
                })}
                options={vehicleOptions}
                maxSelected={MAX_VEHICLES}
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.weight", { defaultValue: "Weight" })}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Controller
                  control={control}
                  name="weight_min"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label={t("shipments.filters.min", {
                        defaultValue: "Min",
                      })}
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
                      label={t("shipments.filters.max", {
                        defaultValue: "Max",
                      })}
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
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t("shipments.filters.volume", { defaultValue: "Volume" })}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Controller
                  control={control}
                  name="volume_min"
                  render={({ field }) => (
                    <TextField
                      fullWidth
                      size="small"
                      label={t("shipments.filters.min", {
                        defaultValue: "Min",
                      })}
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
                      label={t("shipments.filters.max", {
                        defaultValue: "Max",
                      })}
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
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            p: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button fullWidth variant="outlined" onClick={handleReset}>
              {t("shipments.filters.reset", { defaultValue: "Reset" })}
            </Button>

            <Button fullWidth variant="contained" onClick={submit}>
              {t("shipments.filters.apply", { defaultValue: "Apply" })}
            </Button>
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
}
