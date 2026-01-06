export function formatDate(value?: string | number | Date | null): string {
    if (!value) return "";
    const dt = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(dt.getTime())) return "";
    return dt
        .toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" })
        .replace(/\u00A0/g, " ");
}
