"use client";

import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Link,
  Typography,
} from "@mui/material";
import { NavigateNext as NavigateNextIcon } from "@mui/icons-material";
import NextLink from "next/link";
import { useBreadcrumbs } from "@/hooks/useBreadcrumbs";

interface BreadcrumbsProps {
  title?: string;
  hidden?: boolean;
}

export default function Breadcrumbs({
  title,
  hidden = false,
}: BreadcrumbsProps) {
  const breadcrumbItems = useBreadcrumbs();

  if (hidden || breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 3 }}>
      <MuiBreadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{
          mb: 1,
          "& .MuiBreadcrumbs-separator": {
            color: "text.secondary",
          },
        }}
      >
        {breadcrumbItems.map((item) => {
          const isLast = item.isLast;
          const displayLabel = isLast && title ? title : item.label;

          if (isLast) {
            return (
              <Typography
                key={item.path}
                color="text.primary"
                variant="body1"
                sx={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
                aria-current="page"
              >
                {displayLabel}
              </Typography>
            );
          }

          return (
            <Link
              key={item.path}
              component={NextLink}
              href={item.path}
              underline="hover"
              color="text.secondary"
              sx={{
                fontSize: "0.875rem",
                "&:hover": {
                  color: "primary.main",
                },
                "&:focus": {
                  outline: "2px solid",
                  outlineColor: "primary.main",
                  outlineOffset: "2px",
                  borderRadius: "4px",
                },
              }}
              aria-label={`Ir para ${item.label}`}
            >
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>

      {/* <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          fontSize: { xs: "1.75rem", sm: "2rem", md: "2.125rem" },
        }}
      >
        {title || breadcrumbItems[breadcrumbItems.length - 1]?.label || ""}
      </Typography> */}
    </Box>
  );
}
