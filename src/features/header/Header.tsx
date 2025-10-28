import logo from "./logo.svg"
import { Link } from "react-router-dom";
import {Avatar, IconButton, useMediaQuery, Box} from "@mui/material";
import {FiMenu} from "react-icons/fi";
import './header.scss'
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "@/shared/ui/language-switcher/LanguageSwitcher";

export default function Header({
    isAuthenticated, 
    onMenuClick,
    showBurger
}: {
    isAuthenticated?: boolean;
    onMenuClick?: () => void;
    showBurger?: boolean;
}) {
    const user = useUserStore((s) => s.user);
    const {t} = useTranslation()
    const isMobile = useMediaQuery("(max-width:860px)");

    function stringToColor(string: string) {
        let hash = 0;
        let i;

        /* eslint-disable no-bitwise */
        for (i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }

        let color = '#';

        for (i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        /* eslint-enable no-bitwise */

        return color;
    }

    function stringAvatar(name: string) {
        return {
            sx: {
                bgcolor: stringToColor(name),
            },
            children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
        };
    }

    return <div className="header">
        <div className="header__wrapper container">
            <div className="header__left">
                <div className="header__logo">
                    <img src={logo} alt="logo"/>
                </div>
            </div>

            {isAuthenticated && <div className="header__column header__column--user">
                {!isMobile && <Box component="span">{user?.first_name} {user?.last_name}</Box>}
                <Avatar {...stringAvatar(`${user?.first_name} ${user?.last_name}`)} />
                <LanguageSwitcher />
                {showBurger && (
                    <IconButton
                        aria-label={t('dashboard.menu.openMenu')}
                        onClick={onMenuClick}
                        size="large"
                        sx={{
                            color: '#fff',
                            ml: 1,
                            p: 0,
                            marginLeft: 0,
                        }}
                    >
                        <FiMenu />
                    </IconButton>
                )}
            </div>}

            {!isAuthenticated && <div className="header__column">
                <Link to="/login" className="header__button button button--transparent" >{t('header.login')}</Link>
                <Link to="/register" className="header__button button" >{t('header.register')}</Link>
                <LanguageSwitcher />
            </div>}
        </div>


    </div>;
}