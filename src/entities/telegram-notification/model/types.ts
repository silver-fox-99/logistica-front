export type TelegramNotificationConfig = {
    id: string;
    name: string;
    bot_token: string;
    chat_ids: string[];
    send_cargo: boolean;
    send_transport: boolean;
    is_active: boolean;
    created_at: string;
    updated_at: string;
};

export type ListTelegramNotificationConfigsParams = {
    search?: string;
    page?: number;
    limit?: number;
    is_active?: boolean;
};

export type ListTelegramNotificationConfigsResponse = {
    status: boolean;
    items: TelegramNotificationConfig[];
    total: number;
    page: number;
    limit: number;
    pages: number;
    message: string;
};

export type CreateTelegramNotificationConfigPayload = {
    name: string;
    bot_token: string;
    chat_ids: string[];
    send_cargo?: boolean;
    send_transport?: boolean;
    is_active?: boolean;
};

export type UpdateTelegramNotificationConfigPayload = Partial<CreateTelegramNotificationConfigPayload>;