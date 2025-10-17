// src/shared/ui/inputs/OtpInput.tsx
import { useEffect, useRef } from "react";
import { Box, TextField } from "@mui/material";

type OtpInputProps = {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    autoFocus?: boolean;
};

export default function OtpInput({ length = 4, value, onChange, autoFocus }: OtpInputProps) {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    // нормализуем длину
    const vals = (value ?? "").slice(0, length).padEnd(length, " ").split("");

    const focusIndex = (i: number) => {
        const el = inputsRef.current[i];
        if (el) el.focus();
    };

    const setChar = (i: number, ch: string) => {
        const digits = value.split("");
        digits[i] = ch;
        const next = digits.join("").slice(0, length);
        onChange(next);
    };

    // автофокус на первую ячейку
    useEffect(() => {
        if (autoFocus) focusIndex(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFocus]);

    return (
        <Box
            onPaste={(e) => {
                e.preventDefault();
                const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
                onChange(text);

                const nextIndex = Math.min(text.length, length - 1);
                focusIndex(nextIndex);
            }}
            sx={{ display: "flex", justifyContent: 'center', gap: 1 }}
        >
            {Array.from({ length }).map((_, i) => (
                <TextField
                    key={i}
                    inputRef={(el) => (inputsRef.current[i] = el)}
                    value={vals[i] === " " ? "" : vals[i]}
                    onChange={(e) => {
                        const raw = e.target.value;
                        const digit = raw.replace(/\D/g, "").slice(-1);
                        if (!digit && raw === "") {
                            setChar(i, "");
                            return;
                        }
                        if (!digit) return;
                        setChar(i, digit);
                        if (i < length - 1) focusIndex(i + 1);
                    }}
                    onKeyDown={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (e.key === "Backspace" && !target.value && i > 0) {
                            setChar(i - 1, "");
                            focusIndex(i - 1);
                            e.preventDefault();
                        }
                        if (e.key === "ArrowLeft" && i > 0) {
                            focusIndex(i - 1);
                            e.preventDefault();
                        }
                        if (e.key === "ArrowRight" && i < length - 1) {
                            focusIndex(i + 1);
                            e.preventDefault();
                        }
                    }}
                    onFocus={(e) => e.currentTarget.select()}
                    inputProps={{
                        inputMode: "numeric",
                        pattern: "[0-9]*",
                        maxLength: 1,
                        style: {
                            textAlign: "center",
                            fontSize: 24,
                            fontWeight: 600,
                            width: 80,
                            height: 80,
                            padding: 0,
                        },
                    }}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                        },
                    }}
                />
            ))}
        </Box>
    );
}
