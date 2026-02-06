export function safeJsonParseObject(
    value: string,
): { ok: true; data: Record<string, any> } | { ok: false; error: string } {
    try {
        if (!value.trim()) return { ok: true, data: {} };
        const parsed = JSON.parse(value);

        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            return { ok: false, error: "Meta must be a JSON object" };
        }

        return { ok: true, data: parsed as Record<string, any> };
    } catch {
        return { ok: false, error: "Invalid JSON" };
    }
}
