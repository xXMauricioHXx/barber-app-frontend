"use client";

import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
} from "@mui/material";
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";

const drawerWidth = 280;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: "permanent" | "persistent" | "temporary";
  isMobile?: boolean;
}

const menuItems = [
  {
    text: "Dashboard",
    icon: <DashboardIcon />,
    href: "/dashboard",
  },
  {
    text: "Clientes",
    icon: <PeopleIcon />,
    href: "/dashboard/clients",
  },
  {
    text: "Funcionários",
    icon: <GroupIcon />,
    href: "/dashboard/employees",
  },
  {
    text: "Agenda",
    icon: <ScheduleIcon />,
    href: "/dashboard/appointments",
  },
  {
    text: "Configurações",
    icon: <SettingsIcon />,
    href: "/dashboard/settings",
  },
];

export default function Sidebar({
  open,
  onClose,
  variant = "temporary",
  isMobile = false,
}: SidebarProps) {
  const pathname = usePathname();

  const handleItemClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ overflow: "auto" }}>
      <Toolbar />
      <Divider />
      <List sx={{ pt: 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              href={item.href}
              selected={pathname === item.href}
              onClick={handleItemClick}
              sx={{
                "&.Mui-selected": {
                  backgroundColor: "secondary.main",
                  color: "black",
                  "&:hover": {
                    backgroundColor: "secondary.main",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: pathname === item.href ? "inherit" : "action.active",
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        },
      }}
      ModalProps={{
        keepMounted: true,
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
