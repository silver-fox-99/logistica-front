import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
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
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        <Dialog
            open={open}
            onClose={close}
            fullScreen={isMobile}
            maxWidth="sm"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: isMobile ? 0 : 3,
                    m: isMobile ? 0 : 2,
                },
            }}
        >
            <DialogTitle
                sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 1.5 : 2,
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.25}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "action.hover",
                            flex: "0 0 auto",
                        }}
                    >
                        <FiBookmark />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant={isMobile ? "h6" : "h6"} sx={{ lineHeight: 1.2 }}>
                            {ui.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                            {ui.browser === "desktop" ? "Закладки" : "Главный экран / установка"}
                        </Typography>
                    </Box>
                </Stack>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 2 : 2,
                }}
            >
                <Stack spacing={1.25}>
                    <Typography variant="body2" sx={{ fontSize: isMobile ? 14 : 14, lineHeight: 1.5 }}>
                        {ui.hint}
                    </Typography>

                    <Alert
                        icon={<FiSmartphone />}
                        severity="info"
                        sx={{
                            alignItems: "flex-start",
                            "& .MuiAlert-message": { width: "100%" },
                            "& b": { fontWeight: 700 },
                            fontSize: isMobile ? 14 : 14,
                            lineHeight: 1.5,
                        }}
                    >
                        {showHowTo ? (
                            ui.howTo
                        ) : canInstall ? (
                            <>
                                Этот сайт можно установить как приложение.
                                <br />
                                Нажмите <b>Установить</b> или откройте <b>Как добавить</b> для ручной инструкции.
                            </>
                        ) : (
                            <>
                                Нажмите <b>Как добавить</b>, и мы покажем инструкцию для вашего устройства.
                            </>
                        )}
                    </Alert>

                    {canInstall && (
                        <Alert
                            icon={<FiDownload />}
                            severity="success"
                            sx={{
                                alignItems: "flex-start",
                                "& .MuiAlert-message": { width: "100%" },
                                fontSize: isMobile ? 14 : 14,
                                lineHeight: 1.5,
                            }}
                        >
                            На этом устройстве доступна установка.
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    px: isMobile ? 2 : 3,
                    py: isMobile ? 2 : 1.5,
                    pb: isMobile ? "calc(16px + env(safe-area-inset-bottom))" : 1.5,
                }}
            >
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={1}
                    sx={{ width: "100%" }}
                >
                    <Button
                        onClick={dontShowAgain}
                        color="inherit"
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                    >
                        Больше не показывать
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => setShowHowTo((v) => !v)}
                        fullWidth={isMobile}
                        size={isMobile ? "large" : "medium"}
                    >
                        {showHowTo ? "Скрыть" : "Как добавить"}
                    </Button>

                    {canInstall ? (
                        <Button
                            variant="contained"
                            onClick={onInstall}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "medium"}
                        >
                            Установить
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={close}
                            fullWidth={isMobile}
                            size={isMobile ? "large" : "medium"}
                        >
                            Понятно
                        </Button>
                    )}
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
