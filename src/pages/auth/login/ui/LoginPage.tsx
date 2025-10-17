import AuthTop from "@/shared/ui/auth/auth-top.tsx";
import './login.scss'
import LoginForm from "@/features/login/ui/LoginForm.tsx";
import { Link } from "react-router-dom";

export default function LoginPage() {
    return <div className="login">
        <AuthTop icon={true} title="Вход" subtitle="Для входа используйте номер телефона, указанный при регистрации. Номер должен начинаться с «+» и кода страны" />
        <LoginForm />

        <div className="login__bottom">
            <span className="login__notice">Еще не зарегистрированы?</span>
            <Link to="/register" className="login__button button button--transparent-white">Регистрация</Link>
        </div>
    </div>;
}