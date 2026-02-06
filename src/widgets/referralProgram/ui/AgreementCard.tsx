import { memo, useCallback, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Paper,
    Stack,
    Checkbox,
    Typography,
} from "@mui/material";
import { FiCheckCircle, FiFileText } from "react-icons/fi";
import type { ReferralAgreement } from "@/entities/referralProgram";

type Props = {
    agreement: ReferralAgreement;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    onSign: () => void;
    loadingContent?: boolean;
};

function AgreementCardBase({ agreement, open, onOpen, onClose, onSign, loadingContent }: Props) {
    const [accepted, setAccepted] = useState(false);

    const chip = useMemo(() => {
        if (agreement.isSigned) return { label: "Signed", color: "success" as const, icon: <FiCheckCircle /> };
        return { label: "Not signed", color: "warning" as const, icon: <FiFileText /> };
    }, [agreement.isSigned]);

    const onToggle = useCallback((_: any, v: boolean) => setAccepted(v), []);
    const onSignClick = useCallback(() => {
        if (!accepted) return;
        onSign();
    }, [accepted, onSign]);

    return (
        <>
            <Paper sx={{ p: { xs: 2, md: 2.25 }, borderRadius: 3 }}>
                <Stack spacing={1.5}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                        <Stack direction="row" alignItems="center" gap={1}>
                            <Box sx={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 2, bgcolor: "rgba(0,0,0,0.04)" }}>
                                <FiFileText />
                            </Box>
                            <Typography fontWeight={800}>Agreement</Typography>
                        </Stack>

                        <Chip
                            icon={chip.icon}
                            label={chip.label}
                            color={chip.color}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        />
                    </Stack>

                    {!agreement.isSigned ? (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            You need to sign the referral agreement to activate your referral link.
                        </Typography>
                    ) : (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                            Agreement is signed. You can share your referral link and track earnings.
                        </Typography>
                    )}

                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ pt: 0.5 }}>
                        <Button variant="outlined" onClick={onOpen} sx={{ justifyContent: "space-between" }}>
                            View Agreement
                        </Button>

                        {!agreement.isSigned && (
                            <Button
                                variant="contained"
                                onClick={onSignClick}
                                disabled={!accepted}
                                sx={{ justifyContent: "space-between" }}
                            >
                                Sign Agreement
                            </Button>
                        )}
                    </Stack>

                    {!agreement.isSigned && (
                        <FormControlLabel
                            control={<Checkbox checked={accepted} onChange={onToggle} />}
                            label="I agree to the terms"
                        />
                    )}
                </Stack>
            </Paper>

            <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
                <DialogTitle>{agreement.documentTitle}</DialogTitle>
                <DialogContent dividers>
                    {loadingContent ? (
                        <Typography variant="body2" sx={{ opacity: 0.85 }}>
                            Loading...
                        </Typography>
                    ) : (
                        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", opacity: 0.85 }}>
                            {agreement.content || "Agreement content is not available yet."}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export const AgreementCard = memo(AgreementCardBase);
