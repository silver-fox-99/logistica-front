import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { companiesApi } from "@/shared/api/companiesApi";
import type { CompanyInvitationPreview } from "@/entities/company/model/types";

type UseCompanyInvitationAcceptResult = {
    invitation: CompanyInvitationPreview | null;
    isLoading: boolean;
    isSubmitting: boolean;
    error: string;
    success: string;
    accept: () => Promise<boolean>;
    decline: () => Promise<boolean>;
};

export function useCompanyInvitationAccept(token: string): UseCompanyInvitationAcceptResult {
    const navigate = useNavigate();

    const [invitation, setInvitation] = useState<CompanyInvitationPreview | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const load = useCallback(async () => {
        if (!token) return;

        try {
            setIsLoading(true);
            setError("");

            const data = await companiesApi.getInvitationByToken(token);
            setInvitation(data);
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to load invitation.";

            setError(Array.isArray(message) ? message[0] : message);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        load();
    }, [load]);

    const accept = async () => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.acceptInvitation(token);
            setSuccess("Invitation accepted successfully.");

            setTimeout(() => {
                navigate("/dashboard/company");
            }, 600);

            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to accept invitation.";

            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const decline = async () => {
        try {
            setIsSubmitting(true);
            setError("");
            setSuccess("");

            await companiesApi.declineInvitation(token);
            setSuccess("Invitation declined.");

            setTimeout(() => {
                navigate("/dashboard/company");
            }, 600);

            return true;
        } catch (e: any) {
            const message =
                e?.response?.data?.message ||
                e?.message ||
                "Failed to decline invitation.";

            setError(Array.isArray(message) ? message[0] : message);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        invitation,
        isLoading,
        isSubmitting,
        error,
        success,
        accept,
        decline,
    };
}