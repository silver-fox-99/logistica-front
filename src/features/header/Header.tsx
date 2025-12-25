import logo from "./logo.svg"
import { Link, useLocation, useNavigate } from "react-router-dom";
import {Avatar, IconButton, useMediaQuery, Box, Drawer, Stack, Button, TextField, Autocomplete, CircularProgress, Paper, ListItemText, Typography} from "@mui/material";
import {FiMenu, FiSearch} from "react-icons/fi";
import { useEffect, useState } from "react";
import './header.scss'
import {useUserStore} from "@/entities/user/model/user.store.ts";
import {useTranslation} from "react-i18next";
import LanguageSwitcher from "@/shared/ui/language-switcher/LanguageSwitcher";
import { adminUsersApi, type AdminUser } from "@/shared/api/adminUsersApi";

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
    const [searchOpen, setSearchOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [options, setOptions] = useState<AdminUser[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

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
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const s = params.get("search");
        if (s) setSearch(s);
    }, [location.search]);

    const handleSelect = (user?: AdminUser | null) => {
        if (!user?.id) return;
        navigate(`/dashboard/user-reviews?search=${encodeURIComponent(user.id)}`);
        setSearchOpen(false);
    };

    const loadOptions = async (value: string) => {
        const q = value.trim();
        if (q.length < 2) {
            setOptions([]);
            return;
        }
        setLoadingOptions(true);
        try {
            const res = await adminUsersApi.list({ search: q, limit: 5, page: 1 });
            setOptions(res.items || []);
        } catch {
            setOptions([]);
        } finally {
            setLoadingOptions(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(() => { void loadOptions(search); }, 250);
        return () => clearTimeout(timeout);
    }, [search]);

    return <div className="header">
        <div className="header__wrapper container">
            <div className="header__left">
                <Link to="/" className="header__logo" aria-label="Go to home">
                    <img src={logo} alt="logo"/>
                </Link>
            </div>

            {isAuthenticated && (
                <div className="header__middle">
                    {!isMobile ? (
                        <Autocomplete<AdminUser | string, false, false, true>
                            fullWidth
                            size="small"
                            freeSolo
                            options={options}
                            getOptionLabel={(o) =>
                                typeof o === "string"
                                    ? o
                                    : [o.first_name, o.last_name].filter(Boolean).join(" ") || o.email || o.phone || o.id
                            }
                            loading={loadingOptions}
                            onInputChange={(_, v) => setSearch(v)}
                            onChange={(_, v) => {
                                if (typeof v !== "string") handleSelect(v as AdminUser);
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={typeof option === "string" ? option : option.id}>
                                    <ListItemText
                                        primary={
                                            typeof option === "string"
                                                ? option
                                                : [option.first_name, option.last_name].filter(Boolean).join(" ") ||
                                                  option.email ||
                                                  option.phone ||
                                                  option.id
                                        }
                                        secondary={
                                            typeof option === "string"
                                                ? ""
                                                : [option.email, option.phone].filter(Boolean).join(" · ")
                                        }
                                    />
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Email, телефон или имя"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingOptions ? <CircularProgress color="inherit" size={16} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={{ bgcolor: "white", borderRadius: 1 }}
                                />
                            )}
                            PaperComponent={(props) => <Paper elevation={3} {...props} />}
                        />
                    ) : (
                        <IconButton
                            aria-label="Поиск пользователя"
                            onClick={() => setSearchOpen(true)}
                            size="large"
                            sx={{ color: "#fff" }}
                        >
                            <FiSearch />
                        </IconButton>
                    )}
                </div>
            )}

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

            {isAuthenticated && (
                <Drawer
                    anchor="top"
                    open={searchOpen}
                    onClose={() => setSearchOpen(false)}
                    PaperProps={{ sx: { p: 2, borderRadius: 0, bgcolor: "rgba(255,255,255,0.98)" } }}
                    ModalProps={{ keepMounted: true }}
                >
                    <Stack spacing={2}>
                        <Typography variant="subtitle1" fontWeight={700}>
                            Поиск пользователя
                        </Typography>
                        <Autocomplete<AdminUser | string, false, false, true>
                            fullWidth
                            size="small"
                            freeSolo
                            options={options}
                            getOptionLabel={(o) =>
                                typeof o === "string"
                                    ? o
                                    : [o.first_name, o.last_name].filter(Boolean).join(" ") || o.email || o.phone || o.id
                            }
                            loading={loadingOptions}
                            onInputChange={(_, v) => setSearch(v)}
                            onChange={(_, v) => {
                                if (typeof v !== "string") {
                                    handleSelect(v as AdminUser);
                                }
                            }}
                            renderOption={(props, option) => (
                                <li {...props} key={typeof option === "string" ? option : option.id}>
                                    <ListItemText
                                        primary={
                                            typeof option === "string"
                                                ? option
                                                : [option.first_name, option.last_name].filter(Boolean).join(" ") ||
                                                  option.email ||
                                                  option.phone ||
                                                  option.id
                                        }
                                        secondary={
                                            typeof option === "string"
                                                ? ""
                                                : [option.email, option.phone].filter(Boolean).join(" · ")
                                        }
                                    />
                                </li>
                            )}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    autoFocus
                                    placeholder="Email, телефон или имя"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {loadingOptions ? <CircularProgress color="inherit" size={16} /> : null}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                    sx={{ bgcolor: "white", borderRadius: 1 }}
                                />
                            )}
                            PaperComponent={(props) => <Paper elevation={3} {...props} />}
                        />
                        <Button variant="outlined" onClick={() => setSearchOpen(false)} sx={{ alignSelf: "flex-start" }}>
                            Закрыть
                        </Button>
                    </Stack>
                </Drawer>
            )}
        </div>


    </div>;
}
