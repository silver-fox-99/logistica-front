import type React from "react";

const CONTROL_KEYS = new Set([
    "Backspace",
    "Delete",
    "ArrowLeft",
    "ArrowRight",
    "ArrowUp",
    "ArrowDown",
    "Tab",
    "Enter",
    "Home",
    "End",
]);

export function sanitizeDigits(value: string) {
    return value.replace(/[^\d]/g, "");
}

export function onDigitsOnlyKeyDown(e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const key = e.key;

    // allow ctrl/cmd shortcuts
    if (e.ctrlKey || e.metaKey) return;

    if (CONTROL_KEYS.has(key)) return;

    // allow digits only
    if (/^\d$/.test(key)) return;

    e.preventDefault();
}

export function onDigitsOnlyPaste(e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const txt = e.clipboardData.getData("text");
    const sanitized = sanitizeDigits(txt);

    // если вставка "грязная" — подменяем
    if (sanitized !== txt) {
        e.preventDefault();
        document.execCommand("insertText", false, sanitized);
    }
}

export function onDigitsOnlyChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const next = sanitizeDigits(e.target.value);
    if (next !== e.target.value) e.target.value = next;
}
