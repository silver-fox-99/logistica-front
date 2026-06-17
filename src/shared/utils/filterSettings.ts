export function getTodayDateString(): string {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function getOffsetDateString(offset: number): string {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function resolveFilterDate(value: any): string | undefined {
    if (typeof value !== "string") return undefined;
    if (value === "today") return getTodayDateString();
    if (value.startsWith("today+")) {
        const offset = parseInt(value.slice(6), 10);
        return isNaN(offset) ? undefined : getOffsetDateString(offset);
    }
    if (value.startsWith("today-")) {
        const offset = parseInt(value.slice(6), 10);
        return isNaN(offset) ? undefined : getOffsetDateString(-offset);
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    return undefined;
}

export function resolveFilters(filters: any): any {
    if (!filters) return {};
    const resolved = { ...filters };
    const dateKeys = ["pickup_date_from", "pickup_date_to", "dropoff_date_from", "dropoff_date_to"];
    dateKeys.forEach((key) => {
        if (key in resolved) {
            const val = resolved[key];
            if (val) {
                const resolvedDate = resolveFilterDate(val);
                if (resolvedDate) {
                    resolved[key] = resolvedDate;
                } else {
                    delete resolved[key];
                }
            } else {
                delete resolved[key];
            }
        }
    });
    return resolved;
}
