import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { transportApi, type CreateTransportDto, type TransportPointDto } from "@/shared/api/transportApi";
import { imgbbApi } from "@/shared/api/imgbbApi";
import { useInitStore } from "@/shared/store/initStore";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";

import type { AddTransportFormValues, Place } from "./types";
import { getTodayDate, PHONE_RE, toIntOrZero } from "@/features/add-cargo-form/model/useAddCargoForm";

const EMPTY_PLACE: Place = {
    location: null,
    address: "",
};

function toNullableNum(v: string) {
    const s = (v ?? "").trim();
    if (!s) return undefined;

    const normalized = s.replace(",", ".");
    const n = Number(normalized);

    return Number.isFinite(n) ? n : undefined;
}

function toTransportPoint(
    point: Place,
    type: "DEPARTURE" | "ARRIVAL",
    index: number,
): TransportPointDto {
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

export function useAddTransportForm() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit, loading: loadingInit } = useInitStore();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);
    const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);

    const form = useForm<AddTransportFormValues>({
        mode: "onSubmit",
        shouldUnregister: false,
        defaultValues: {
            dateFrom: getTodayDate(),
            dateFromEnd: "",
            dateTo: "",

            loadPlaces: [EMPTY_PLACE],
            unloadPlaces: [EMPTY_PLACE],

            vehicleType: "",
            vehiclesCount: "1",

            capacityTons: "",
            volumeM3: "",

            dims: { length: "", width: "", height: "" },

            currency: "",
            price: "",

            paymentMethod: "",
            paymentTerm: "",
            bargaining: "possible",

            contactSecondary: "",
            email: "",
            note: "",
            extraPhoneAsMain: false,

            images: [],
            imageUrls: [],
        },
    });

    const { setValue, getValues, setError, clearErrors, handleSubmit, formState, watch } = form;

    const watchedImages = watch("images");

    const imagePreviews = useMemo(() => {
        return (watchedImages ?? []).map((file) => URL.createObjectURL(file));
    }, [watchedImages]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [imagePreviews]);

    useEffect(() => {
        if (!lookups || loadingInit) return;

        const cur = getValues("currency");
        const veh = getValues("vehicleType");

        if (!cur) {
            setValue("currency", lookups.currency?.[0]?.slug ?? "USD", {
                shouldDirty: false,
            });
        }

        if (!veh) {
            setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "", {
                shouldDirty: false,
            });
        }
    }, [getValues, lookups, loadingInit, setValue]);

    const validatePlaces = useCallback(
        (
            places: Place[],
            fieldName: "loadPlaces" | "unloadPlaces",
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
        (v: AddTransportFormValues) => {
            clearErrors();

            let ok = true;

            if (!v.dateFrom) {
                setError("dateFrom", {
                    type: "required",
                    message: t("addTransport.errors.required"),
                });
                ok = false;
            }

            if (v.dateFrom && v.dateFromEnd && v.dateFromEnd < v.dateFrom) {
                setError("dateFromEnd", {
                    type: "validate",
                    message: t("addTransport.errors.dateRangeOrder"),
                });
                ok = false;
            }

            if (v.dateFromEnd && v.dateTo && v.dateTo < v.dateFromEnd) {
                setError("dateTo", {
                    type: "validate",
                    message: t("addTransport.errors.dateOrder"),
                });
                ok = false;
            }

            if (!validatePlaces(v.loadPlaces, "loadPlaces", t("addTransport.errors.selectCountryLoad"))) {
                ok = false;
            }

            if (!validatePlaces(v.unloadPlaces, "unloadPlaces", t("addTransport.errors.selectCountryUnload"))) {
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", {
                    type: "required",
                    message: t("addTransport.errors.selectVehicleType"),
                });
                ok = false;
            }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", {
                    type: "pattern",
                    message: t("addTransport.errors.invalidPhone"),
                });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t, validatePlaces],
    );

    const toDto = useCallback((v: AddTransportFormValues): CreateTransportDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const normalizedLoadPlaces = (v.loadPlaces ?? []).filter((item) => !!item.location);
        const normalizedUnloadPlaces = (v.unloadPlaces ?? []).filter((item) => !!item.location);

        const anyDim =
            (toNullableNum(v.dims.length) ?? 0) > 0 ||
            (toNullableNum(v.dims.width) ?? 0) > 0 ||
            (toNullableNum(v.dims.height) ?? 0) > 0;

        const departurePoints = normalizedLoadPlaces.map((point, index) =>
            toTransportPoint(point, "DEPARTURE", index),
        );

        const arrivalPoints = normalizedUnloadPlaces.map((point, index) =>
            toTransportPoint(point, "ARRIVAL", index),
        );

        const dateFromPayload =
            v.dateFrom && v.dateFromEnd
                ? v.dateFrom === v.dateFromEnd
                    ? [v.dateFrom]
                    : [v.dateFrom, v.dateFromEnd]
                : v.dateFrom
                    ? [v.dateFrom]
                    : [];

        return {
            images: v.imageUrls?.length ? v.imageUrls : undefined,

            date_from: dateFromPayload,
            date_to: v.dateTo || "",

            vehicle_type: v.vehicleType || "ANY",

            cars_count: Math.max(1, toIntOrZero(v.vehiclesCount)),
            weight_t: toIntOrZero(v.capacityTons),
            volume_m3: toIntOrZero(v.volumeM3),

            has_dimensions: anyDim,
            ...(anyDim
                ? {
                    length_m: toNullableNum(v.dims.length),
                    width_m: toNullableNum(v.dims.width),
                    height_m: toNullableNum(v.dims.height),
                }
                : {}),

            price_currency: v.currency || "USD",
            price_amount: toIntOrZero(v.price),

            payment_method: v.paymentMethod || "",
            payment_term: v.paymentTerm || "",

            bargain,

            contact_extra_phone: v.contactSecondary || undefined,
            extra_phone_as_main: v.extraPhoneAsMain,
            note: v.note || undefined,

            points: [...departurePoints, ...arrivalPoints],
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

            return serverMessage || t("addTransport.errorMessage");
        },
        [t],
    );

    const onValid = useCallback(
        async (values: AddTransportFormValues) => {
            if (!validateBusiness(values)) {
                toast.warning(t("addTransport.validationWarning"));
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

                await transportApi.create(payload);

                toast.success(t("addTransport.successMessage"));
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
        (_errors: FieldErrors<AddTransportFormValues>) => {
            toast.warning(t("addTransport.validationWarning"));
        },
        [t],
    );

    const onSubmit = handleSubmit(onValid, onInvalid);

    const loadCountryErrors =
        ((formState.errors.loadPlaces ?? []) as any[]).map(
            (item) => item?.location?.message as string | undefined,
        ) ?? [];

    const unloadCountryErrors =
        ((formState.errors.unloadPlaces ?? []) as any[]).map(
            (item) => item?.location?.message as string | undefined,
        ) ?? [];

    return {
        t,
        i18nLang: i18n.language,
        getLocalizedLabel,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        payMethodOpts,
        payTermOpts,

        form,

        loadCountryErrors,
        unloadCountryErrors,

        loading,
        onSubmit,
        imagePreviews,
    };
}