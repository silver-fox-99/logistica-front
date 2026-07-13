import {
  Avatar,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { CompanyInvitation } from "@/entities/company/model/types";
import { companiesApi } from "@/shared/api/companiesApi";
import { getUserDisplayName } from "@/widgets/company/company-team/model/companyTeamUi";

type Props = {
  invitations: CompanyInvitation[];
  isSubmitting?: boolean;
  onCancel: (invitationId: string) => void;
};

export function CompanyInvitationsCard({
  invitations,
  isSubmitting = false,
  onCancel,
}: Props) {
  const { t } = useTranslation();

  const roleLabel = (role?: string | null) =>
    t(`companyRoles.${role}`, {
      defaultValue: role || "",
    });

  const statusLabel = (status?: string | null) =>
    t(`companyInvitationStatuses.${status}`, {
      defaultValue: status || "",
    });

  const handleCopyLink = async (token: string) => {
    try {
      const link = companiesApi.buildInvitationLink(token);
      await navigator.clipboard.writeText(link);
      toast.success(t("companyTeam.invitations.copySuccess"));
    } catch {
      toast.error(t("companyTeam.invitations.copyError"));
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: "16px",
        borderColor: "divider",
        p: { xs: 2.5, md: 3 },
      }}
    >
      <Stack spacing={2.5}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={600}>
            {t("companyTeam.invitations.title")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("companyTeam.invitations.description")}
          </Typography>
        </Stack>

        {!invitations.length ? (
          <Typography variant="body2" color="text.secondary">
            {t("companyTeam.invitations.empty")}
          </Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={0}>
            {invitations.map((invitation) => {
              const target =
                invitation.email ||
                invitation.phone ||
                t("companyTeam.invitations.unknownRecipient");

              const invitationLink = companiesApi.buildInvitationLink(
                invitation.token,
              );

              return (
                <Stack key={invitation.id} spacing={2} sx={{ py: 2 }}>
                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", md: "center" }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar>{target.slice(0, 1).toUpperCase()}</Avatar>

                      <Stack spacing={0.35}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {target}
                        </Typography>

                        {invitation.invited_by_user ? (
                          <Typography variant="body2" color="text.secondary">
                            {t("companyTeam.invitations.sentBy", {
                              name: getUserDisplayName(
                                invitation.invited_by_user,
                              ),
                            })}
                          </Typography>
                        ) : null}

                        {invitation.message ? (
                          <Typography variant="caption" color="text.secondary">
                            {invitation.message}
                          </Typography>
                        ) : null}
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={roleLabel(invitation.role)} size="small" />
                      <Chip
                        label={statusLabel(invitation.status)}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>

                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      {t("companyTeam.invitations.expires", {
                        value: invitation.expires_at
                          ? new Date(invitation.expires_at).toLocaleString()
                          : t("companyTeam.invitations.noExpiry"),
                      })}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        wordBreak: "break-all",
                        display: "block",
                      }}
                    >
                      {invitationLink}
                    </Typography>
                  </Stack>

                  <Stack
                    direction={{ xs: "column", md: "row" }}
                    justifyContent="space-between"
                    alignItems={{ xs: "stretch", md: "center" }}
                    spacing={1.5}
                  >
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<FiCopy />}
                        onClick={() => handleCopyLink(invitation.token)}
                        sx={{ borderRadius: "8px" }}
                      >
                        {t("companyTeam.invitations.copyLink")}
                      </Button>

                      <Button
                        component="a"
                        href={invitationLink}
                        target="_blank"
                        rel="noreferrer"
                        variant="outlined"
                        startIcon={<FiExternalLink />}
                        sx={{ borderRadius: "8px" }}
                      >
                        {t("companyTeam.invitations.openLink")}
                      </Button>
                    </Stack>

                    <Button
                      variant="outlined"
                      color="error"
                      disabled={isSubmitting || invitation.status !== "PENDING"}
                      onClick={() => onCancel(invitation.id)}
                      sx={{ borderRadius: "8px" }}
                    >
                      {t("companyTeam.invitations.cancelInvitation")}
                    </Button>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
