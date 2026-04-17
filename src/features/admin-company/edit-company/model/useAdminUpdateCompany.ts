import { useEffect, useState } from "react";
import { adminCompaniesApi } from "@/shared/api/adminCompaniesApi";
import type { Company, UpdateCompanyAdminPayload } from "@/entities/company/model/types";

type AdminCompanyFormValues = {
    name: string;
    legal_name: string;
    registration_number: string;
    tax_number: string;
    phone: string;
    email: string;
    website: string;
    logo: string;
    description: string;
    country: string;
    region: string;
    city: string;
    address: string;
    members_limit: string;
};

export function useAdminUpdateCompany(
    company: Company | null,
    onUpdated?: (company: Company) => void,
) {
    const [values, setValues] = useState<AdminCompanyFormValues>({
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
        members_limit: "",
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
            members_limit: company.members_limit != null ? String(company.members_limit) : "",
        });
    }, [company]);

    const setField = (field: keyof AdminCompanyFormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        if (!company?.id) return;

        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            const payload: UpdateCompanyAdminPayload = {
                name: values.name.trim() || undefined,
                legal_name: values.legal_name.trim() || null,
                registration_number: values.registration_number.trim() || null,
                tax_number: values.tax_number.trim() || null,
                phone: values.phone.trim() || null,
                email: values.email.trim() || null,
                website: values.website.trim() || null,
                logo: values.logo.trim() || null,
                description: values.description.trim() || null,
                country: values.country.trim() || null,
                region: values.region.trim() || null,
                city: values.city.trim() || null,
                address: values.address.trim() || null,
                members_limit: values.members_limit.trim()
                    ? Number(values.members_limit)
                    : null,
            };

            const updated = await adminCompaniesApi.update(company.id, payload);

            setSuccess("Компания обновлена");
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
        setField,
        submit,
        isSubmitting,
        error,
        success,
    };
}