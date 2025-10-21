export function diffPayload<T extends Record<string, any>>(original: Partial<T>, next: Partial<T>) {
    const out: Partial<T> = {};
    for (const k of Object.keys(next) as (keyof T)[]) {
        const a = original[k];
        const b = next[k];
        if (JSON.stringify(a) !== JSON.stringify(b)) out[k] = b;
    }
    return out;
}
