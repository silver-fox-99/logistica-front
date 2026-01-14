import type { TariffSubscription, Entitlements } from "@/shared/api/tariffsApi";

export type RegistrationStage =
    | "PENDING"
    | "PHONE_VERIFIED"
    | "PROFILE"
    | "COMPLETED";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface User {
    id: string;


    is_admin: boolean;

    tariff?: {
        active_subscription?: TariffSubscription | null;
        effective_entitlements?: Entitlements | null;
    };


    phone: string;
    phone_verified_at: string | null;
    email: string | null;
    email_verified_at: string | null;


    first_name: string;
    last_name: string;
    avatar: string | null;
    avatar_url?: string | null;


    registration_stage: RegistrationStage;
    status: UserStatus;


    meta: any;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
