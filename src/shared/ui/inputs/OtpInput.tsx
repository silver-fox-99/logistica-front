import { useEffect, useRef } from "react";
import { Box, TextField } from "@mui/material";

type OtpInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
};

export default function OtpInput({ length = 6, value, onChange, autoFocus }: OtpInputProps) {
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    const vals = (value ?? "").slice(0, length).padEnd(length, " ").split("");

    const handleBoxClick = () => {
        if (hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    };

    useEffect(() => {
        if (autoFocus && hiddenInputRef.current) {
            hiddenInputRef.current.focus();
        }
    }, [autoFocus]);

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
            {/* 1. СКРЫТЫЙ ИНПУТ, КОТОРЫЙ ОДОБРИТ SAFARI */}
            <TextField
                inputRef={hiddenInputRef}
                value={value}
                onChange={(e) => {
                    const raw = e.target.value;
                    const digits = raw.replace(/\D/g, "").slice(0, length);
                    onChange(digits);
                }}
                inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: length,
                    autoComplete: "one-time-code",
                }}
                sx={{
                    // Не используем opacity: 0 и полную невидимость
                    position: "absolute",
                    left: 0,
                    top: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: 1,
                    // Делаем его невидимым через цвет текста и подложки,
                    // чтобы Safari считал его "настоящим" интерактивным полем
                    "& .MuiOutlinedInput-root": {
                        color: "transparent",
                        backgroundColor: "transparent",
                        "& fieldset": { border: "none" }, // убираем рамку
                    },
                    "& input": {
                        color: "transparent",
                        cursor: "text",
                        height: "100%",
                        padding: 0,
                    }
                }}
            />

            {/* 2. КРАСИВЫЕ КАРТОЧКИ-ВИЗУАЛИЗАТОРЫ */}
            {Array.from({ length }).map((_, i) => {
                const isFocused = value.length === i || (value.length === length && i === length - 1);

                return (
                    <TextField
                        key={i}
                        value={vals[i] === " " ? "" : vals[i]}
                        tabIndex={-1}
                        sx={{
                            pointerEvents: "none", // Клик проходит сквозь них на скрытый инпут под ними
                            zIndex: 0,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "10px",
                                borderColor: isFocused ? "primary.main" : "inherit",
                                borderWidth: isFocused ? 2 : 1,
                            },
                            "& input": {
                                textAlign: "center",
                                fontSize: { xs: 20, sm: 24 },
                                fontWeight: 600,
                                width: { xs: "100%", sm: 80 },
                                minWidth: { xs: 44, sm: 80 },
                                height: { xs: 56, sm: 80 },
                                padding: 0,
                            },
                        }}
                    />
                );
            })}
        </Box>
    );
}