import { useMemo, useState } from "react";
import { Box, Container, Paper, Step, StepLabel, Stepper, Stack, Button } from "@mui/material";
import { Link } from "react-router-dom";
import AuthTop from "@/shared/ui/auth/auth-top";
import StepPhone from "@/features/login/register/ui/StepPhone";
import StepCode from "@/features/login/register/ui/StepCode";
import StepProfile from "@/features/login/register/ui/StepProfile";
import { firebasePhone } from "@/shared/lib/firebasePhone";

export default function RegisterPage() {
    const [activeStep, setActiveStep] = useState(0);
    const [e164, setE164] = useState<string>("");
    const steps = useMemo(() => ["", "", ""], []);

    const next = () => setActiveStep((s) => Math.min(s + 1, 2));
    const back = () => setActiveStep((s) => Math.max(s - 1, 0));

    const header = useMemo(() => {
        switch (activeStep) {
            case 0: return { title: "Create an account", subtitle: "Enter your phone number to get an SMS code and continue." };
            case 1: return { title: "Enter the code", subtitle: `We sent an SMS to ${e164 || "your phone"}. Enter the code below.` };
            case 2: return { title: "Basic information", subtitle: "Provide your details and create a password." };
            default: return { title: "", subtitle: "" };
        }
    }, [activeStep, e164]);

    const Content = useMemo(() => {
        switch (activeStep) {
            case 0:
                return <StepPhone onNext={(phoneE164) => { setE164(phoneE164); next(); }} />;
            case 1:
                return (
                    <StepCode
                        length={6}
                        onSubmit={next}
                        onResend={async () => { if (e164) await firebasePhone.sendCode(e164); }}
                    />
                );
            case 2:
                return <StepProfile onNext={next} />;
            default:
                return null;
        }
    }, [activeStep, e164]);

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
                            <Button fullWidth variant="outlined" onClick={back}>Change phone</Button>
                        </>
                    )}
                </Stack>
            </Paper>

            {activeStep === 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mt: 3, width: "100%" }}>
                    <span>Already have an account?</span>
                    <Link style={{ width: "100%" }} to="/login" className="button button--transparent-white">Sign in</Link>
                </Box>
            )}
        </Container>
    );
}
