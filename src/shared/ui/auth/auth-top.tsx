import authIcon from './icon.svg'
import './auth-top.scss'

export default function AuthTop({icon, title, subtitle}: {icon?: boolean, title: string, subtitle: string}) {
    return <div className="auth-top">
        {icon && <img src={authIcon} alt="auth-top__icon"/>}
        <h3 className="auth-top__title">{title}</h3>
        <span className="auth-top__subtitle">{subtitle}</span>
    </div>
}