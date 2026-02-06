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
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { FiBookmark, FiSmartphone, FiDownload } from "react-icons/fi";

const LS_KEY = "bookmark_prompt_dismissed_v2";

function isIpadOS() {
    if (typeof navigator === "undefined") return false;
    return navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1;
}

function isIOS() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /iPhone|iPad|iPod/i.test(ua) || isIpadOS();
}

function isAndroid() {
    if (typeof navigator === "undefined") return false;
    const ua = navigator.userAgent || "";
    return /Android/i.test(ua);
}

function isStandalone() {
    if (typeof window === "undefined") return false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav: any = navigator;
    return Boolean(nav.standalone) || Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches);
}

type MobileBrowser =
    | "ios_safari"
    | "ios_chrome"
    | "ios_edge"
    | "ios_firefox"
    | "android_chrome"
    | "android_samsung"
    | "android_edge"
    | "android_firefox"
    | "android_other"
    | "desktop";

function detectMobileBrowser(): MobileBrowser {
    if (typeof navigator === "undefined") return "desktop";
    const ua = navigator.userAgent || "";

    if (isIOS()) {
        if (/CriOS/i.test(ua)) return "ios_chrome";
        if (/EdgiOS/i.test(ua)) return "ios_edge";
        if (/FxiOS/i.test(ua)) return "ios_firefox";
        return "ios_safari";
    }

    if (isAndroid()) {
        if (/SamsungBrowser/i.test(ua)) return "android_samsung";
        if (/EdgA/i.test(ua)) return "android_edge";
        if (/Firefox/i.test(ua)) return "android_firefox";
        if (/Chrome/i.test(ua)) return "android_chrome";
        return "android_other";
    }

    return "desktop";
}

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function BookmarkPromptDialog() {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [open, setOpen] = useState(false);
    const [showHowTo, setShowHowTo] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const handler = (e: Event) => {
            e.preventDefault?.();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };

        window.addEventListener("beforeinstallprompt", handler as EventListener);
        return () => window.removeEventListener("beforeinstallprompt", handler as EventListener);
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (isStandalone()) return;

        let dismissed = false;
        try {
            dismissed = localStorage.getItem(LS_KEY) === "1";
        } catch {
            dismissed = false;
        }
        if (dismissed) return;

        const id = window.setTimeout(() => setOpen(true), 7000);
        return () => window.clearTimeout(id);
    }, []);

    const ui = useMemo(() => {
        const browser = detectMobileBrowser();

        const title = browser === "desktop" ? "Добавьте сайт в закладки" : "Добавьте сайт на главный экран";
        const hint =
            browser === "desktop"
                ? "Так вы сможете быстрее возвращаться к сервису и не искать ссылку каждый раз."
                : "Так будет быстрее открывать сервис — он появится как иконка, почти как приложение.";

        const howTo = (() => {
            switch (browser) {
                case "ios_safari":
                    return (
                        <>
                            Нажмите <b>Поделиться</b> (квадрат со стрелкой вверх) и выберите <b>На экран «Домой»</b>.
                            <br />
                            Если пункта не видно — прокрутите список действий вниз.
                        </>
                    );

                case "ios_chrome":
                case "ios_edge":
                case "ios_firefox":
                    return (
                        <>
                            На iPhone/iPad все браузеры используют одно и то же меню.
                            <br />
                            Нажмите <b>Поделиться</b> и выберите <b>На экран «Домой»</b>.
                        </>
                    );

                case "android_chrome":
                    return (
                        <>
                            Откройте меню браузера (⋮) и выберите <b>Установить приложение</b> или <b>Добавить на главный экран</b>.
                            <br />
                            Если появится предложение установить — можно нажать его.
                        </>
                    );

                case "android_samsung":
                    return (
                        <>
                            Откройте меню (≡ или ⋮) и выберите <b>Добавить страницу на</b> → <b>Главный экран</b> или{" "}
                            <b>Установить приложение</b> (если доступно).
                        </>
                    );

                case "android_edge":
                    return (
                        <>
                            Откройте меню (⋯) и выберите <b>Приложения</b> → <b>Установить этот сайт как приложение</b> либо{" "}
                            <b>Добавить на главный экран</b>.
                            <br />
                            Название пункта может отличаться.
                        </>
                    );

                case "android_firefox":
                    return (
                        <>
                            Откройте меню (⋮) и выберите <b>Установить</b> (если доступно) или <b>Добавить на главный экран</b>.
                        </>
                    );

                case "android_other":
                    return (
                        <>
                            Откройте меню браузера и найдите пункт <b>Добавить на главный экран</b> или <b>Установить приложение</b>.
                        </>
                    );

                default:
                    return (
                        <>
                            Нажмите <b>Ctrl + D</b> (Windows) или <b>Cmd + D</b> (Mac), чтобы добавить сайт в закладки.
                        </>
                    );
            }
        })();

        return { browser, title, hint, howTo };
    }, []);

    const close = () => setOpen(false);

    const dontShowAgain = () => {
        try {
            localStorage.setItem(LS_KEY, "1");
        } catch {
            // ignore
        }
        setOpen(false);
    };

    const canInstall = Boolean(deferredPrompt);

    const onInstall = async () => {
        if (!deferredPrompt) return;

        try {
            await deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            if (choice.outcome === "accepted") {
                try {
                    localStorage.setItem(LS_KEY, "1");
                } catch {
                    // ignore
                }
                setOpen(false);
            }
        } finally {
            setDeferredPrompt(null);
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onClose={close} maxWidth="sm" fullWidth fullScreen={fullScreen}>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <FiBookmark />
                {ui.title}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={1.25} sx={{ mt: 1 }}>
                    <Typography variant="body2">{ui.hint}</Typography>

                    <Alert icon={<FiSmartphone />} severity="info">
                        {showHowTo ? (
                            ui.howTo
                        ) : canInstall ? (
                            <>
                                Этот сайт можно установить как приложение. Нажмите <b>Установить</b> или откройте <b>Как добавить</b>{" "}
                                для ручной инструкции.
                            </>
                        ) : (
                            <>
                                Нажмите <b>Как добавить</b>, и мы покажем инструкцию для вашего устройства.
                            </>
                        )}
                    </Alert>

                    {canInstall && (
                        <Alert icon={<FiDownload />} severity="success">
                            На этом устройстве доступна установка.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={dontShowAgain} color="inherit">
                    Больше не показывать
                </Button>

                <Button variant="outlined" onClick={() => setShowHowTo((v) => !v)}>
                    {showHowTo ? "Скрыть" : "Как добавить"}
                </Button>

                {canInstall ? (
                    <Button variant="contained" onClick={onInstall}>
                        Установить
                    </Button>
                ) : (
                    <Button variant="contained" onClick={close}>
                        Понятно
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}
