import AuthTop from "@/shared/ui/auth/auth-top.tsx";
import './login.scss'
import LoginForm from "@/features/login/ui/LoginForm.tsx";
import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next";

export default function LoginPage() {

    const {t} = useTranslation()

    return <div className="login">
        <AuthTop icon={true} title={t('loginPage.title')} subtitle={t('loginPage.subtitle')} />
        <LoginForm />

        <div className="login__bottom">
            <span className="login__notice">{t('loginPage.needToRegister')}</span>
            <Link to="/register" className="login__button button button--transparent-white">{t('loginPage.register')}</Link>
        </div>
    </div>;
}