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
    // оставляем только цифры и точку
    let v = value.replace(/[^\d.]/g, "");

    // одна точка максимум
    const dot = v.indexOf(".");
    if (dot !== -1) {
        const intPart = v.slice(0, dot);
        let fracPart = v.slice(dot + 1).replace(/\./g, ""); // удаляем лишние точки
        fracPart = fracPart.slice(0, 2); // максимум 2 знака после точки
        v = `${intPart}.${fracPart}`;
    }

    // если пользователь начал с точки — делаем "0."
    if (v.startsWith(".")) v = `0${v}`;

    return v;
}

export function onDigitsOnlyKeyDown(
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
) {
    const key = e.key;

    // allow ctrl/cmd shortcuts
    if (e.ctrlKey || e.metaKey) return;

    if (CONTROL_KEYS.has(key)) return;

    const el = e.currentTarget;
    const value = el.value ?? "";
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;
    const hasSelection = start !== end;

    // allow digits (но ограничиваем 2 знака после точки)
    if (/^\d$/.test(key)) {
        const dot = value.indexOf(".");
        if (dot !== -1) {
            const caretInFraction = start > dot; // курсор правее точки
            if (caretInFraction && !hasSelection) {
                const fracLen = value.length - dot - 1;
                if (fracLen >= 2) {
                    e.preventDefault();
                    return;
                }
            }
        }
        return;
    }

    // allow dot only once
    if (key === ".") {
        // если точка уже есть — запрещаем (кроме случая, когда выделением её заменяем)
        if (value.includes(".")) {
            // разрешим, если выделенный диапазон содержит текущую точку
            const dot = value.indexOf(".");
            const dotIsSelected = dot >= start && dot < end;
            if (!dotIsSelected) e.preventDefault();
        }
        return;
    }

    e.preventDefault();
}

export function onDigitsOnlyPaste(
    e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>
) {
    const el = e.currentTarget;
    const pasted = e.clipboardData.getData("text");

    // вставку обрабатываем с учётом текущего value и выделения
    const value = el.value ?? "";
    const start = el.selectionStart ?? value.length;
    const end = el.selectionEnd ?? value.length;

    const nextRaw = value.slice(0, start) + pasted + value.slice(end);
    const next = sanitizeDigits(nextRaw);

    if (next !== nextRaw) {
        e.preventDefault();
        // вставляем уже “нормализованную” строку
        document.execCommand("insertText", false, next);
    }
}

export function onDigitsOnlyChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) {
    const next = sanitizeDigits(e.target.value);
    if (next !== e.target.value) e.target.value = next;
}
