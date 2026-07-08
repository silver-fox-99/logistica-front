import AppThemeProvider from "./providers/ThemeProvider";
import AppRouter from "./router";

export default function AppRoot() {
    return (
        <AppThemeProvider>
            
            <AppRouter />
        </AppThemeProvider>
    );
}
