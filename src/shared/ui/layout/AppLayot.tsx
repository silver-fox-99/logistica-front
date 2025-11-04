
import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";


export default function AppLayout() {
    return (
        <Box 
            display="flex" 
            justifyContent="space-between" 
            flexDirection="column" 
            minHeight="100dvh" 
            sx={{ 
                width: "100%", 
                maxWidth: { xs: "100vw", md: "100%" },
                overflow: "hidden",
                boxSizing: "border-box"
            }}
        >
            <Header isAuthenticated={false} />
            <Box 
                component="main" 
                className="container" 
                sx={{ 
                    width: "100%", 
                    maxWidth: { xs: "100vw", md: "100%" },
                    overflow: "hidden", 
                    boxSizing: "border-box"
                }}
            >
                <Box sx={{ width: "100%", maxWidth: { xs: "100vw", md: "100%" }, overflow: "hidden", boxSizing: "border-box" }}>
                    <Outlet />
                </Box>
            </Box>
            <Footer />
        </Box>
    );
}
