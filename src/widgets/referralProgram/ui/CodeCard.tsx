import { memo, useMemo } from "react";
import {
    Box,
    IconButton,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import { FiCopy, FiLink } from "react-icons/fi";
import type { ReferralCodeInfo } from "@/entities/referralProgram";
import { useTranslation } from "react-i18next";

type Props = { codeInfo: ReferralCodeInfo };

type CopyRowProps = {
    label: string;
    value: string;
    onCopy: () => void;
    compact?: boolean;
};

function CopyRow({ label, value, onCopy, compact = false }: CopyRowProps) {
    return (
        <Stack spacing={0.5}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>

            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.75,
                    p: compact ? 1 : 1.25,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <Typography
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        fontWeight: compact ? 500 : 600,
                        fontSize: compact ? "0.875rem" : "1rem",
                        lineHeight: compact ? 1.35 : 1.5,
                        wordBreak: "break-all",
                        overflowWrap: "anywhere",
                        fontFamily: compact
                            ? '"Roboto Mono", "Menlo", "Monaco", "Courier New", monospace'
                            : "inherit",
                    }}
                >
                    {value}
                </Typography>

                <Tooltip title={label}>
                    <IconButton onClick={onCopy} size="small" sx={{ flexShrink: 0, mt: "-2px" }}>
                        <FiCopy size={16} />
                    </IconButton>
                </Tooltip>
            </Box>
        </Stack>
    );
}

function CodeCardBase({ codeInfo }: Props) {
    const { t } = useTranslation();

    const tooltipText = useMemo(() => t("referralProgram.code.tooltip"), [t]);

    const referralLink = useMemo(() => {
        if (typeof window === "undefined" || !codeInfo.code) return "";

        const origin = window.location.origin.replace(/\/+$/, "");
        const encodedCode = encodeURIComponent(codeInfo.code);

        return `${origin}/register/${encodedCode}`;
    }, [codeInfo.code]);

    const handleCopyCode = async () => {
        if (!codeInfo.code) return;

        try {
            await navigator.clipboard.writeText(codeInfo.code);
        } catch (error) {
            console.error("Failed to copy referral code", error);
        }
    };

    const handleCopyLink = async () => {
        if (!referralLink) return;

        try {
            await navigator.clipboard.writeText(referralLink);
        } catch (error) {
            console.error("Failed to copy referral link", error);
        }
    };

    return (
        <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
            <Stack spacing={1.5}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                    <Stack direction="row" alignItems="center" gap={1}>
                        <Box
                            sx={{
                                display: "grid",
                                placeItems: "center",
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                bgcolor: "rgba(0,0,0,0.04)",
                                flexShrink: 0,
                            }}
                        >
                            <FiLink />
                        </Box>

                        <Typography fontWeight={800}>
                            {t("referralProgram.code.title")}
                        </Typography>
                    </Stack>

                    <Tooltip title={tooltipText}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                bgcolor: "rgba(0,0,0,0.18)",
                                flexShrink: 0,
                            }}
                        />
                    </Tooltip>
                </Stack>

                <CopyRow
                    label={t("referralProgram.code.fieldLabel")}
                    value={codeInfo.code}
                    onCopy={handleCopyCode}
                />

                <CopyRow
                    label={t("referralProgram.code.fieldLabel")}
                    value={referralLink}
                    onCopy={handleCopyLink}
                    compact
                />
            </Stack>
        </Paper>
    );
}

export const CodeCard = memo(CodeCardBase);