import {
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { FiArrowRight, FiBriefcase, FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import type { Company } from "@/entities/company/model/types";

type Props = {
  company: Company;
};

const statusMap: Record<
  Company["status"],
  { label: string; color: "default" | "success" | "warning" | "error" }
> = {
  UNVERIFIED: { label: "Unverified", color: "default" },
  PENDING_REVIEW: { label: "Pending review", color: "warning" },
  VERIFIED: { label: "Verified", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  BLOCKED: { label: "Blocked", color: "error" },
};

export function CompanyCard({ company }: Props) {
  const navigate = useNavigate();
  const status = statusMap[company.status];

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        height: "100%",
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={1}
          >
            <Stack spacing={0.75} sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <FiBriefcase size={18} />
                <Typography variant="h6" fontWeight={600} noWrap>
                  {company.name}
                </Typography>
              </Stack>

              {company.legal_name && (
                <Typography variant="body2" color="text.secondary" noWrap>
                  {company.legal_name}
                </Typography>
              )}
            </Stack>

            <Chip
              label={status.label}
              color={status.color}
              size="small"
              sx={{ fontWeight: 600 }}
            />
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              <FiUsers size={16} />
              <Typography variant="body2" color="text.secondary">
                {company.members_limit == null
                  ? "No member limit"
                  : `Member limit: ${company.members_limit}`}
              </Typography>
            </Stack>
          </Stack>

          {company.verification_comment && (
            <Typography variant="body2" color="text.secondary">
              {company.verification_comment}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={() => navigate(`/dashboard/company/${company.id}`)}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              borderRadius: 2,
              fontWeight: 600,
              gap: 1,
            }}
          >
            Open
            <FiArrowRight size={16} />
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
