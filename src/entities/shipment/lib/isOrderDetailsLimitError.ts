export function isOrderDetailsLimitError(error: string | null | undefined) {
    if (!error) return false;

    const normalized = error.toLowerCase();

    return (
        normalized.includes("monthly order details limit exceeded") ||
        normalized.includes("order details limit exceeded")
    );
}