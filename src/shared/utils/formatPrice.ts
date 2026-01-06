export function formatPrice(
    value: number | string | null | undefined,
    opts?: { fractionDigits?: number }
): string | undefined {
    if (value === null || value === undefined) return undefined;
    const num = typeof value === "string" ? Number(value.toString().replace(/\s+/g, "")) : Number(value);
    if (!Number.isFinite(num)) return undefined;

    const { fractionDigits } = opts ?? {};
    const formatted = typeof fractionDigits === "number"
        ? num.toLocaleString("ru-RU", { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits })
        : num.toLocaleString("ru-RU");

    // toLocaleString возвращает неразрывные пробелы — заменим на обычные для единообразия
    return formatted.replace(/\u00A0/g, " ");
}
