import { Container, Box, Typography, Button } from "@mui/material";
import { FiTruck } from "react-icons/fi";

export default function HomePage() {
    return (
        <Container maxWidth="md">
            <Box mt={6} display="grid" gap={2}>
                <Typography variant="h4" component="h1">
                    Welcome to Logistica
                </Typography>
                <Typography>
                    This is a starter page built with Vite, React, TypeScript, and MUI.
                </Typography>
                <Button variant="contained" startIcon={<FiTruck />}>
                    Get Started
                </Button>
            </Box>
        </Container>
    );
}
