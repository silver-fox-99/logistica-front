export type RegistrationStage =
    | "PENDING"
    | "PHONE_VERIFIED"
    | "EMAIL_VERIFIED"
    | "PROFILE"
    | "COMPLETED";

export type UserStatus = "ACTIVE" | "INACTIVE" | "BLOCKED";

export interface User {
    id: string;


    is_admin: boolean;


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
    telegram_chat_id?: string;
    discount_percent?: number | string | null;
    discount_expires_at?: string | null;
    discount_reason?: string | null;
    last_login_at: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string | null;
}
