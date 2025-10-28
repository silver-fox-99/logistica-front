import { useState, useMemo } from "react";
import { Button, Menu, MenuItem, ListItemIcon, ListItemText, Avatar, Tooltip } from "@mui/material";
import { FiGlobe } from "react-icons/fi";
import i18n from "@/app/providers/i18n/i18n";
import { useTranslation } from "react-i18next";

const langToCountry: Record<string, string> = {
    en: "GB",
    ru: "RU",
    uz: "UZ"
};

function flagUrl(countryCode: string, size: 24 | 32 | 48 = 24) {
    return `https://flagcdn.com/w${size}/${countryCode.toLowerCase()}.png`;
}

const LANG_OPTIONS = [
    { code: "en", labelKey: "english" },
    { code: "ru", labelKey: "russian" },
    { code: "uz", labelKey: "uzbek" }
];

export default function LanguageSwitcher() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);

    const currentLang = i18n.resolvedLanguage || i18n.language || "uz";
    const currentFlag = useMemo(
        () => flagUrl(langToCountry[currentLang] || "GB", 24),
        [currentLang]
    );

    const handleOpen = (e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const changeLang = async (lng: string) => {
        await i18n.changeLanguage(lng);
        localStorage.setItem("i18nextLng", lng);
        handleClose();
    };

    return (
        <>
            <Tooltip title={t("language")}>
                <Button
                    onClick={handleOpen}
                    variant="outlined"
                    startIcon={<FiGlobe />}
                    sx={{ textTransform: "none", borderRadius: 3, px: 1.5, py: 0.75 }}
                >
                    {currentLang.toUpperCase()}
                </Button>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {LANG_OPTIONS.map(({ code, labelKey }) => {
                    const url = flagUrl(langToCountry[code] || "GB", 24);
                    return (
                        <MenuItem key={code} selected={currentLang === code} onClick={() => changeLang(code)}>
                            <ListItemIcon>
                                <Avatar src={url} alt={code} sx={{ width: 20, height: 20 }} />
                            </ListItemIcon>
                            <ListItemText>{t(labelKey)}</ListItemText>
                        </MenuItem>
                    );
                })}
            </Menu>
        </>
    );
}
