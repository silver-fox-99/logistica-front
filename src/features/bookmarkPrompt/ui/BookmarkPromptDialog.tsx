import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    Typography,
} from "@mui/material";
import { FiBookmark, FiSmartphone } from "react-icons/fi";

const LS_KEY = "bookmark_prompt_dismissed_v1";

function isIOS() {
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua);
}

function isAndroid() {
    const ua = navigator.userAgent || "";
    return /Android/i.test(ua);
}

function isStandalone() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = navigator;
    return Boolean(nav.standalone) || window.matchMedia?.("(display-mode: standalone)")?.matches;
}

export default function BookmarkPromptDialog() {
    const [open, setOpen] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);

    useEffect(() => {
        const dismissed = localStorage.getItem(LS_KEY) === "1";
        if (dismissed) return;
        if (typeof window === "undefined") return;
        if (isStandalone()) return;

        const id = window.setTimeout(() => setOpen(true), 7000);
        return () => window.clearTimeout(id);
    }, []);

    const instruction = useMemo(() => {
        if (isIOS()) {
            return (
                <>
                    Откройте меню <b>Поделиться</b> (кнопка со стрелкой) и выберите{" "}
                    <b>«На экран Домой»</b>. Так сайт будет как приложение.
                </>
            );
        }

        if (isAndroid()) {
            return (
                <>
                    Откройте меню браузера (⋮) и выберите <b>«Установить приложение»</b> или{" "}
                    <b>«Добавить на главный экран»</b>.
                </>
            );
        }

        return (
            <>
                Нажмите <b>Ctrl + D</b> (Windows) или <b>Cmd + D</b> (Mac), чтобы добавить сайт в закладки.
            </>
        );
    }, []);

    const close = () => {
        setOpen(false);
      //  localStorage.setItem(LS_KEY, "1");
    };

    const dontShowAgain = () => {
        localStorage.setItem(LS_KEY, "1");
        setOpen(false);
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FiBookmark />
                Добавьте сайт в закладки
            </DialogTitle>

            <DialogContent>
                <Stack spacing={1.25} sx={{ mt: 1 }}>
                    <Typography variant="body2">
                        Так вы сможете быстрее возвращаться к сервису и не искать ссылку каждый раз.
                    </Typography>

                    <Alert icon={<FiSmartphone />} severity="info">
                        {showHowTo ? instruction : "Нажмите «Как добавить», и мы покажем инструкцию для вашего устройства."}
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={dontShowAgain} color="inherit">
                    Больше не показывать
                </Button>

                <Button variant="outlined" onClick={() => setShowHowTo((v) => !v)}>
                    {showHowTo ? "Скрыть" : "Как добавить"}
                </Button>

                <Button variant="contained" onClick={close}>
                    Понятно
                </Button>
            </DialogActions>
        </Dialog>
    );
}
