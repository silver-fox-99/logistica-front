import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors, type UseFormRegisterReturn } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { cargoApi } from "@/shared/api/cargoApi";

import { useInitStore } from "@/shared/store/initStore";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";
import { onDigitsOnlyChange } from "@/shared/lib/numericInput";
import { imgbbApi } from "@/shared/api/imgbbApi";

import type { AddCargoFormValues, Place } from "./types";
import type {CargoPointDto, CreateCargoDto} from "@/entities/cargo/model/types.ts";

export const PHONE_RE = /^\+?[1-9]\d{9,19}$/;

const EMPTY_PLACE: Place = {
    location: null,
    address: "",
};

export function getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0];
}

export function toIntOrZero(v: string) {
    const s = (v ?? "").trim();
    if (!s) return 0;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    if (!Number.isFinite(n)) return 0;

    return Math.round(n * 100) / 100;
}

export function toNullableNum(v: string) {
    const s = (v ?? "").trim();
    if (!s) return undefined;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    if (!Number.isFinite(n)) return undefined;

    return Math.round(n * 100) / 100;
}

function toCargoPoint(
    point: Place,
    type: "PICKUP" | "DROPOFF",
    index: number,
): CargoPointDto {
    const location = point.location;

    return {
        type,
        country: location?.country || "Unknown",
        region: location?.region || null,
        city: location?.city || null,
        address: point.address || location?.address || null,
        display_name: location?.display_name || null,
        latitude: location?.latitude ? Number(location.latitude) : null,
        longitude: location?.longitude ? Number(location.longitude) : null,
        geocode_source: location?.source || "locationiq",
        order: index,
    };
}

