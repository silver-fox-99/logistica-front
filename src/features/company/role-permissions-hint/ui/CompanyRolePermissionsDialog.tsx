import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Stack,
    Typography,
    Chip,
} from "@mui/material";
import type { CompanyMemberRole } from "@/entities/company/model/types";
import {
    companyPermissionLabelMap,
    companyRoleDescriptionMap,
    companyRolePermissionMap,
} from "@/entities/company/model/companyRolePermissions";
import { companyRoleLabelMap } from "@/widgets/company/company-team/model/companyTeamUi";

type Props = {
    open: boolean;
    role: CompanyMemberRole | null;
    onClose: () => void;
};

export function CompanyRolePermissionsDialog({
                                                 open,
                                                 role,
                                                 onClose,
                                             }: Props) {
    if (!role) return null;

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                {companyRoleLabelMap[role]} permissions
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2} sx={{ pt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        {companyRoleDescriptionMap[role]}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip label={companyRoleLabelMap[role]} size="small" />
                    </Stack>

                    <Stack gap={1}>
                        {companyRolePermissionMap[role].map((permission) => (
                            <Typography sx={{margin: '0 !important'}} key={permission} variant="body2">
                                • {companyPermissionLabelMap[permission]}
                            </Typography>
                        ))}
                    </Stack>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}