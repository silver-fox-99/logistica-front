import React, { useMemo, useState } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Tooltip, Box } from "@mui/material";
import { FiGlobe } from "react-icons/fi";
import i18n from "@/shared/config/i18n/i18n.ts";
import { useTranslation } from "react-i18next";

const langToCountry: Record<string, string> = {
    en: "gb",
    ru: "ru",
    uz: "uz",
};


function flagUrlCircle(cc: string) {
    return `https://cdn.jsdelivr.net/gh/HatScripts/circle-flags/flags/${cc.toLowerCase()}.svg`;
}

const LANG_OPTIONS = [
    { code: "en", label: "English" },
    { code: "ru", label: "Русский" },
    { code: "uz", label: "O'zbek" },
];

export default function LanguageSwitcher() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const rawLang = i18n.resolvedLanguage || i18n.language || "uz";
    const currentLang = (rawLang.split?.("-")?.[0] || rawLang) as keyof typeof langToCountry;

    const currentFlag = useMemo(() => flagUrlCircle(langToCountry[currentLang] ?? "gb"), [currentLang]);
    const [flagError, setFlagError] = useState(false);

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const changeLang = async (lng: string) => {
        await i18n.changeLanguage(lng);
        localStorage.setItem("i18nextLng", lng);
        setFlagError(false);
        handleClose();
    };

    return (
        <>
            <Tooltip title={t("language")}>
                <Button
                    onClick={handleOpen}
                    variant="outlined"
                    startIcon={
                        flagError ? (
                            <FiGlobe />
                        ) : (
                            <Box
                                component="img"
                                src={currentFlag}
                                alt={String(currentLang)}
                                sx={{ width: 18, height: 18, borderRadius: "50%" }}
                                onError={() => setFlagError(true)}
                                crossOrigin="anonymous"
                                referrerPolicy="no-referrer"
                            />
                        )
                    }
                    sx={{ textTransform: "none", borderRadius: 3, px: 1.5, py: 0.75 }}
                >
                    {String(currentLang).toUpperCase()}
                </Button>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {LANG_OPTIONS.map(({ code, label }) => {
                    const cc = langToCountry[code] || "gb";
                    const url = flagUrlCircle(cc);
                    return (
                        <MenuItem key={code} selected={currentLang === code} onClick={() => changeLang(code)}>
                            <ListItemIcon>
                                <Avatar
                                    src={url}
                                    alt={code}
                                    sx={{ width: 20, height: 20 }}
                                    imgProps={{
                                        crossOrigin: "anonymous",
                                        referrerPolicy: "no-referrer",
                                        onError: (e) => { (e.currentTarget as HTMLImageElement).src = flagUrlCircle("gb"); }
                                    }}
                                />
                            </ListItemIcon>
                            <ListItemText>{label}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
