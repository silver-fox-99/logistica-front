import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { companiesApi } from "@/shared/api/companiesApi";

type FormValues = {
    name: string;
};

export function useCreateCompany() {
    const navigate = useNavigate();
    const [values, setValues] = useState<FormValues>({ name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>("");

    const setField = (field: keyof FormValues, value: string) => {
        setValues((prev) => ({ ...prev, [field]: value }));
    };

    const submit = async () => {
        const name = values.name.trim();

        if (!name) {
            setError("Company name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const company = await companiesApi.create({ name });

            navigate(`/dashboard/company/${company.id}`);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to create company.";
            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        values,
        error,
        isSubmitting,
        setField,
        submit,
    };
}