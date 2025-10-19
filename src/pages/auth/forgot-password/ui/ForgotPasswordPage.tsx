import { useMemo, useState } from "react";
import { Container, Paper, Step, StepLabel, Stepper } from "@mui/material";
import AuthTop from "@/shared/ui/auth/auth-top";
import StepPhoneExisting from "@/features/password-reset/StepPhoneExisting";
import StepCodeReset from "@/features/password-reset/StepCodeReset";
import StepNewPassword from "@/features/password-reset/StepNewPassword";
import {useNavigate} from "react-router-dom";
import { authApi } from "@/shared/api/authApi";

export default function ForgotPasswordPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [e164, setE164] = useState<string>("");
    const [idToken, setIdToken] = useState<string>("");
    const navigate = useNavigate()

    const steps = useMemo(() => ["", "", ""], []);

    const header = useMemo(() => {
        switch (activeStep) {
            case 0: return { title: "Reset your password", subtitle: "Enter your phone number to receive an SMS code." };
            case 1: return { title: "Enter the code", subtitle: `We sent an SMS to ${e164 || "your phone"}.` };
            case 2: return { title: "Set a new password", subtitle: "Choose a strong password for your account." };
            default: return { title: "", subtitle: "" };
        }
    }, [activeStep, e164]);

    return (
        <Container maxWidth="sm" sx={{ py: 5 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3, "& .MuiStepLabel-label": { display: "none" } }}>
                {steps.map((_, i) => (<Step key={i}><StepLabel /></Step>))}
            </Stepper>

            <AuthTop title={header.title} subtitle={header.subtitle} />

            <Paper elevation={0} sx={{ p: 2.5 }}>
                {activeStep === 0 && (
                    <StepPhoneExisting
                        onNext={(phone) => { setE164(phone); setActiveStep(1); }}
                    />
                )}

                {activeStep === 1 && (
                    <StepCodeReset
                        length={6}
                        phoneE164={e164}
                        onVerified={(token) => { setIdToken(token); setActiveStep(2); }}
                        onBack={() => setActiveStep(0)}
                    />
                )}

                {activeStep === 2 && (
                    <StepNewPassword
                        onSubmit={() => navigate('/login')}
                        submitWith={async (password) => {
                            await authApi.resetPasswordWithIdToken(idToken, password);
                        }}
                    />
                )}
            </Paper>
        </Container>
    );
}
