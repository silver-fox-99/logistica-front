
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import {
    FiArrowLeft, FiCheck, FiLoader, FiSave, FiSlash, FiTrash2, FiShield, FiUser, FiPhone, FiMail, FiCpu
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {adminUserApi, type AdminUserSessionsItem} from "@/shared/api/adminUserApi";
import type {RegistrationStage, UserStatus} from "@/entities/user/model/user.types.ts";
import type {AdminUser} from "@/shared/api/adminUsersApi.ts";

const isoOrNull = z.string().datetime().nullable().or(z.literal("").transform(() => null));
const phoneRegex = /^\+?[1-9]\d{1,19}$/;

const schema = z.object({
    is_admin: z.boolean().optional(),
    avatar: z.string().nullable().optional(),
    phone: z.string().regex(phoneRegex, "Phone must be E.164").min(10).max(20).optional(),
    phone_verified_at: isoOrNull.optional(),
    email: z.string().email().nullable().optional(),
    email_verified_at: isoOrNull.optional(),
    first_name: z.string().max(120).nullable().optional(),
    last_name: z.string().max(120).nullable().optional(),
    password: z.string().min(8).max(128).optional().or(z.literal("")).optional(),
    registration_stage: z.custom<RegistrationStage>().optional(),
    status: z.custom<UserStatus>().optional(),
    last_login_at: isoOrNull.optional(),
    meta: z.any().optional(), // будем парсить из JSON поля
    deleted_at: isoOrNull.optional(),
});

type FormValues = z.infer<typeof schema>;

const fmt = (d?: string | null) =>
    d ? new Date(d).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", hour12: false }) : "—";

export default function AdminUserPage() {
    const { id = "" } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<AdminUser | null>(null);
    const [sessions, setSessions] = useState<AdminUserSessionsItem[]>([]);
    const [metaText, setMetaText] = useState<string>("{}");

    const { register, handleSubmit, reset, formState: { errors, isDirty } } =
        useForm<FormValues>({ resolver: zodResolver(schema) });

    // load
    useEffect(() => {
        let aborted = false;
        const run = async () => {
            setLoading(true); setError(null);
            try {
                const res = await adminUserApi.get(id);
                if (aborted) return;
                setUser(res.data.user);
                setSessions(res.data.sessions ?? []);
                setMetaText(JSON.stringify(res.data.user.meta ?? {}, null, 2));
                reset({
                    is_admin: res.data.user.is_admin,
                    avatar: res.data.user.avatar,
                    phone: res.data.user.phone,
                    phone_verified_at: res.data.user.phone_verified_at,
                    email: res.data.user.email,
                    email_verified_at: res.data.user.email_verified_at,
                    first_name: res.data.user.first_name,
                    last_name: res.data.user.last_name,
                    password: "",
                    registration_stage: res.data.user.registration_stage,
                    status: res.data.user.status,
                    last_login_at: res.data.user.last_login_at,
                    deleted_at: res.data.user.deleted_at,
                });
            } catch (e: any) {
                setError(e?.response?.data?.message ?? "Failed to load user");
            } finally {
                if (!aborted) setLoading(false);
            }
        };
        run();
        return () => { aborted = true; };
    }, [id, reset]);

    const headerRight = useMemo(() => (
        <Stack direction="row" spacing={1}>
            <Button variant="outlined" startIcon={<FiArrowLeft />} onClick={() => navigate("/admin/users")}>
                Back to list
            </Button>
            <Tooltip title="Ban user">
        <span>
          <Button
              color="warning"
              variant="outlined"
              startIcon={<FiSlash />}
              disabled={!user || busy}
              onClick={async () => {
                  if (!user) return;
                  setBusy(true);
                  try {
                      await adminUserApi.ban(user.id);
                      // optimistic update:
                      setUser({ ...user, status: "BLOCKED" });
                  } finally { setBusy(false); }
              }}
          >
            Ban
          </Button>
        </span>
            </Tooltip>
            <Tooltip title="Delete user">
        <span>
          <Button
              color="error"
              variant="outlined"
              startIcon={<FiTrash2 />}
              disabled={!user || busy}
              onClick={async () => {
                  if (!user) return;
                  if (!confirm("Delete this user? This action cannot be undone.")) return;
                  setBusy(true);
                  try {
                      await adminUserApi.remove(user.id);
                      navigate("/admin/users");
                  } finally { setBusy(false); }
              }}
          >
            Delete
          </Button>
        </span>
            </Tooltip>
        </Stack>
    ), [navigate, user, busy]);

    const onSubmit = async (values: FormValues) => {
        if (!user) return;
        setBusy(true); setError(null);
        try {
            // meta из textarea
            let meta: Record<string, any> | undefined = undefined;
            if (metaText.trim().length) {
                try {
                    meta = JSON.parse(metaText);
                } catch {
                    setError("Meta must be a valid JSON object");
                    setBusy(false);
                    return;
                }
            }

            const payload = {
                ...values,
                // пустой пароль не отправляем
                ...(values.password ? { password: values.password } : {}),
                meta,
            };

            await adminUserApi.patch(user.id, payload);
            // перезагрузим свежие данные
            const res = await adminUserApi.get(user.id);
            setUser(res.data.user);
            setSessions(res.data.sessions ?? []);
            setMetaText(JSON.stringify(res.data.user.meta ?? {}, null, 2));
            reset({ ...values, password: "" }); // сбросить dirty и пароль
        } catch (e: any) {
            setError(e?.response?.data?.message ?? "Failed to save changes");
        } finally {
            setBusy(false);
        }
    };

    if (loading) {
        return (
            <Stack alignItems="center" justifyContent="center" sx={{ minHeight: 240, color: "text.secondary" }}>
                <FiLoader style={{ marginRight: 8 }} /> Loading…
            </Stack>
        );
    }

    if (!user) {
        return <Alert severity="error">{error ?? "User not found"}</Alert>;
    }

    return (
        <Container disableGutters>
            <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <FiUser />
                        <Typography variant="h5" fontWeight={700}>User details</Typography>
                        <Chip size="small" label={user.id.slice(0, 8)} />
                        {user.is_admin && <Chip size="small" icon={<FiShield />} color="warning" label="Admin" />}
                        <Chip
                            size="small"
                            label={user.status}
                            color={user.status === "ACTIVE" ? "success" : "default"}
                            variant={user.status === "ACTIVE" ? "filled" : "outlined"}
                        />
                    </Stack>
                    {headerRight}
                </Stack>

                {error && <Alert severity="error">{error}</Alert>}

                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Grid container spacing={2}>
                                {/* left column — identity */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={2}>
                                        <TextField
                                            label="First name"
                                            defaultValue={user.first_name ?? ""}
                                            {...register("first_name")}
                                            error={!!errors.first_name}
                                            helperText={errors.first_name?.message as string}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><FiUser /></InputAdornment> }}
                                        />
                                        <TextField
                                            label="Last name"
                                            defaultValue={user.last_name ?? ""}
                                            {...register("last_name")}
                                            error={!!errors.last_name}
                                            helperText={errors.last_name?.message as string}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><FiUser /></InputAdornment> }}
                                        />
                                        <TextField
                                            label="Phone (E.164)"
                                            defaultValue={user.phone}
                                            {...register("phone")}
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message as string}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><FiPhone /></InputAdornment> }}
                                        />
                                        <TextField
                                            label="Phone verified at (ISO)"
                                            defaultValue={user.phone_verified_at ?? ""}
                                            {...register("phone_verified_at")}
                                            error={!!errors.phone_verified_at}
                                            helperText={errors.phone_verified_at?.message as string}
                                        />
                                        <TextField
                                            label="Email"
                                            defaultValue={user.email ?? ""}
                                            {...register("email")}
                                            error={!!errors.email}
                                            helperText={errors.email?.message as string}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><FiMail /></InputAdornment> }}
                                        />
                                        <TextField
                                            label="Email verified at (ISO)"
                                            defaultValue={user.email_verified_at ?? ""}
                                            {...register("email_verified_at")}
                                            error={!!errors.email_verified_at}
                                            helperText={errors.email_verified_at?.message as string}
                                        />
                                        <TextField
                                            label="Password (leave empty to keep)"
                                            type="password"
                                            defaultValue=""
                                            {...register("password")}
                                            error={!!errors.password}
                                            helperText={errors.password?.message as string}
                                        />
                                    </Stack>
                                </Grid>

                                {/* right column — flags & meta */}
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Stack spacing={2}>
                                        <TextField
                                            select
                                            label="Registration stage"
                                            defaultValue={user.registration_stage}
                                            {...register("registration_stage")}
                                        >
                                            {["PHONE_SUBMITTED", "PHONE_VERIFIED", "COMPLETED"].map(s => (
                                                <MenuItem key={s} value={s}>{s}</MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            select
                                            label="Status"
                                            defaultValue={user.status}
                                            {...register("status")}
                                        >
                                            {["ACTIVE", "BLOCKED"].map(s => (
                                                <MenuItem key={s} value={s}>{s}</MenuItem>
                                            ))}
                                        </TextField>

                                        <TextField
                                            label="Admin (true/false)"
                                            defaultValue={String(user.is_admin)}
                                            {...register("is_admin", { setValueAs: (v) => v === "true" || v === true })}
                                            helperText="Set 'true' to grant admin"
                                        />

                                        <TextField
                                            label="Last login at (ISO)"
                                            defaultValue={user.last_login_at ?? ""}
                                            {...register("last_login_at")}
                                            error={!!errors.last_login_at}
                                            helperText={errors.last_login_at?.message as string}
                                        />

                                        <TextField
                                            label="Deleted at (ISO) — soft delete"
                                            defaultValue={user.deleted_at ?? ""}
                                            {...register("deleted_at")}
                                            error={!!errors.deleted_at}
                                            helperText={errors.deleted_at?.message as string}
                                        />

                                        <TextField
                                            label="Avatar URL"
                                            defaultValue={user.avatar ?? ""}
                                            {...register("avatar")}
                                        />

                                        <TextField
                                            label="Meta (JSON)"
                                            value={metaText}
                                            onChange={(e) => setMetaText(e.target.value)}
                                            multiline
                                            minRows={6}
                                            InputProps={{ startAdornment: <InputAdornment position="start"><FiCpu /></InputAdornment> }}
                                        />
                                    </Stack>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Divider sx={{ my: 1 }} />
                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            startIcon={busy ? <FiLoader /> : <FiSave />}
                                            disabled={busy || !isDirty}
                                        >
                                            {busy ? "Saving…" : "Save changes"}
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<FiCheck />}
                                            onClick={() => {
                                                // откатить форму к текущим значениям пользователя
                                                reset(undefined);
                                                setMetaText(JSON.stringify(user.meta ?? {}, null, 2));
                                            }}
                                        >
                                            Reset
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </form>
                    </CardContent>
                </Card>

                {/* Sessions */}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent>
                        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                            <Typography variant="h6" fontWeight={700}>Sessions</Typography>
                            <Chip size="small" label={sessions.length} />
                        </Stack>
                        <Divider sx={{ mb: 2 }} />

                        <Stack spacing={1.25}>
                            {sessions.map(s => (
                                <Stack
                                    key={s.id}
                                    direction={{ xs: "column", sm: "row" }}
                                    spacing={1}
                                    alignItems={{ sm: "center" }}
                                    justifyContent="space-between"
                                    sx={{ p: 1, borderRadius: 1, border: "1px solid", borderColor: "divider" }}
                                >
                                    <Stack spacing={0.5}>
                                        <Typography variant="body2" fontWeight={600}>{s.userAgent?.slice(0, 80) || "—"}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            IP: {s.ip || "—"} • Created: {fmt(s.createdAt)} • Expires: {fmt(s.expiresAt)}
                                        </Typography>
                                    </Stack>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip size="small" label={s.status} color={s.status === "ACTIVE" ? "success" : "default"} />
                                        {/* если появится эндпоинт revoke — сюда добавим кнопку */}
                                        <Tooltip title="Copy session id">
                                            <IconButton size="small" onClick={() => navigator.clipboard?.writeText(s.id)}>
                                                #
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            ))}
                            {!sessions.length && (
                                <Typography variant="body2" color="text.secondary">No sessions</Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </Container>
    );
}
