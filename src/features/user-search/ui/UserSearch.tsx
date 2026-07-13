import { useState, useEffect, useRef } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Paper,
  ListItemText,
  IconButton,
  ClickAwayListener,
  Box,
  Drawer,
  Stack,
  Typography,
  Button,
  useMediaQuery,
} from "@mui/material";
import { FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { adminUsersApi, type AdminUser } from "@/shared/api/adminUsersApi";
import { useUserStore } from "@/entities/user/model/user.store.ts";

export default function UserSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currentUser = useUserStore((s) => s.user);
  const currentUserId = currentUser?.id;
  const isMobile = useMediaQuery("(max-width:860px)");

  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<AdminUser[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const loadOptions = async (value: string) => {
    const q = value.trim();
    if (q.length < 1) {
      setOptions([]);
      return;
    }
    setLoadingOptions(true);
    try {
      const res = await adminUsersApi.list(
        { search: q, limit: 5, page: 1 },
        true,
      );
      const filtered = (res.items || []).filter((o) => o.id !== currentUserId);
      setOptions(filtered);
    } catch {
      setOptions([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadOptions(search);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const handleSelect = (user?: AdminUser | null) => {
    if (!user?.id) return;
    navigate(`/dashboard/user-reviews/${user.id}`);
    setSearch("");
    setExpanded(false);
  };

  const handleClose = () => {
    setSearch("");
    setExpanded(false);
  };

  const handleToggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (expanded && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [expanded, isMobile]);

  // Render mobile search view
  if (isMobile) {
    return (
      <>
        <IconButton
          aria-label={t("header.searchUser")}
          onClick={handleToggleExpand}
          size="large"
          sx={{ color: "text.primary" }}
        >
          <FiSearch size={22} />
        </IconButton>

        <Drawer
          anchor="top"
          open={expanded}
          onClose={handleClose}
          PaperProps={{
            sx: { p: 2, borderRadius: 0, bgcolor: "rgba(255,255,255,0.98)" },
          }}
          ModalProps={{ keepMounted: true }}
        >
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              {t("header.searchUser")}
            </Typography>
            <Autocomplete<AdminUser | string, false, false, true>
              fullWidth
              size="small"
              freeSolo
              options={options}
              openOnFocus
              autoHighlight
              filterOptions={(x) => x}
              getOptionLabel={(o) =>
                typeof o === "string"
                  ? o
                  : [o.first_name, o.last_name].filter(Boolean).join(" ") ||
                    o.email ||
                    o.phone ||
                    o.id
              }
              loading={loadingOptions}
              onInputChange={(_, v) => setSearch(v)}
              onChange={(_, v) => {
                if (typeof v !== "string") {
                  handleSelect(v as AdminUser);
                }
              }}
              renderOption={(props, option) => (
                <li
                  {...props}
                  key={typeof option === "string" ? option : option.id}
                >
                  <ListItemText
                    primary={
                      typeof option === "string"
                        ? option
                        : [option.first_name, option.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                          option.email ||
                          option.phone ||
                          option.id
                    }
                    secondary={
                      typeof option === "string"
                        ? ""
                        : [option.email, option.phone]
                            .filter(Boolean)
                            .join(" · ")
                    }
                  />
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  autoFocus
                  placeholder={t("header.searchPlaceholder")}
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingOptions ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{ bgcolor: "white", borderRadius: 1 }}
                />
              )}
              PaperComponent={(props) => <Paper elevation={3} {...props} />}
            />
            <Button
              variant="outlined"
              onClick={handleClose}
              sx={{ alignSelf: "flex-start" }}
            >
              {t("header.close")}
            </Button>
          </Stack>
        </Drawer>
      </>
    );
  }

  // Render desktop expandable search view
  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          position: "relative",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          width: expanded ? "300px" : "40px",
          height: 40,
          borderRadius: 2,
          bgcolor: expanded ? "rgba(0, 0, 0, 0.04)" : "transparent",
          border: "1px solid",
          borderColor: expanded ? "rgba(0, 0, 0, 0.08)" : "transparent",
          px: expanded ? 1.5 : 0,
          overflow: "hidden",
          "&:hover": expanded
            ? {
                borderColor: "rgba(0, 0, 0, 0.15)",
                bgcolor: "rgba(0, 0, 0, 0.06)",
              }
            : {},
        }}
      >
        {!expanded ? (
          <IconButton
            onClick={handleToggleExpand}
            sx={{
              color: "text.primary",
              p: 1,
              "&:hover": {
                bgcolor: "rgba(0, 0, 0, 0.04)",
              },
            }}
            aria-label={t("header.searchUser")}
          >
            <FiSearch size={22} />
          </IconButton>
        ) : (
          <>
            <FiSearch
              size={18}
              style={{
                color: "rgba(0, 0, 0, 0.45)",
                marginRight: 8,
                flexShrink: 0,
              }}
            />
            <Autocomplete<AdminUser | string, false, false, true>
              fullWidth
              size="small"
              freeSolo
              options={options}
              openOnFocus
              autoHighlight
              filterOptions={(x) => x}
              getOptionLabel={(o) =>
                typeof o === "string"
                  ? o
                  : [o.first_name, o.last_name].filter(Boolean).join(" ") ||
                    o.email ||
                    o.phone ||
                    o.id
              }
              loading={loadingOptions}
              onInputChange={(_, v) => setSearch(v)}
              onChange={(_, v) => {
                if (typeof v !== "string") handleSelect(v as AdminUser);
              }}
              renderOption={(props, option) => (
                <li
                  {...props}
                  key={typeof option === "string" ? option : option.id}
                >
                  <ListItemText
                    primary={
                      typeof option === "string"
                        ? option
                        : [option.first_name, option.last_name]
                            .filter(Boolean)
                            .join(" ") ||
                          option.email ||
                          option.phone ||
                          option.id
                    }
                    secondary={
                      typeof option === "string"
                        ? ""
                        : [option.email, option.phone]
                            .filter(Boolean)
                            .join(" · ")
                    }
                  />
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  inputRef={inputRef}
                  placeholder={t("header.searchPlaceholder")}
                  variant="standard"
                  InputProps={{
                    ...params.InputProps,
                    disableUnderline: true,
                    endAdornment: (
                      <>
                        {loadingOptions ? (
                          <CircularProgress color="inherit" size={16} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              PaperComponent={(props) => <Paper elevation={3} {...props} />}
              sx={{
                flex: 1,
                "& .MuiInputBase-root": {
                  color: "text.primary !important",
                  bgcolor: "transparent !important",
                  padding: "4px 0 !important",
                  border: "none !important",
                  "&::before, &::after": {
                    display: "none !important",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "text.primary !important",
                  caretColor: "primary.main !important",
                  background: "transparent !important",
                  border: "none !important",
                  outline: "none !important",
                  boxShadow: "none !important",
                  "&::placeholder": {
                    color: "rgba(0, 0, 0, 0.4) !important",
                    opacity: 1,
                  },
                },
                "& .MuiAutocomplete-endAdornment": {
                  "& button": { color: "rgba(0, 0, 0, 0.4)" },
                },
              }}
            />
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{
                color: "rgba(0, 0, 0, 0.4)",
                p: 0.5,
                ml: 0.5,
                "&:hover": {
                  color: "text.primary",
                },
              }}
            >
              <FiX size={16} />
            </IconButton>
          </>
        )}
      </Box>
    </ClickAwayListener>
  );
}
