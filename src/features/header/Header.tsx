import logo from "./logo.svg"
import { Link } from "react-router-dom";
import {Avatar, IconButton, useMediaQuery, Box, Drawer, Stack, Button} from "@mui/material";
import {FiMenu} from "react-icons/fi";
import { useState } from "react";
import './header.scss'
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "@/shared/ui/language-switcher/LanguageSwitcher";
import HeaderNotificationsPopover from "@/features/user-notifications/ui/HeaderNotificationsPopover";
import UserSearch from "@/features/user-search/ui/UserSearch";

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
    const [menuOpen, setMenuOpen] = useState(false);

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

    const logoHref = "/";
    const avatarProps = stringAvatar(`${user?.first_name} ${user?.last_name}`);

    return <div className="header">
        <div className="header__wrapper container">
            <div className="header__left">
                <Link to={logoHref} className="header__logo" aria-label="Go to home">
                    <img src={logo} alt="logo"/>
                </Link>
            </div>

            {isAuthenticated && (
                <div className="header__middle">
                    <UserSearch />
                </div>
            )}

            {isAuthenticated && <div className="header__column header__column--user">
                {!isMobile && <Box component="span">{user?.first_name} {user?.last_name}</Box>}
                <HeaderNotificationsPopover />
                <Avatar
                    {...avatarProps}
                    component={Link}
                    to="/dashboard/profile"
                    aria-label="Open profile"
                    sx={{ cursor: "pointer", ...(avatarProps.sx || {}) }}
                />
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

            {!isAuthenticated && (
                <>
                    <div className="header__column">
                        {!isMobile && (
                            <>
                                <Link to="/login" className="header__button button button--transparent" >{t('header.login')}</Link>
                                <Link to="/register" className="header__button button" >{t('header.register')}</Link>
                            </>
                        )}
                        <LanguageSwitcher />
                        {isMobile && (
                            <IconButton
                                aria-label="Open menu"
                                onClick={() => setMenuOpen(true)}
                                size="large"
                                sx={{
                                    color: '#fff',
                                    p: 0,
                                }}
                            >
                                <FiMenu />
                            </IconButton>
                        )}
                    </div>

                    <Drawer
                        anchor="right"
                        open={menuOpen}
                        onClose={() => setMenuOpen(false)}
                        PaperProps={{ sx: { width: 280, p: 2 } }}
                        ModalProps={{ keepMounted: true }}
                    >
                        <Stack spacing={2}>
                            <Button
                                component={Link}
                                to="/login"
                                variant="outlined"
                                fullWidth
                                onClick={() => setMenuOpen(false)}
                                sx={{ textTransform: "none" }}
                            >
                                {t('header.login')}
                            </Button>
                            <Button
                                component={Link}
                                to="/register"
                                variant="contained"
                                fullWidth
                                onClick={() => setMenuOpen(false)}
                                sx={{ textTransform: "none" }}
                            >
                                {t('header.register')}
                            </Button>
                            <Box sx={{ mt: 2 }}>
                                <LanguageSwitcher />
                            </Box>
                        </Stack>
                    </Drawer>
                </>
            )}


        </div>


    </div>;
}
