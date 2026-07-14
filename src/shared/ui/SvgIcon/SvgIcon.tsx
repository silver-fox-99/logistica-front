import { Box } from "@mui/material";

interface SvgIconProps {
  src: string;
  size?: number;
}

export const SvgIcon = ({ src, size = 20 }: SvgIconProps) => {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        backgroundColor: "currentColor",
        mask: `url("${src}") no-repeat center / contain`,
        WebkitMask: `url("${src}") no-repeat center / contain`,
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
};
