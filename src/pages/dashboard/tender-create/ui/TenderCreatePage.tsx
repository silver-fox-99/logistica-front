import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type UseFormReturn,
  type UseFormSetValue,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FiArrowDown, FiArrowUp, FiPlus, FiTrash2 } from "react-icons/fi";

import {
  TenderAuctionType,
  TenderPointType,
  type CreateTenderPayload,
  type TenderPoint,
} from "@/entities/tender/model/types";
import { tendersApi } from "@/shared/api/tendersApi";
import {
  publicGeoApi,
  type PublicGeoLocationItem,
} from "@/shared/api/publicGeoApi";
import { useInitStore } from "@/shared/store/initStore";
import { RHFLookupAutocomplete } from "@/shared/ui/lookup/RHFLookupAutocomplete";
import { LookupAutocomplete } from "@/shared/ui/lookup/LookupAutocomplete";
import { useLocalizedLookup, type LookupOpt } from "@/shared/utils/lookupUtils";
import { getTodayDate } from "@/features/add-cargo-form/model/useAddCargoForm";
import type {
  Place,
  PlaceLocation,
} from "@/features/add-cargo-form/model/types";
import { matchIsValidTel, MuiTelInput } from "mui-tel-input";
import parsePhoneNumber from "libphonenumber-js";

type TenderCreateFormValues = {
  title: string;
  cargoDescription: string;
  pickupDate: string;
  dropoffDate: string;
  pickupTime: string;
  dropoffTime: string;
  pickups: Place[];
  dropoffs: Place[];
  cargoType: string;
  vehicleType: string;
  loadingType: string;
  weightTons: string;
  volumeM3: string;
  placesCount: string;
  vehicleBodyLengthM: string;
  adrRequired: boolean;
  hydraulicTailLiftRequired: boolean;
  auctionType: TenderAuctionType;
  startPrice: string;
  buyoutPrice: string;
  minBidStep: string;
  currency: string;
  paymentMethod: string;
  paymentTerm: string;
  startsAt: string;
  endsAt: string;
  phone: string;
  payment_deferment_days: string;
};

const EMPTY_PLACE: Place = {
  location: null,
  address: "",
};

function toNullableNumberString(value: string) {
  const normalized = value.trim().replace(",", ".");
  if (!normalized) return null;

  const n = Number(normalized);
  return Number.isFinite(n) ? String(n) : null;
}

