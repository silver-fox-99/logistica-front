export enum NotificationType {
    REGISTRATION = "REGISTRATION",
    REVIEW = "REVIEW",
    PLAN_CHANGE = "PLAN_CHANGE",
    CARGO_CREATED = "CARGO_CREATED",
    TRANSPORT_CREATED = "TRANSPORT_CREATED",
    COMPANY_CREATED = "COMPANY_CREATED",
    TENDER_CREATED = "TENDER_CREATED",
}

export type Notification = {
    id: string;
    type: NotificationType;
    user_id: string | null;
    phone: string | null;
    message: string;
    created_at: string; // ISO
    is_read: boolean;
};

export type ListNotificationsParams = {
    type?: NotificationType;
    q?: string;
    is_read?: boolean;
    offset?: number;
    limit?: number;
};

export type ListNotificationsResponse = {
    items: Notification[];
    total: number;
    limit: number;
    offset: number;
};
