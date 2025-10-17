
import { Navigate, useLocation } from "react-router-dom";
import type {JSX} from "react";

const isAuthenticated = true;

export default function RequireAuth({ children }: { children: JSX.Element }) {
    const loc = useLocation();
    return isAuthenticated ? children : <Navigate to="/login" state={{ from: loc }} replace />;
}
