import { useMemo } from "react";
import { NavLink, useParams } from "react-router-dom";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { useCompanyInvitationAccept } from "@/pages/dashboard/company/invitation-accept/model/useCompanyInvitationAccept";
import {
  companyInvitationStatusLabelMap,
  companyRoleLabelMap,
  getUserDisplayName,
} from "@/widgets/company/company-team/model/companyTeamUi";

export default function CompanyInvitationAcceptPage() {
  const { token = "" } = useParams();
  const {
    invitation,
    isLoading,
    isSubmitting,
    error,
    success,
    accept,
    decline,
  } = useCompanyInvitationAccept(token);

  const canRespond = useMemo(() => {
    return invitation?.status === "PENDING";
  }, [invitation]);

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!invitation) {
    return (
      <Alert severity="error" sx={{ borderRadius: "8px" }}>
        {error || "Invitation not found."}
      </Alert>
    );
  }

  const companyName = invitation.company?.name || "Company";
  const senderName = invitation.invited_by_user
    ? getUserDisplayName(invitation.invited_by_user)
    : "Unknown sender";

  const target = invitation.email || invitation.phone || "Unknown recipient";

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>
          Company invitation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Review this invitation and choose whether to join the company.
        </Typography>
      </Stack>

      {error ? (
        <Alert severity="error" sx={{ borderRadius: "8px" }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ borderRadius: "8px" }}>
          {success}
        </Alert>
      ) : null}

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: "16px",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={invitation.company?.logo || undefined}>
              {companyName.slice(0, 1).toUpperCase()}
            </Avatar>

            <Stack spacing={0.35}>
              <Typography variant="h6" fontWeight={600}>
                {companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Invitation for {target}
              </Typography>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Chip label={companyRoleLabelMap[invitation.role]} size="small" />
            <Chip
              label={companyInvitationStatusLabelMap[invitation.status]}
              size="small"
              variant="outlined"
            />
          </Stack>

          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Sent by:</strong> {senderName}
            </Typography>
            <Typography variant="body2">
              <strong>Role:</strong> {companyRoleLabelMap[invitation.role]}
            </Typography>
            <Typography variant="body2">
              <strong>Expires at:</strong>{" "}
              {invitation.expires_at
                ? new Date(invitation.expires_at).toLocaleString()
                : "No expiry"}
            </Typography>
          </Stack>

          {invitation.company?.description ? (
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {invitation.company.description}
              </Typography>
            </Box>
          ) : null}

          {invitation.message ? (
            <Box
              sx={{
                p: 2,
                borderRadius: "12px",
                bgcolor: "grey.50",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {invitation.message}
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button
              variant="contained"
              disabled={!canRespond || isSubmitting}
              onClick={accept}
              sx={{ borderRadius: "8px" }}
            >
              Accept invitation
            </Button>

            <Button
              variant="outlined"
              color="error"
              disabled={!canRespond || isSubmitting}
              onClick={decline}
              sx={{ borderRadius: "8px" }}
            >
              Decline invitation
            </Button>

            {invitation.company_id ? (
              <Button
                component={NavLink}
                to={`/dashboard/companies/${invitation.company_id}`}
                variant="text"
                sx={{ borderRadius: "8px" }}
              >
                Open company
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
