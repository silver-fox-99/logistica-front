type MoneyFormatOptions = {
    fractionDigits?: number;
};

export function formatIntWithDots(
    value: string | number | bigint,
    options?: MoneyFormatOptions,
): string {
    if (value === null || value === undefined) return "0.00";

    let s = String(value).trim();
    if (!s) return "0.00";

    const isNegative = s.startsWith("-");
    s = s.replace(/[^\d]/g, ""); // оставляем только цифры (ожидаем cents/копейки)

    const fractionDigits = options?.fractionDigits ?? 2;

    if (!s) {
        return isNegative ? `-0.${"0".repeat(fractionDigits)}` : `0.${"0".repeat(fractionDigits)}`;
    }

    let intPartRaw: string;
    let fracPart: string;

    if (s.length <= fractionDigits) {
        intPartRaw = "0";
        fracPart = s.padStart(fractionDigits, "0");
    } else {
        intPartRaw = s.slice(0, -fractionDigits);
        fracPart = s.slice(-fractionDigits).padStart(fractionDigits, "0");
    }

    const intPart = intPartRaw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    const out = `${intPart}.${fracPart}`;
    return isNegative ? `-${out}` : out;
}
