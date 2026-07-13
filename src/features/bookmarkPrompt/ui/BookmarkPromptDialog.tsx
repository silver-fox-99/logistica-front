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
import { Trans, useTranslation } from "react-i18next";

const LS_KEY = "bookmark_prompt_dismissed_v2";

function isIpadOS() {
  if (typeof navigator === "undefined") return false;
  return (
    navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1
  );
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
  return (
    Boolean(nav.standalone) ||
    Boolean(window.matchMedia?.("(display-mode: standalone)")?.matches)
  );
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
  const { t } = useTranslation();

  const [open, setOpen] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = (e: Event) => {
      e.preventDefault?.();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler as EventListener);
    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
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

    const title =
      browser === "desktop"
        ? t("bookmarkPrompt.title.desktop")
        : t("bookmarkPrompt.title.mobile");

    const hint =
      browser === "desktop"
        ? t("bookmarkPrompt.hint.desktop")
        : t("bookmarkPrompt.hint.mobile");

    return { browser, title, hint };
  }, [t]);

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
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              {ui.title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.25 }}
            >
              {ui.browser === "desktop"
                ? t("bookmarkPrompt.subtitle.desktop")
                : t("bookmarkPrompt.subtitle.mobile")}
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
          <Typography variant="body2" sx={{ fontSize: 14, lineHeight: 1.5 }}>
            {ui.hint}
          </Typography>

          <Alert
            icon={<FiSmartphone />}
            severity="info"
            sx={{
              alignItems: "flex-start",
              "& .MuiAlert-message": { width: "100%" },
              "& b": { fontWeight: 600 },
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {showHowTo ? (
              <Trans i18nKey={`bookmarkPrompt.howTo.${ui.browser}`} />
            ) : canInstall ? (
              <>
                <Trans i18nKey="bookmarkPrompt.alert.canInstall" />
              </>
            ) : (
              <>
                <Trans i18nKey="bookmarkPrompt.alert.manualOnly" />
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
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {t("bookmarkPrompt.installAvailable")}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: isMobile ? 2 : 3,
          py: isMobile ? 2 : 1.5,
          pb: isMobile ? "calc(96px + env(safe-area-inset-bottom))" : 1.5,
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
            {t("bookmarkPrompt.actions.dontShowAgain")}
          </Button>

          <Button
            variant="outlined"
            onClick={() => setShowHowTo((v) => !v)}
            fullWidth={isMobile}
            size={isMobile ? "large" : "medium"}
          >
            {showHowTo
              ? t("bookmarkPrompt.actions.hide")
              : t("bookmarkPrompt.actions.howTo")}
          </Button>

          {canInstall ? (
            <Button
              variant="contained"
              onClick={onInstall}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              {t("bookmarkPrompt.actions.install")}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={close}
              fullWidth={isMobile}
              size={isMobile ? "large" : "medium"}
            >
              {t("bookmarkPrompt.actions.gotIt")}
            </Button>
          )}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