function toNullableInteger(value: string) {
  const normalized = value.trim();
  if (!normalized) return null;

  const n = Number(normalized);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : null;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function getLocalizedName(
  item:
    | Pick<PublicGeoLocationItem, "name" | "name_ru" | "name_uz">
    | null
    | undefined,
  lang: string,
) {
  if (!item) return "";
  if (lang.startsWith("ru")) return item.name_ru || item.name;
  if (lang.startsWith("uz")) return item.name_uz || item.name;
  return item.name;
}

function mapGeoToPlaceLocation(
  item: PublicGeoLocationItem,
  lang: string,
): PlaceLocation {
  const countryName = item.country
    ? getLocalizedName(item.country, lang)
    : item.type === "COUNTRY"
      ? getLocalizedName(item, lang)
      : "";

  const regionName = item.region
    ? getLocalizedName(item.region, lang)
    : item.type === "REGION"
      ? getLocalizedName(item, lang)
      : null;

  const cityName = item.type === "CITY" ? getLocalizedName(item, lang) : null;
  const parts = [cityName, regionName, countryName].filter(Boolean);

  return {
    id: item.id,
    type: item.type,
    country: countryName || getLocalizedName(item, lang),
    country_ru:
      item.country?.name_ru ?? (item.type === "COUNTRY" ? item.name_ru : null),
    country_uz:
      item.country?.name_uz ?? (item.type === "COUNTRY" ? item.name_uz : null),
    region: regionName,
    region_ru:
      item.region?.name_ru ?? (item.type === "REGION" ? item.name_ru : null),
    region_uz:
      item.region?.name_uz ?? (item.type === "REGION" ? item.name_uz : null),
    city: cityName,
    city_ru: item.type === "CITY" ? item.name_ru : null,
    city_uz: item.type === "CITY" ? item.name_uz : null,
    address: null,
    display_name: parts.length
      ? parts.join(", ")
      : getLocalizedName(item, lang),
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    source: "internal_geo",
  };
}

function toTenderPoint(
  point: Place,
  type: TenderPointType,
  index: number,
): TenderPoint {
  const location = point.location;

  return {
    type,
    country: location?.country || "Unknown",
    country_ru: location?.country_ru ?? null,
    country_uz: location?.country_uz ?? null,
    region: location?.region || null,
    region_ru: location?.region_ru ?? null,
    region_uz: location?.region_uz ?? null,
    city: location?.city || null,
    city_ru: location?.city_ru ?? null,
    city_uz: location?.city_uz ?? null,
    address: point.address || location?.address || null,
    display_name: location?.display_name || null,
    latitude: location?.latitude == null ? null : String(location.latitude),
    longitude: location?.longitude == null ? null : String(location.longitude),
    order: String(index),
  };
}

type TenderPlaceRowFieldProps = {
  kind: "pickup" | "dropoff";
  index: number;
  control: Control<TenderCreateFormValues>;
  setValue: UseFormSetValue<TenderCreateFormValues>;
  errorText?: string;
};

function TenderPlaceRowField({
  kind,
  index,
  control,
  setValue,
  errorText,
}: TenderPlaceRowFieldProps) {
  const { t, i18n } = useTranslation();
  const fieldName =
    `${kind === "pickup" ? "pickups" : "dropoffs"}.${index}` as const;
  const [options, setOptions] = useState<PublicGeoLocationItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    const q = value.trim();
    if (q.length < 2) {
      setOptions([]);
      return;
    }

    try {
      setLoading(true);
      setOptions(await publicGeoApi.search(q));
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Stack spacing={1.25}>
      <Controller
        control={control}
        name={`${fieldName}.location`}
        render={({ field }) => (
          <Autocomplete
            value={field.value}
            options={options}
            loading={loading}
            filterOptions={(items) => items}
            noOptionsText={t("common.noOptions", "No options")}
            getOptionLabel={(option: any) => {
              if (!option) return "";
              if (option.source === "internal_geo")
                return option.display_name || "";
              return mapGeoToPlaceLocation(option, i18n.language).display_name;
            }}
            isOptionEqualToValue={(option: any, value: any) =>
              option?.id === value?.id
            }
            onInputChange={(_, value, reason) => {
              if (reason === "input") void handleSearch(value);
            }}
            onChange={(_, value: any) => {
              field.onChange(
                value ? mapGeoToPlaceLocation(value, i18n.language) : null,
              );
              setValue(`${fieldName}.address`, "", {
                shouldDirty: true,
                shouldValidate: false,
              });
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label={
                  kind === "pickup"
                    ? t("tenders.create.pickupPoint")
                    : t("tenders.create.dropoffPoint")
                }
                placeholder={t("tenders.create.locationPlaceholder")}
                error={!!errorText}
                helperText={errorText}
              />
            )}
          />
        )}
      />

      <Controller
        control={control}
        name={`${fieldName}.address`}
        render={({ field }) => (
          <TextField
            {...field}
            label={
              kind === "pickup"
                ? t("tenders.create.pickupAddress")
                : t("tenders.create.dropoffAddress")
            }
            placeholder={t("tenders.create.addressPlaceholder")}
            fullWidth
          />
        )}
      />
    </Stack>
  );
}

type TenderPointsFieldArrayProps = {
  kind: "pickup" | "dropoff";
  name: "pickups" | "dropoffs";
  form: UseFormReturn<TenderCreateFormValues>;
  errorMessages?: Array<string | undefined>;
};

function TenderPointsFieldArray({
  kind,
  name,
  form,
  errorMessages = [],
}: TenderPointsFieldArrayProps) {
  const { t } = useTranslation();
  const { control, setValue } = form;
  const { fields, append, remove, move } = useFieldArray({ control, name });
  const title =
    kind === "pickup"
      ? t("tenders.create.pickupPoints")
      : t("tenders.create.dropoffPoints");
  const itemTitle =
    kind === "pickup"
      ? t("tenders.create.pickupPoint")
      : t("tenders.create.dropoffPoint");

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>

      {fields.map((field, index) => (
        <Paper
          key={field.id}
          variant="outlined"
          sx={{ p: 1.5, borderRadius: "12px", borderColor: "divider" }}
        >
          <Stack spacing={1.25}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={1}
            >
              <Typography variant="subtitle2">
                {itemTitle} #{index + 1}
              </Typography>

              <Stack direction="row" flexWrap="wrap" gap={1}>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<FiArrowUp />}
                  onClick={() => move(index, index - 1)}
                  disabled={index === 0}
                >
                  {t("tenders.create.moveUp")}
                </Button>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<FiArrowDown />}
                  onClick={() => move(index, index + 1)}
                  disabled={index === fields.length - 1}
                >
                  {t("tenders.create.moveDown")}
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="text"
                  startIcon={<FiTrash2 />}
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  {t("tenders.create.remove")}
                </Button>
              </Stack>
            </Stack>

            <TenderPlaceRowField
              kind={kind}
              index={index}
              control={control}
              setValue={setValue}
              errorText={errorMessages[index]}
            />
          </Stack>
        </Paper>
      ))}

      <Box>
        <Button
          variant="outlined"
          startIcon={<FiPlus />}
          onClick={() => append(EMPTY_PLACE)}
        >
          {kind === "pickup"
            ? t("tenders.create.addPickupPoint")
            : t("tenders.create.addDropoffPoint")}
        </Button>
      </Box>
    </Stack>
  );
}

