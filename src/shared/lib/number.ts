export const sanitizeDigits = (v: string) => v.replace(/\D/g, "");

export const toOptionalNumber = (v: string) => {
    const cleaned = sanitizeDigits(v);
    return cleaned === "" ? undefined : Number(cleaned);
};
