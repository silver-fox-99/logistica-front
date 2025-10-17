
import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";


export default function AppLayout() {
    return (
        <Box display="flex" justifyContent="space-between" flexDirection="column" minHeight="100dvh">
            <Header isAuthenticated={false} />
            <Box component="main" className="container">
                <Outlet />
            </Box>
            <Footer />
        </Box>
    );
}
