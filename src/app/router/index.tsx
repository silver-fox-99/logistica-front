import {createBrowserRouter, RouterProvider} from "react-router-dom";

import DashboardLayout from "@/shared/ui/layout/DashboardLayout";
import RequireAuth from "./RequireAuth";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AppLayout from "@/shared/ui/layout/AppLayot.tsx";
import ProfilePage from "@/pages/dashboard/profile";
import AddCargoPage from "@/pages/dashboard/add-cargo/ui/AddCargoPage.tsx";
import AddTransportPage from "@/pages/dashboard/add-transport";
import SecurityPage from "@/pages/dashboard/security";
import ShipmentsListPage from "@/pages/dashboard/requests/ui/ShipmentsPage.tsx";
import NotFoundPage from "@/pages/not-found";
import CompanyPage from "@/pages/dashboard/company";
import StaffPage from "@/pages/dashboard/staff";
import PaymentsPage from "@/pages/dashboard/payments";
import HelpSupportPage from "@/pages/dashboard/help-support";
import ForgotPasswordPage from "@/pages/auth/forgot-password";
import RequireAdmin from "@/app/router/RequireAdmin.tsx";
import AdminLayout from "@/shared/ui/layout/AdminLayout.tsx";
import AdminUsersPage from "@/pages/admin/users";
import AdminUserPage from "@/pages/admin/user";
import AdminCargoPage from "@/pages/admin/cargo";
import AdminTransportPage from "@/pages/admin/transport";
import AdminBlackListPage from "@/pages/admin/ip-blacklist";
import AdminActivityLogsPage from "@/pages/admin/activity-log";
import AdminGeoLocationsPage from "@/pages/admin/geo-location";


const AdminOverviewPage = () => <div>Admin overview</div>



const router = createBrowserRouter([

    {
        element: <AppLayout/>,
        children: [
            {path: "/", element: <HomePage/>},
            {path: "/login", element: <LoginPage/>},
            {path: "/register", element: <RegisterPage/>},
            {path: "/reset-password", element: <ForgotPasswordPage />}
        ],
    },

    {
        path: "/dashboard",
        element: (
            <RequireAuth>
                <DashboardLayout/>
            </RequireAuth>
        ),
        children: [
            {index: true, element: <ProfilePage/>},
            {path: "search", element: <ShipmentsListPage scope="public"/>},
            {path: "profile", element: <ProfilePage/>},
            {path: "company", element: <CompanyPage/>},
            {path: "staff", element: <StaffPage/>},
            {path: "payments", element: <PaymentsPage/>},
            {path: "requests", element: <ShipmentsListPage scope="my"/>},

            {path: "security", element: <SecurityPage/>},
            {path: "help", element: <HelpSupportPage/>},
            {path: "create-cargo", element: <AddCargoPage/>},
            {path: "create-transport", element: <AddTransportPage/>}
        ],
    },
    {
        path: "/admin",
        element: (
            <RequireAdmin>
                <AdminLayout />
            </RequireAdmin>
        ),
        children: [
            { index: true, element: <AdminOverviewPage /> },
            { path: "users", element: <AdminUsersPage /> },
            { path: "user/:id", element: <AdminUserPage />},
            { path: "cargo", element: <AdminCargoPage /> },
            { path: "transport", element: <AdminTransportPage />},
            { path: "geo", element: <AdminGeoLocationsPage />},
            { path:  "black-list", element: <AdminBlackListPage />},
            { path: "activity-logs", element: <AdminActivityLogsPage />}
        ],
    },
    {
        path: '*',
        element: <NotFoundPage />
    }
]);

export default function AppRouter() {
    return <RouterProvider router={router}/>;
}
