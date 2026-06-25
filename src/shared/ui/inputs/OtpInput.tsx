import { useEffect, useRef, useState } from "react";
import { Box } from "@mui/material";

type OtpInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
};

export default function OtpInput({ length = 6, value, onChange, autoFocus }: OtpInputProps) {
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);
    // Отслеживаем, находится ли инпут в фокусе
    const [isInputFocused, setIsInputFocused] = useState(false);

    const vals = (value ?? "").slice(0, length).padEnd(length, " ").split("");

    const handleBoxClick = () => {
        hiddenInputRef.current?.focus();
    };

    useEffect(() => {
        if (autoFocus) {
            hiddenInputRef.current?.focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        if (!("OTPCredential" in window)) return;

        const ac = new AbortController();

        navigator.credentials
            .get({
                otp: { transport: ["sms"] },
                signal: ac.signal,
            } as any)
            .then((otp: any) => {
                if (otp && otp.code) {
                    onChange(otp.code);
                }
            })
            .catch((err) => {
                console.log("Web OTP API error:", err);
            });

        return () => {
            ac.abort();
        };
    }, [onChange]);

    return (
        <Box
            onClick={handleBoxClick}
            sx={{
                position: "relative",
                display: { xs: "grid", sm: "flex" },
                gap: { xs: 1, sm: 1.5 },
                gridTemplateColumns: { xs: `repeat(${length}, minmax(44px, 1fr))` },
                justifyContent: "center",
                width: "100%",
                cursor: "text",
            }}
        >
            {/* 1. НАТИВНЫЙ СКРЫТЫЙ ИНПУТ */}
            <input
                ref={hiddenInputRef}
                value={value}
                onChange={(e) => {
                    const raw = e.target.value;
                    const digits = raw.replace(/\D/g, "").slice(0, length);
                    onChange(digits);
                }}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={length}
                autoComplete="one-time-code"
                style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0.01,
                    zIndex: 2,
                    cursor: "text",
                    fontSize: "16px",
                }}
            />

            {/* 2. КРАСИВЫЕ КАРТОЧКИ-ВИЗУАЛИЗАТОРЫ */}
            {Array.from({ length }).map((_, i) => {
                // Карточка считается активной, только если инпут в фокусе
                // и это либо текущий пустой слот, либо последний слот, если всё заполнено
                const isCellFocused =
                    isInputFocused &&
                    (value.length === i || (value.length === length && i === length - 1));

                return (
                    <Box
                        key={i}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: "10px",
                            border: "1px solid",
                            // Плавное изменение цвета рамки
                            transition: "all 0.2s ease-in-out",
                            borderColor: isCellFocused ? "primary.main" : "divider",
                            boxShadow: isCellFocused ? (theme) => `0 0 0 1px ${theme.palette.primary.main}` : "none",
                            backgroundColor: "background.paper",

                            // Размеры
                            width: { xs: "100%", sm: 80 },
                            minWidth: { xs: 44, sm: 80 },
                            height: { xs: 56, sm: 80 },

                            // Шрифт
                            fontSize: { xs: 20, sm: 24 },
                            fontWeight: 600,
                            color: "text.primary",
                            userSelect: "none",
                            zIndex: 1,
                        }}
                    >
                        {vals[i] === " " ? "" : vals[i]}
                    </Box>
                );
            })}
        </Box>
    );
}