export function useAddCargoForm() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { getLocalizedLabel } = useLocalizedLookup();
    const [loading, setLoading] = useState(false);

    const { lookups, loadInit, loading: loadingInit } = useInitStore();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);
    const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
    const loadOpts = useMemo(() => lookups?.loadType ?? [], [lookups]);
    const cargoOpts = useMemo(() => lookups?.cargoTypes ?? [], [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);

    const form = useForm<AddCargoFormValues>({
        mode: "onSubmit",
        shouldUnregister: false,
        defaultValues: {
            dateFrom: getTodayDate(),
            dateFromEnd: getTodayDate(),
            dateTo: "",

            pickups: [EMPTY_PLACE],
            dropoffs: [EMPTY_PLACE],

            cargoType: "",
            vehicleType: "",
            loadType: [],
            allowPartial: false,

            vehiclesCount: "1",
            palletsCount: "",
            weightTons: "",
            volumeM3: "",

            dims: {
                length: "",
                width: "",
                height: "",
            },

            currency: "",
            price: "",

            paymentMethod: "",
            paymentTerm: "",
            bargaining: "possible",

            contactSecondary: "",
            note: "",
            extraPhoneAsMain: false,

            images: [],
            imageUrls: [],
        },
    });

    const {
        register,
        setValue,
        getValues,
        setError,
        clearErrors,
        handleSubmit,
        control,
        formState,
    } = form;

    const images = form.watch("images");

    const imagePreviews = useMemo(() => {
        return (images ?? []).map((file) => URL.createObjectURL(file));
    }, [images]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    useEffect(() => {
        if (!lookups || loadingInit) return;

        const cur = getValues("currency");
        const veh = getValues("vehicleType");
        const car = getValues("cargoType");

        if (!cur) {
            setValue("currency", lookups.currency?.[0]?.slug ?? "", {
                shouldDirty: false,
            });
        }

        if (!veh) {
            setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "", {
                shouldDirty: false,
            });
        }

        if (!car) {
            setValue("cargoType", lookups.cargoTypes?.[0]?.slug ?? "", {
                shouldDirty: false,
            });
        }
    }, [getValues, lookups, loadingInit, setValue]);

    const registerDigits = useCallback(
        (name: keyof AddCargoFormValues | `dims.${"length" | "width" | "height"}`) => {
            const r: any = register(name as any);

            return {
                ...r,
                onChange: (e: any) => {
                    onDigitsOnlyChange(e);
                    r.onChange(e);
                },
            } satisfies UseFormRegisterReturn;
        },
        [register],
    );

    const validatePlaces = useCallback(
        (
            places: Place[],
            fieldName: "pickups" | "dropoffs",
            emptyMessage: string,
        ) => {
            let ok = true;

            if (!places?.length) {
                setError(`${fieldName}.0.location` as any, {
                    type: "required",
                    message: emptyMessage,
                });

                return false;
            }

            places.forEach((place, index) => {
                if (!place.location) {
                    setError(`${fieldName}.${index}.location` as any, {
                        type: "required",
                        message: emptyMessage,
                    });

                    ok = false;
                }
            });

            return ok;
        },
        [setError],
    );

    const validateBusiness = useCallback(
        (v: AddCargoFormValues) => {
            clearErrors();

            let ok = true;

            if (!v.dateFrom) {
                setError("dateFrom", {
                    type: "required",
                    message: t("addCargo.errors.required"),
                });
                ok = false;
            }

            if (!v.dateFromEnd) {
                setError("dateFromEnd", {
                    type: "required",
                    message: t("addCargo.errors.required"),
                });
                ok = false;
            }

            if (v.dateFrom && v.dateFromEnd && v.dateFromEnd < v.dateFrom) {
                setError("dateFromEnd", {
                    type: "validate",
                    message: t("addCargo.errors.dateRangeOrder"),
                });
                ok = false;
            }

            if (v.dateFromEnd && v.dateTo && v.dateTo < v.dateFromEnd) {
                setError("dateTo", {
                    type: "validate",
                    message: t("addCargo.errors.dateOrder"),
                });
                ok = false;
            }

            if (
                !validatePlaces(
                    v.pickups,
                    "pickups",
                    t("addCargo.errors.selectCountryLoad"),
                )
            ) {
                ok = false;
            }

            if (
                !validatePlaces(
                    v.dropoffs,
                    "dropoffs",
                    t("addCargo.errors.selectCountryUnload"),
                )
            ) {
                ok = false;
            }

            if (!v.cargoType) {
                setError("cargoType", {
                    type: "required",
                    message: t("addCargo.errors.selectCargoType"),
                });
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", {
                    type: "required",
                    message: t("addCargo.errors.selectVehicleType"),
                });
                ok = false;
            }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", {
                    type: "pattern",
                    message: t("addCargo.errors.invalidPhone"),
                });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t, validatePlaces],
    );

    const toDto = useCallback((v: AddCargoFormValues): CreateCargoDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const normalizedPickups = (v.pickups ?? []).filter((item) => !!item.location);
        const normalizedDropoffs = (v.dropoffs ?? []).filter((item) => !!item.location);

        const anyDim =
            (toNullableNum(v.dims.length) ?? 0) > 0 ||
            (toNullableNum(v.dims.width) ?? 0) > 0 ||
            (toNullableNum(v.dims.height) ?? 0) > 0;

        const firstPickupLocation = normalizedPickups[0]?.location;
        const countryFromName = firstPickupLocation?.country || "Unknown";

        const dateFromPayload =
            v.dateFrom && v.dateFromEnd
                ? v.dateFrom === v.dateFromEnd
                    ? [v.dateFrom]
                    : [v.dateFrom, v.dateFromEnd]
                : v.dateFrom
                    ? [v.dateFrom]
                    : [];

        const pickupPoints = normalizedPickups.map((point, index) =>
            toCargoPoint(point, "PICKUP", index),
        );

        const dropoffPoints = normalizedDropoffs.map((point, index) =>
            toCargoPoint(point, "DROPOFF", index),
        );

        return {
            images: v.imageUrls?.length ? v.imageUrls : undefined,

            date_from: dateFromPayload,
            date_to: v.dateTo || "",

            country_from: countryFromName,

            vehicle_type: v.vehicleType || "ANY",
            load_type: v.loadType,
            cargo_type: v.cargoType || "GENERAL",
            allow_partial_load: !!v.allowPartial,

            weight_t: toIntOrZero(v.weightTons),
            volume_m3: toIntOrZero(v.volumeM3),
            cars_count: toIntOrZero(v.vehiclesCount),
            pallets_count: toIntOrZero(v.palletsCount),

            has_dimensions: anyDim,
            ...(anyDim
                ? {
                    length_m: toNullableNum(v.dims.length),
                    width_m: toNullableNum(v.dims.width),
                    height_m: toNullableNum(v.dims.height),
                }
                : {}),

            price_currency: v.currency || "",
            price_amount: toIntOrZero(v.price),

            payment_method: v.paymentMethod || "",
            payment_term: v.paymentTerm || "",

            bargain,

            contact_extra_phone: v.contactSecondary || undefined,
            note: v.note || undefined,
            extra_phone_as_main: v.extraPhoneAsMain,

            points: [...pickupPoints, ...dropoffPoints],
        };
    }, []);

    const getErrorMessage = useCallback(
        (error: any) => {
            const code = error?.response?.data?.code;
            const serverMessage = error?.response?.data?.message;

            if (code) {
                const translated = t(`apiErrors.${code}`, serverMessage);
                if (translated) return translated;
            }

            return serverMessage || t("addCargo.errorMessage");
        },
        [t],
    );

    const onValid = useCallback(
        async (values: AddCargoFormValues) => {
            if (!validateBusiness(values)) {
                toast.warning(t("addCargo.validationWarning"));
                return;
            }

            try {
                setLoading(true);

                let uploadedUrls: string[] = values.imageUrls ?? [];

                if (values.images?.length) {
                    uploadedUrls = await imgbbApi.uploadMany(values.images);
                }

                const payload = toDto({
                    ...values,
                    imageUrls: uploadedUrls,
                });

                await cargoApi.create(payload);

                toast.success(t("addCargo.successMessage"));
                navigate("/dashboard/requests");
            } catch (error: any) {
                toast.error(getErrorMessage(error));
            } finally {
                setLoading(false);
            }
        },
        [getErrorMessage, navigate, t, toDto, validateBusiness],
    );

    const onInvalid = useCallback(
        (_errors: FieldErrors<AddCargoFormValues>) => {
            toast.warning(t("addCargo.validationWarning"));
        },
        [t],
    );

    const onSubmit = handleSubmit(onValid, onInvalid);

    const pickupCountryErrors =
        ((formState.errors.pickups ?? []) as any[]).map(
            (item) => item?.location?.message as string | undefined,
        ) ?? [];

    const dropoffCountryErrors =
        ((formState.errors.dropoffs ?? []) as any[]).map(
            (item) => item?.location?.message as string | undefined,
        ) ?? [];

    return {
        t,
        i18nLang: i18n.language,
        getLocalizedLabel,
        lookups,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        loadOpts,
        cargoOpts,
        payMethodOpts,
        payTermOpts,

        form,
        register,
        registerDigits,
        control,
        setValue,
        getValues,
        formState,

        pickupCountryErrors,
        dropoffCountryErrors,

        onSubmit,
        loading,
        imagePreviews,
    };
}