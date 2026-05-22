const STORAGE_KEY = "pendingOwnerTenderIds";

function readIds() {
    if (typeof window === "undefined") return [];

    try {
        const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

export function getPendingOwnerTenderIds() {
    return readIds();
}

export function rememberPendingOwnerTender(id: string) {
    if (typeof window === "undefined" || !id) return;

    const ids = readIds();
    if (!ids.includes(id)) ids.unshift(id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, 50)));
}

export function forgetPendingOwnerTender(id: string) {
    if (typeof window === "undefined" || !id) return;

    const ids = readIds().filter((item) => item !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}
