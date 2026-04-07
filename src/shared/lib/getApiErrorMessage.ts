export function getApiErrorMessage(error: unknown, fallback = "Something went wrong") {
    const maybeAxios = error as {
        response?: {
            data?: {
                message?: string | string[];
            };
        };
    };

    const message = maybeAxios?.response?.data?.message;

    if (Array.isArray(message)) {
        return message.join(", ");
    }

    if (typeof message === "string" && message.trim()) {
        return message;
    }

    return fallback;
}