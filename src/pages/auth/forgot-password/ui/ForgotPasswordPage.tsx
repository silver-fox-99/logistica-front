import { useMemo, useState } from "react";
import { Container, Paper, Step, StepLabel, Stepper } from "@mui/material";
import { useTranslation } from "react-i18next";
import AuthTop from "@/shared/ui/auth/auth-top";
import StepPhoneExisting from "@/features/password-reset/StepPhoneExisting";
import StepCodeReset from "@/features/password-reset/StepCodeReset";
import StepNewPassword from "@/features/password-reset/StepNewPassword";
import {useNavigate} from "react-router-dom";

export default function ForgotPasswordPage() {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [e164, setE164] = useState<string>("");
    const navigate = useNavigate()

    const steps = useMemo(() => ["", "", ""], []);

    const header = useMemo(() => {
        switch (activeStep) {
            case 0: return { title: t("forgotPassword.step1Title"), subtitle: t("forgotPassword.step1Subtitle") };
            case 1: return { title: t("forgotPassword.step2Title"), subtitle: t("forgotPassword.step2Subtitle", { phone: e164 || "your phone" }) };
            case 2: return { title: t("forgotPassword.step3Title"), subtitle: t("forgotPassword.step3Subtitle") };
            default: return { title: "", subtitle: "" };
        }
    }, [activeStep, e164, t]);

    return (
        <Container
            maxWidth="sm"
            sx={{
                py: 5,
                px: { xs: 0, sm: undefined },
            }}
        >
            <Stepper activeStep={activeStep} sx={{ mb: 3, "& .MuiStepLabel-label": { display: "none" } }}>
                {steps.map((_, i) => (<Step key={i}><StepLabel /></Step>))}
            </Stepper>

            <AuthTop title={header.title} subtitle={header.subtitle} />

            <Paper
                elevation={0}
                sx={{
                    p: { xs: "20px 0", sm: 2.5 },
                }}
            >
                {activeStep === 0 && (
                    <StepPhoneExisting
                        onNext={(phone) => { setE164(phone); setActiveStep(1); }}
                    />
                )}

                {activeStep === 1 && (
                    <StepCodeReset
                        length={6}
                        onVerified={() => setActiveStep(2)}
                        onBack={() => setActiveStep(0)}
                    />
                )}

                {activeStep === 2 && (
                    <StepNewPassword
                        onSubmit={() => navigate('/dashboard')}
                    />
                )}
            </Paper>
        </Container>
    );
}
