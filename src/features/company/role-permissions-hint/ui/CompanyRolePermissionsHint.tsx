import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { FiInfo } from "react-icons/fi";
import type { CompanyMemberRole } from "@/entities/company/model/types";
import {
  companyRoleDescriptionMap,
  companyRolePermissionMap,
  companyPermissionLabelMap,
} from "@/entities/company/model/companyRolePermissions";

type Props = {
  role: CompanyMemberRole;
};

export function CompanyRolePermissionsHint({ role }: Props) {
  return (
    <Tooltip
      placement="top"
      arrow
      title={
        <Box sx={{ p: 0.5, maxWidth: 320 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2" fontWeight={600}>
              {role}
            </Typography>

            <Typography variant="body2">
              {companyRoleDescriptionMap[role]}
            </Typography>

            <Stack spacing={0.5}>
              {companyRolePermissionMap[role].map((permission) => (
                <Typography
                  key={permission}
                  variant="caption"
                  sx={{ display: "block" }}
                >
                  • {companyPermissionLabelMap[permission]}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Box>
      }
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          color: "text.secondary",
          cursor: "help",
        }}
      >
        <FiInfo size={16} />
      </Box>
    </Tooltip>
  );
}
