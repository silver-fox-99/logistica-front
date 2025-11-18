import {useEffect, useMemo, useState} from "react";
import { Box, Container, Paper, Step, StepLabel, Stepper, Stack, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthTop from "@/shared/ui/auth/auth-top";
import StepPhone from "@/features/login/register/ui/StepPhone";
import StepCode from "@/features/login/register/ui/StepCode";
import StepProfile from "@/features/login/register/ui/StepProfile";
import {authApi} from "@/shared/api/authApi.ts";

export default function RegisterPage() {
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [e164, setE164] = useState<string>("");
    const steps = useMemo(() => ["", "", ""], []);

    const next = () => setActiveStep((s) => Math.min(s + 1, 2));
    const back = () => setActiveStep((s) => Math.max(s - 1, 0));

    const header = useMemo(() => {
        switch (activeStep) {
            case 0: return { title: t("register.step1Title"), subtitle: t("register.step1Subtitle") };
            case 1: return { title: t("register.step2Title"), subtitle: t("register.step2Subtitle", { phone: e164 || "your phone" }) };
            case 2: return { title: t("register.step3Title"), subtitle: t("register.step3Subtitle") };
            default: return { title: "", subtitle: "" };
        }
    }, [activeStep, e164, t]);

    const Content = useMemo(() => {
        switch (activeStep) {
            case 0:
                return <StepPhone onNext={(phoneE164) => { setE164(phoneE164); next(); }} />;
            case 1:
                return (
                    <StepCode
                        length={6}
                        onSubmit={next}
                    />
                );
            case 2:
                return <StepProfile />;
            default:
                return null;
        }
    }, [activeStep, e164]);

    const checkMe = async () => {
        try {
            const res = await authApi.getMe();
            if (res.data.registration_stage === 'PHONE_VERIFIED')
                setActiveStep(2);
        } catch {}
    }

    useEffect(() => {
        checkMe()
    }, []);

    return (
        <Container maxWidth="sm" sx={{ py: 5 }}>
            <Stepper activeStep={activeStep} sx={{ mb: 3, "& .MuiStepLabel-label": { display: "none" } }}>
                {steps.map((_, i) => (<Step key={i}><StepLabel /></Step>))}
            </Stepper>

            <AuthTop title={header.title} subtitle={header.subtitle} />

            <Paper elevation={0} sx={{ p: 2.5 }}>
                {Content}
                <Stack direction="column" spacing={2} alignItems="center" mt={3}>
                    {activeStep === 1 && (
                        <>
                            <Button fullWidth variant="outlined" onClick={back}>{t("register.changePhoneButton")}</Button>
                        </>
                    )}
                </Stack>
            </Paper>

            {activeStep === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 3, width: "100%" }}>
                    <span>{t("register.alreadyHaveAccount")}</span>
                    <Link style={{ width: "100%" }} to="/login" className="button button--transparent-white">{t("register.signInButton")}</Link>
                </Box>
            )}
        </Container>
    );
}
