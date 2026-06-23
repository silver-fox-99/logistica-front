import {useEffect, useMemo, useState, useRef} from "react";
import { Box, Container, Paper, Step, StepLabel, Stepper, Stack, Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import AuthTop from "@/shared/ui/auth/auth-top";
import StepPhone from "@/features/login/register/ui/StepPhone";
import StepProfile from "@/features/login/register/ui/StepProfile";
import {authApi} from "@/shared/api/authApi.ts";
import StepCode from "@/features/login/register/ui/StepCode.tsx";

export default function RegisterPage() {
    const { t, i18n } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const [registrationType, setRegistrationType] = useState<"phone" | "email">("phone");
    const [contactVal, setContactVal] = useState<string>("");
    const steps = useMemo(() => ["", "", ""], []);

    const next = () => setActiveStep((s) => Math.min(s + 1, 2));
    const back = () => setActiveStep((s) => Math.max(s - 1, 0));

    const header = useMemo(() => {
        switch (activeStep) {
            case 0: return { title: t("register.step1Title"), subtitle: t("register.step1Subtitle") };
            case 1: return {
                title: t("register.step2Title"),
                subtitle: registrationType === "phone"
                    ? t("register.step2Subtitle", { phone: contactVal || "your phone" })
                    : t("register.step2SubtitleEmail", { email: contactVal || "your email" })
            };
            case 2: return { title: t("register.step3Title"), subtitle: t("register.step3Subtitle") };
            default: return { title: "", subtitle: "" };
        }
    }, [activeStep, contactVal, registrationType, t]);

    const Content = useMemo(() => {
        switch (activeStep) {
            case 0:
                return <StepPhone onNext={(val, _, type) => { setContactVal(val); setRegistrationType(type); next(); }} />;
            case 1:
                return (
                    <StepCode
                        length={6}
                        type={registrationType}
                        onSubmit={next}
                    />
                );
            case 2:
                return <StepProfile />;
            default:
                return null;
        }
    }, [activeStep, contactVal, registrationType]);

    const didRun = useRef(false);

    const checkMe = async () => {
        if (!localStorage.getItem("accessToken") && !localStorage.getItem("refreshToken")) {
            return;
        }
        try {
            const res = await authApi.getMe();
            if (res.data.registration_stage === 'PHONE_VERIFIED' || res.data.registration_stage === 'EMAIL_VERIFIED')
                setActiveStep(2);
        } catch {}
    }

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;
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
                            <Button fullWidth variant="outlined" onClick={back}>
                                {registrationType === "phone"
                                    ? t("register.changePhoneButton")
                                    : (i18n.language === "ru" ? "Изменить E-mail" : i18n.language === "uz" ? "E-mailni o'zgartirish" : "Change E-mail")
                                }
                            </Button>
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
