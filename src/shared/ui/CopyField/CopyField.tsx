import { memo, useCallback, useMemo, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    TextField,
    Tooltip,
    useMediaQuery,
} from "@mui/material";
import { FiCopy } from "react-icons/fi";

type Props = {
    label: string;
    value: string;
    disabled?: boolean;
    copyText?: string;
    buttonLabel?: string;
    fullWidth?: boolean;
};

function CopyFieldBase({
                           label,
                           value,
                           disabled,
                           copyText,
                           buttonLabel = "Copy",
                           fullWidth = true,
                       }: Props) {
    const [copied, setCopied] = useState(false);
    const isMobile = useMediaQuery("(max-width:600px)");

    const textToCopy = useMemo(() => (copyText ?? value), [copyText, value]);

    const onCopy = useCallback(async () => {
        if (disabled) return;
        try {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // ignore
        }
    }, [disabled, textToCopy]);

    return (
        <Box sx={{ display: "flex", gap: 1, alignItems: "center", width: fullWidth ? "100%" : "auto" }}>
            <TextField
                fullWidth={fullWidth}
                label={label}
                value={value}
                disabled={disabled}
                inputProps={{ readOnly: true }}
            />

            {isMobile ? (
                <Tooltip title={copied ? "Copied" : "Copy"}>
          <span>
            <IconButton onClick={onCopy} disabled={disabled} aria-label="copy">
              <FiCopy />
            </IconButton>
          </span>
                </Tooltip>
            ) : (
                <Tooltip title={copied ? "Copied" : "Copy"}>
          <span>
            <Button
                variant="contained"
                onClick={onCopy}
                disabled={disabled}
                startIcon={<FiCopy />}
                sx={{ whiteSpace: "nowrap" }}
            >
              {buttonLabel}
            </Button>
          </span>
                </Tooltip>
            )}
        </Box>
    );
}

export const CopyField = memo(CopyFieldBase);
