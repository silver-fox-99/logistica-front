import {createBrowserRouter, RouterProvider} from "react-router-dom";

import DashboardLayout from "@/shared/ui/layout/DashboardLayout";
import RequireAuth from "./RequireAuth";

import HomePage from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import AppLayout from "@/shared/ui/layout/AppLayot.tsx";
import ProfilePage from "@/pages/dashboard/profile";
import MyShipmentsPage from "@/pages/dashboard/requests/ui/MyShipmentsPage.tsx";
import AddCargoPage from "@/pages/dashboard/add-cargo/ui/AddCargoPage.tsx";
import AddTransportPage from "@/pages/dashboard/add-transport";



const CompanyPage = () => <div>Company</div>;
const StaffPage = () => <div>Staff</div>;
const PaymentsPage = () => <div>Payments</div>;

const SecurityPage = () => <div>Security</div>;
const HelpPage = () => <div>Help & support</div>;



const router = createBrowserRouter([

    {
        element: <AppLayout/>,
        children: [
            {path: "/", element: <HomePage/>},
            {path: "/login", element: <LoginPage/>},
            {path: "/register", element: <RegisterPage/>},
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
            {path: "search", element: <MyShipmentsPage/>},
            {path: "profile", element: <ProfilePage/>},
            {path: "company", element: <CompanyPage/>},
            {path: "staff", element: <StaffPage/>},
            {path: "payments", element: <PaymentsPage/>},
            {path: "requests", element: <MyShipmentsPage/>},

            {path: "security", element: <SecurityPage/>},
            {path: "help", element: <HelpPage/>},
            {path: "create-cargo", element: <AddCargoPage/>},
            {path: "create-transport", element: <AddTransportPage/>},

        ],
    },
]);

export default function AppRouter() {
    return <RouterProvider router={router}/>;
}
