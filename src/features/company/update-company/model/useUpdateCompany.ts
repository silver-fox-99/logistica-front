import { useEffect, useState } from "react";
import { companiesApi } from "@/shared/api/companiesApi";
import type { Company, UpdateCompanyPayload } from "@/entities/company/model/types";

export function useUpdateCompany(company: Company | null, onUpdated?: (company: Company) => void) {
    const [values, setValues] = useState<UpdateCompanyPayload>({
        name: "",
        legal_name: "",
        registration_number: "",
        tax_number: "",
        phone: "",
        email: "",
        website: "",
        logo: "",
        description: "",
        country: "",
        region: "",
        city: "",
        address: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        if (!company) return;

        setValues({
            name: company.name ?? "",
            legal_name: company.legal_name ?? "",
            registration_number: company.registration_number ?? "",
            tax_number: company.tax_number ?? "",
            phone: company.phone ?? "",
            email: company.email ?? "",
            website: company.website ?? "",
            logo: company.logo ?? "",
            description: company.description ?? "",
            country: company.country ?? "",
            region: company.region ?? "",
            city: company.city ?? "",
            address: company.address ?? "",
        });
    }, [company]);

    const setField = (field: keyof UpdateCompanyPayload, value: string) => {
        setValues((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const submit = async () => {
        if (!company?.id) return;

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            const payload: UpdateCompanyPayload = {
                name: values.name?.trim() || undefined,
                legal_name: values.legal_name?.trim() || null,
                registration_number: values.registration_number?.trim() || null,
                tax_number: values.tax_number?.trim() || null,
                phone: values.phone?.trim() || null,
                email: values.email?.trim() || null,
                website: values.website?.trim() || null,
                logo: values.logo?.trim() || null,
                description: values.description?.trim() || null,
                country: values.country?.trim() || null,
                region: values.region?.trim() || null,
                city: values.city?.trim() || null,
                address: values.address?.trim() || null,
            };

            const updated = await companiesApi.updateMy(company.id, payload);

            setSuccess("Company profile updated successfully.");
            onUpdated?.(updated);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to update company.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        isSubmitting,
        error,
        success,
        setField,
        submit,
    };
}