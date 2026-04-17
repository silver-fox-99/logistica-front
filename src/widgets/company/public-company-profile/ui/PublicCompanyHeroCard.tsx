import {
    Avatar,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from "@mui/material";
import type { PublicCompanyProfile } from "@/entities/company/model/types";

type Props = {
    company: PublicCompanyProfile;
    isAuthenticated?: boolean;
    isSubmitting?: boolean;
    onJoinClick: () => void;
};

function buildLocation(company: PublicCompanyProfile) {
    return [company.country, company.region, company.city].filter(Boolean).join(", ");
}

export function PublicCompanyHeroCard({
                                          company,
                                          isAuthenticated = false,
                                          isSubmitting = false,
                                          onJoinClick,
                                      }: Props) {
    const location = buildLocation(company);

    return (
        <Card variant="outlined" sx={{ borderRadius: 4 }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Stack spacing={3}>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={2.5}
                        justifyContent="space-between"
                        alignItems={{ xs: "flex-start", md: "center" }}
                    >
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={company.logo || undefined}
                                alt={company.name}
                                sx={{ width: 72, height: 72 }}
                            >
                                {company.name.slice(0, 1).toUpperCase()}
                            </Avatar>

                            <Stack spacing={0.75}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography variant="h4" fontWeight={800}>
                                        {company.name}
                                    </Typography>
                                    <Chip label="Verified company" color="success" size="small" />
                                </Stack>

                                <Typography variant="body1" color="text.secondary">
                                    {company.legal_name || "Public company profile"}
                                </Typography>

                                {location ? (
                                    <Typography variant="body2" color="text.secondary">
                                        {location}
                                    </Typography>
                                ) : null}
                            </Stack>
                        </Stack>

                        <Button
                            variant="contained"
                            onClick={onJoinClick}
                            disabled={isSubmitting}
                        >
                            {isAuthenticated ? "Apply to join" : "Login to apply"}
                        </Button>
                    </Stack>

                    {company.description ? (
                        <Typography variant="body1" color="text.primary">
                            {company.description}
                        </Typography>
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            This company has not added a public description yet.
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}