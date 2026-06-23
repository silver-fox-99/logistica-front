import Header from "@/features/header/Header";
import Footer from "@/features/footer/Footer";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useUserStore } from "@/entities/user/model/user.store";
import {useEffect, useRef} from "react";
import {authApi} from "@/shared/api/authApi.ts";


export default function AppLayout() {
    const user = useUserStore((s) => s.user);
    const setUser = useUserStore(s => s.setUser);
    const didRun = useRef(false);

    const run = async () => {
        try {
            if (user) {
                return;
            }
            if (!localStorage.getItem("accessToken") && !localStorage.getItem("refreshToken")) {
                setUser(null);
                return;
            }
            const res = await authApi.getMe();
            setUser(res.data);
        } catch {
            setUser(null);
        }
    };

    useEffect(() => {
        if (didRun.current) return;
        didRun.current = true;
        run()
    }, []);

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
