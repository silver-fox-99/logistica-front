
import { useCallback, useEffect, useMemo } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { transportApi, type CreateTransportDto } from "@/shared/api/transportApi";
import { useInitStore } from "@/shared/store/initStore";
import { useGeoCascade } from "@/shared/lib/useGeoCascade";
import { useLocalizedLookup } from "@/shared/utils/lookupUtils";

import type { AddTransportFormValues } from "./types";
import {getTodayDate, PHONE_RE, toIntOrZero} from "@/features/add-cargo-form/model/useAddCargoForm.ts";

function toNullableNum(v: string) {
    const s = (v ?? "").trim();
    if (!s) return undefined;
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : undefined;
}

export function useAddTransportForm() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { getLocalizedLabel } = useLocalizedLookup();
    const { lookups, loadInit, loading: loadingInit } = useInitStore();
    const geo = useGeoCascade();

    useEffect(() => {
        loadInit();
    }, [loadInit]);

    useEffect(() => {
        void geo.loadCountries();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const vehicleOpts = useMemo(() => lookups?.vehicleType ?? [], [lookups]);
    const payMethodOpts = useMemo(() => lookups?.paymentMethods ?? [], [lookups]);
    const payTermOpts = useMemo(() => lookups?.paymentTerms ?? [], [lookups]);
    const currencyOpts = useMemo(() => lookups?.currency ?? [], [lookups]);

    const form = useForm<AddTransportFormValues>({
        mode: "onSubmit",
        shouldUnregister: false,
        defaultValues: {
            dateFrom: getTodayDate(),
            dateFromEnd: getTodayDate(),
            dateTo: "",

            loadPlaces: [{ countryId: null, regionId: null, cityId: null, address: "" }],
            unloadPlaces: [{ countryId: null, regionId: null, cityId: null, address: "" }],

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
        },
    });

    const { setValue, getValues, setError, clearErrors, handleSubmit, formState } = form;

    // defaults from lookups
    useEffect(() => {
        if (!lookups || loadingInit) return;

        const cur = getValues("currency");
        const veh = getValues("vehicleType");

        if (!cur) setValue("currency", lookups.currency?.[0]?.slug ?? "USD", { shouldDirty: false });
        if (!veh) setValue("vehicleType", lookups.vehicleType?.[0]?.slug ?? "", { shouldDirty: false });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [lookups, loadingInit]);

    const validateBusiness = useCallback(
        (v: AddTransportFormValues) => {
            clearErrors();

            let ok = true;

            if (!v.dateFrom) {
                setError("dateFrom", { type: "required", message: t("addTransport.errors.required") });
                ok = false;
            }

           // if (!v.dateTo) {
           //     setError("dateTo", { type: "required", message: t("addTransport.errors.required") });
           //     ok = false;
           // }

            if (v.dateFrom && v.dateFromEnd && v.dateFromEnd < v.dateFrom) {
                setError("dateFromEnd", { type: "validate", message: t("addTransport.errors.dateRangeOrder") });
                ok = false;
            }

            if (v.dateFromEnd && v.dateTo && v.dateTo < v.dateFromEnd) {
                setError("dateTo", { type: "validate", message: t("addTransport.errors.dateOrder") });
                ok = false;
            }

            if (!v.loadPlaces?.[0]?.countryId) {
                setError("loadPlaces.0.countryId" as any, {
                    type: "required",
                    message: t("addTransport.errors.selectCountryLoad"),
                });
                ok = false;
            }

            if (!v.unloadPlaces?.[0]?.countryId) {
                setError("unloadPlaces.0.countryId" as any, {
                    type: "required",
                    message: t("addTransport.errors.selectCountryUnload"),
                });
                ok = false;
            }

            if (!v.vehicleType) {
                setError("vehicleType", { type: "required", message: t("addTransport.errors.selectVehicleType") });
                ok = false;
            }

          //  if (!v.paymentTerm) {
          //      setError("paymentTerm", { type: "required", message: t("addTransport.errors.selectPaymentTerm") });
          //      ok = false;
          //  }

            if (v.contactSecondary && !PHONE_RE.test(v.contactSecondary)) {
                setError("contactSecondary", { type: "pattern", message: t("addTransport.errors.invalidPhone") });
                ok = false;
            }

            return ok;
        },
        [clearErrors, setError, t]
    );

    const toDto = useCallback((v: AddTransportFormValues): CreateTransportDto => {
        const bargain = v.bargaining === "possible" ? "ALLOWED" : "NOT_ALLOWED";

        const firstLoad = v.loadPlaces?.[0] ?? { countryId: "", regionId: "", cityId: "", address: "" };
        const firstUnload = v.unloadPlaces?.[0] ?? { countryId: "", regionId: "", cityId: "", address: "" };

        const anyDim =
            (toNullableNum(v.dims.length) ?? 0) > 0 ||
            (toNullableNum(v.dims.width) ?? 0) > 0 ||
            (toNullableNum(v.dims.height) ?? 0) > 0;

        const dateFromPayload =
            v.dateFromEnd && v.dateFromEnd !== v.dateFrom
                ? [v.dateFrom, v.dateFromEnd].filter(Boolean)
                : v.dateFrom || "";

        return {
            images: undefined,

            date_from: dateFromPayload as CreateTransportDto["date_from"],
            date_to: v.dateTo || "",

            vehicle_type: (v.vehicleType as CreateTransportDto["vehicle_type"]) || "ANY",

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

            points: [
                {
                    type: "DEPARTURE",
                    country: firstLoad.countryId || "",
                    region: firstLoad.regionId || "",
                    city: firstLoad.cityId || "",
                    address: firstLoad.address || "",
                },
                {
                    type: "ARRIVAL",
                    country: firstUnload.countryId || "",
                    region: firstUnload.regionId || "",
                    city: firstUnload.cityId || "",
                    address: firstUnload.address || "",
                },
            ],
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
        [t]
    );

    const onValid = useCallback(
        async (values: AddTransportFormValues) => {
            if (!validateBusiness(values)) {
                toast.warning(t("addTransport.validationWarning"));
                return;
            }

            try {
                const payload = toDto(values);
                await transportApi.create(payload);
                toast.success(t("addTransport.successMessage"));
                navigate("/dashboard/requests");
            } catch (error: any) {
                toast.error(getErrorMessage(error));
            }
        },
        [getErrorMessage, navigate, t, toDto, validateBusiness]
    );

    const onInvalid = useCallback(
        (_errors: FieldErrors<AddTransportFormValues>) => {
            toast.warning(t("addTransport.validationWarning"));
        },
        [t]
    );

    const onSubmit = handleSubmit(onValid, onInvalid);

    const loadCountryError = ((formState.errors.loadPlaces as any)?.[0]?.countryId?.message as string | undefined) ?? undefined;
    const unloadCountryError =
        ((formState.errors.unloadPlaces as any)?.[0]?.countryId?.message as string | undefined) ?? undefined;

    return {
        t,
        i18n,
        getLocalizedLabel,
        loadingInit,

        currencyOpts,
        vehicleOpts,
        payMethodOpts,
        payTermOpts,

        geo,

        form,

        loadCountryError,
        unloadCountryError,

        onSubmit,
    };
}
