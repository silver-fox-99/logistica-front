import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useUserStore } from "@/entities/user/model/user.store";


export default function AppLayout() {
    const user = useUserStore((s) => s.user);

    return (
        <Box 
            display="flex" 
            justifyContent="space-between" 
            flexDirection="column" 
            minHeight="100dvh" 
            sx={{ 
                width: "100%", 
                overflow: "hidden",
                boxSizing: "border-box"
            }}
        >
            <Header isAuthenticated={!!user} />
            <Box 
                component="main" 
                className="container" 
                sx={{ 
                    width: "100%", 
                    overflow: "hidden", 
                    boxSizing: "border-box"
                }}
            >
                <Box sx={{ width: "100%", overflow: "hidden", boxSizing: "border-box" }}>
                    <Outlet />
                </Box>
            </Box>
            <Footer />
        </Box>
    );
}