export default function TenderCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lookups, loadInit, loading: loadingInit } = useInitStore();
  const { getLocalizedLabel } = useLocalizedLookup();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadInit();
  }, [loadInit]);

  const cargoOpts = useMemo(() => lookups?.cargoTypes ?? [], [lookups]);
  const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
  const loadingTypeOpts = useMemo(() => lookups?.loadType ?? [], [lookups]);
  const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);
  const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
  const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);

  const form = useForm<TenderCreateFormValues>({
    mode: "onSubmit",
    shouldUnregister: false,
    defaultValues: {
      title: "",
      cargoDescription: "",
      pickupDate: getTodayDate(),
      dropoffDate: "",
      pickupTime: "",
      dropoffTime: "",
      pickups: [EMPTY_PLACE],
      dropoffs: [EMPTY_PLACE],
      cargoType: "",
      vehicleType: "",
      loadingType: "",
      weightTons: "",
      volumeM3: "",
      placesCount: "",
      vehicleBodyLengthM: "",
      adrRequired: false,
      hydraulicTailLiftRequired: false,
      auctionType: TenderAuctionType.DECREASING,
      startPrice: "",
      buyoutPrice: "",
      minBidStep: "0",
      currency: "",
      paymentMethod: "",
      paymentTerm: "",
      phone: "",
      startsAt: "",
      endsAt: "",
      payment_deferment_days: "",
    },
  });

  const {
    register,
    control,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState,
    handleSubmit,
  } = form;

  useEffect(() => {
    if (!lookups || loadingInit) return;

    if (!getValues("currency"))
      setValue("currency", lookups.currency?.[0]?.slug ?? "USD", {
        shouldDirty: false,
      });
    if (!getValues("vehicleType"))
      setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "ANY", {
        shouldDirty: false,
      });
    if (!getValues("cargoType"))
      setValue("cargoType", lookups.cargoTypes?.[0]?.slug ?? "GENERAL", {
        shouldDirty: false,
      });
  }, [getValues, loadingInit, lookups, setValue]);

  const validatePlaces = useCallback(
    (places: Place[], fieldName: "pickups" | "dropoffs", message: string) => {
      let ok = true;
      if (!places?.length) {
        setError(`${fieldName}.0.location` as any, {
          type: "required",
          message,
        });
        return false;
      }

      places.forEach((place, index) => {
        if (!place.location) {
          setError(`${fieldName}.${index}.location` as any, {
            type: "required",
            message,
          });
          ok = false;
        }
      });

      return ok;
    },
    [setError],
  );

  const buildPayload = useCallback(
    (values: TenderCreateFormValues): CreateTenderPayload => {
      const pickups = (values.pickups ?? []).filter((item) => !!item.location);
      const dropoffs = (values.dropoffs ?? []).filter(
        (item) => !!item.location,
      );
      let phone = values.phone;

      try {
        const parsed = parsePhoneNumber(values.phone);
        if (parsed) phone = parsed.number;
      } catch {}

      return {
        title: values.title.trim(),
        cargo_description: values.cargoDescription.trim() || null,
        cargo_type: values.cargoType || "GENERAL",
        weight_t: toNullableNumberString(values.weightTons),
        volume_m3: toNullableNumberString(values.volumeM3),
        places_count: toNullableInteger(values.placesCount),
        pickup_date: values.pickupDate || null,
        dropoff_date: values.dropoffDate || null,
        pickup_time: values.pickupTime || null,
        dropoff_time: values.dropoffTime || null,
        vehicle_type: values.vehicleType || "ANY",
        payment_deferment_days: values.payment_deferment_days || null,
        vehicle_body_length_m: toNullableNumberString(
          values.vehicleBodyLengthM,
        ),
        loading_type: values.loadingType || null,
        adr_required: values.adrRequired,
        hydraulic_tail_lift_required: values.hydraulicTailLiftRequired,
        auction_type: values.auctionType,
        start_price: toNullableNumberString(values.startPrice) || "0",
        buyout_price: toNullableNumberString(values.buyoutPrice),
        min_bid_step: toNullableNumberString(values.minBidStep) || "0",
        currency: values.currency || "USD",
        payment_method: values.paymentMethod || null,
        payment_term: values.paymentTerm || null,
        starts_at: toIsoDateTime(values.startsAt),
        ends_at: toIsoDateTime(values.endsAt),
        phone,
        points: [
          ...pickups.map((point, index) =>
            toTenderPoint(point, TenderPointType.PICKUP, index),
          ),
          ...dropoffs.map((point, index) =>
            toTenderPoint(point, TenderPointType.DROPOFF, index),
          ),
        ],
      };
    },
    [],
  );

  const onSubmit = handleSubmit(async (values) => {
    clearErrors();

    let ok = true;

    if (!values.title.trim()) {
      setError("title", {
        type: "required",
        message: t("tenders.settings.validation.title"),
      });
      ok = false;
    }
    if (!values.startPrice.trim()) {
      setError("startPrice", {
        type: "required",
        message: t("tenders.settings.validation.startPrice"),
      });
      ok = false;
    }
    if (!values.startsAt) {
      setError("startsAt", {
        type: "required",
        message: t("tenders.create.startRequired"),
      });
      ok = false;
    }
    if (!values.endsAt) {
      setError("endsAt", {
        type: "required",
        message: t("tenders.create.endRequired"),
      });
      ok = false;
    }
    if (values.startsAt && values.endsAt && values.endsAt <= values.startsAt) {
      setError("endsAt", {
        type: "validate",
        message: t("tenders.settings.validation.dateOrder"),
      });
      ok = false;
    }

    if (!values.phone || !matchIsValidTel(values.phone)) {
      setError("phone", {
        type: "validate",
        message: t("forgotPassword.phoneInvalid"),
      });
      ok = false;
    }

    if (
      !validatePlaces(
        values.pickups,
        "pickups",
        t("tenders.create.selectPickup"),
      )
    )
      ok = false;
    if (
      !validatePlaces(
        values.dropoffs,
        "dropoffs",
        t("tenders.create.selectDropoff"),
      )
    )
      ok = false;

    if (!ok) {
      toast.warning(t("tenders.create.validationRequired"));
      return;
    }

    try {
      setLoading(true);
      const tender = await tendersApi.create(buildPayload(values));
      toast.success(t("tenders.create.created"));
      navigate(`/dashboard/tenders/${tender.id}/overview`);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t("tenders.create.createError"),
      );
    } finally {
      setLoading(false);
    }
  });

  const pickupErrors =
    ((formState.errors.pickups ?? []) as any[]).map(
      (item) => item?.location?.message as string | undefined,
    ) ?? [];
  const dropoffErrors =
    ((formState.errors.dropoffs ?? []) as any[]).map(
      (item) => item?.location?.message as string | undefined,
    ) ?? [];

  return (
    <Box sx={{ py: 3 }}>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "16px",
          borderColor: "divider",
        }}
      >
        <Stack spacing={3} component="form" noValidate onSubmit={onSubmit}>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              {t("tenders.create.pageTitle")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("tenders.create.pageSubtitle")}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("tenders.create.titleField")}
                fullWidth
                {...register("title")}
                error={!!formState.errors.title}
                helperText={formState.errors.title?.message}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.pickupDate")}
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("pickupDate")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.dropoffDate")}
                type="date"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("dropoffDate")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.pickupTime")}
                type="time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("pickupTime")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.dropoffTime")}
                type="time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("dropoffTime")}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TenderPointsFieldArray
                kind="pickup"
                name="pickups"
                form={form}
                errorMessages={pickupErrors}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TenderPointsFieldArray
                kind="dropoff"
                name="dropoffs"
                form={form}
                errorMessages={dropoffErrors}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="cargoType"
                label={t("tenders.fields.cargoType")}
                placeholder={t("tenders.create.selectCargoType")}
                options={cargoOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="vehicleType"
                label={t("tenders.fields.vehicleType")}
                placeholder={t("tenders.create.selectVehicleType")}
                options={vehicleOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="loadingType"
                label={t("tenders.fields.loadingType")}
                placeholder={t("tenders.create.selectLoadingType")}
                options={loadingTypeOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.placesCount")}
                fullWidth
                {...register("placesCount")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.weightTons")}
                fullWidth
                {...register("weightTons")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.volumeM3")}
                fullWidth
                {...register("volumeM3")}
              />
            </Grid>
            {/*<Grid size={{ xs: 12, md: 6 }}>*/}
            {/*    <TextField label={t("tenders.fields.vehicleCapacityTons")} fullWidth {...register("vehicleCapacityTons")} />*/}
            {/*</Grid>*/}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.vehicleBodyLengthM")}
                fullWidth
                {...register("vehicleBodyLengthM")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="adrRequired"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label={t("tenders.create.adr")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Controller
                    control={control}
                    name="hydraulicTailLiftRequired"
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label={t("tenders.create.hydraulicTailLiftRequired")}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label={t("tenders.fields.cargoDescription")}
                multiline
                minRows={3}
                fullWidth
                {...register("cargoDescription")}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 2 }} />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: "8px" }}>
                <AlertTitle sx={{ fontWeight: 600 }}>
                  {t("tenders.create.howItWorksTitle")}
                </AlertTitle>
                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>
                  {t("tenders.create.howItWorksText")}
                </Typography>
              </Alert>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="auctionType"
                render={({ field }) => (
                  <LookupAutocomplete
                    label={t("tenders.create.auctionType")}
                    placeholder={t("tenders.create.selectAuctionType")}
                    options={[
                      {
                        slug: TenderAuctionType.DECREASING,
                        label: t("tenders.list.decreasing"),
                      } as LookupOpt,
                      //   { slug: TenderAuctionType.INCREASING, label: t("tenders.list.increasing") } as LookupOpt,
                    ]}
                    valueSlug={field.value}
                    onChangeSlug={(slug) => field.onChange(slug)}
                    getOptionLabel={(option) => option.label}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="currency"
                label={t("tenders.create.currency")}
                placeholder={t("tenders.create.selectCurrency")}
                options={currencyOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("tenders.fields.startPrice")}
                placeholder={t("tenders.create.startPricePlaceholder")}
                helperText={
                  formState.errors.startPrice?.message ||
                  t("tenders.create.startPriceHint")
                }
                fullWidth
                {...register("startPrice")}
                error={!!formState.errors.startPrice}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("tenders.fields.buyoutPrice")}
                placeholder={t("tenders.create.buyoutPricePlaceholder")}
                helperText={t("tenders.create.buyoutPriceHint")}
                fullWidth
                {...register("buyoutPrice")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label={t("tenders.fields.minBidStep")}
                placeholder={t("tenders.create.minBidStepPlaceholder")}
                helperText={t("tenders.create.minBidStepHint")}
                fullWidth
                {...register("minBidStep")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="paymentMethod"
                label={t("tenders.create.paymentMethod")}
                placeholder={t("tenders.create.selectPaymentMethod")}
                options={payMethodOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <RHFLookupAutocomplete<TenderCreateFormValues>
                control={control}
                name="paymentTerm"
                label={t("tenders.create.paymentTerm")}
                placeholder={t("tenders.create.selectPaymentTerm")}
                options={payTermOpts}
                getOptionLabel={getLocalizedLabel}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.paymentDefermentDays")}
                fullWidth
                {...register("payment_deferment_days")}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.startsAt")}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("startsAt")}
                error={!!formState.errors.startsAt}
                helperText={formState.errors.startsAt?.message}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Controller
                control={control}
                name="phone"
                render={({ field, fieldState }) => (
                  <MuiTelInput
                    {...field}
                    label={t("forgotPassword.phoneLabel")}
                    defaultCountry="UZ"
                    forceCallingCode
                    fullWidth
                    error={!!fieldState.error}
                    helperText={fieldState.error?.message}
                  />
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label={t("tenders.fields.endsAt")}
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                fullWidth
                {...register("endsAt")}
                error={!!formState.errors.endsAt}
                helperText={formState.errors.endsAt?.message}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Stack direction="row" justifyContent="center" mt={1.5}>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ minWidth: 260, borderRadius: "8px", fontWeight: 600 }}
                  disabled={loading || loadingInit}
                >
                  {loading
                    ? t("tenders.common.loading")
                    : t("tenders.create.createButton")}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Box>
  );
}
