import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Avatar, styled, useTheme, Typography, Tooltip } from "@mui/material";
import MuiDrawer from "@mui/material/Drawer";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ClassOutlinedIcon from "@mui/icons-material/ClassOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AnalyticsOutlinedIcon from "@mui/icons-material/AnalyticsOutlined";
import GradingOutlinedIcon from "@mui/icons-material/GradingOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import EmojiObjectsOutlinedIcon from "@mui/icons-material/EmojiObjectsOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import { useNavigate } from "react-router-dom";
import { grey, blue } from "@mui/material/colors";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
  // @ts-ignore
  })(({ theme, open }) => ({
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && {
      ...openedMixin(theme),
      "& .MuiDrawer-paper": openedMixin(theme),
    }),
    ...(!open && {
      ...closedMixin(theme),
      "& .MuiDrawer-paper": closedMixin(theme),
    }),
  }));

// Menu items for each role
const adminMenuItems = {
  main: [
    { text: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/admin/dashboard" },
    { text: "Classes", icon: <ClassOutlinedIcon />, path: "/admin/Classes" },
    { text: "Enseignants", icon: <PersonOutlinedIcon />, path: "/admin/Enseignants" },
    { text: "Étudiants", icon: <SchoolOutlinedIcon />, path: "/admin/Etudiants" },
    { text: "Matieres", icon: <SchoolOutlinedIcon />, path: "/admin/Matieres" },

    { text: "Performances", icon: <AssessmentOutlinedIcon />, path: "/admin/Performances" },
    { text: "Analyse", icon: <AnalyticsOutlinedIcon />, path: "/admin/Analyse" },
  ],
};

const teacherMenuItems = {
  main: [
    { text: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/teacher/dashboard" },
    { text: "Notes", icon: <GradingOutlinedIcon />, path: "/teacher/Notes" },
    { text: "Analyse", icon: <AnalyticsOutlinedIcon />, path: "/teacher/Analyse" },
    { text: "Alertes", icon: <NotificationsActiveOutlinedIcon />, path: "/teacher/Alertes" },
  ],
};

const studentMenuItems = {
  main: [
    { text: "Dashboard", icon: <DashboardOutlinedIcon />, path: "/student/dashboard" },
    { text: "Guidance", icon: <EmojiObjectsOutlinedIcon />, path: "/student/Guidance" },
    { text: "Alerts", icon: <NotificationsActiveOutlinedIcon />, path: "/student/Alerts" },
    { text: "Notes", icon: <GradingOutlinedIcon />, path: "/student/Notes" },
  ],
};

// Helper function to generate initials from a name
const getInitials = (name) => {
  if (!name) return "U";
  const nameParts = name.split(" ");
  if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
  return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
};

const getRoleDetails = (role) => {
  switch(role) {
    case 'admin':
      return {
        name: "Admin User",
        role: "Administrator",
        menuItems: adminMenuItems
      };
    case 'teacher':
      return {
        name: "Teacher Name",
        role: "Teacher",
        menuItems: teacherMenuItems
      };
    case 'student':
      return {
        name: "Student Name",
        role: "Student",
        menuItems: studentMenuItems
      };
    default:
      return {
        name: "User",
        role: "Guest",
        menuItems: studentMenuItems
      };
  }
};

const Sidebar = ({ open, handleDrawerClose, role, pathname }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const roleInfo = getRoleDetails(role);
  const { menuItems, name, role: roleName } = roleInfo;
  
  // Generate initials for the avatar
  const initials = getInitials(name);
  
  // Fixed avatar background color based on role
  const getAvatarBgColor = () => {
    switch(role) {
      case 'admin':
        return '#3f51b5'; // Indigo
      case 'teacher':
        return '#4caf50'; // Green
      case 'student':
        return '#2196f3'; // Blue
      default:
        return blue[600]; // Default blue
    }
  };

  const renderMenuItems = (items) => {
    return items.map((item) => (
      <ListItem key={item.path} disablePadding sx={{ display: "block" }}>
        <Tooltip title={open ? null : item.text} placement="left">
          <ListItemButton
            onClick={() => {
              navigate(item.path);
            }}
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              bgcolor:
                pathname === item.path
                  ? theme.palette.mode === "dark"
                    ? grey[800]
                    : grey[300]
                  : null,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 3 : "auto",
                justifyContent: "center",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              sx={{ opacity: open ? 1 : 0 }}
            />
          </ListItemButton>
        </Tooltip>
      </ListItem>
    ));
  };

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        <IconButton onClick={handleDrawerClose}>
          {theme.direction === "rtl" ? (
            <ChevronRightIcon />
          ) : (
            <ChevronLeftIcon />
          )}
        </IconButton>
      </DrawerHeader>
      <Divider />
      <Avatar
        sx={{
          mx: "auto",
          width: open ? 88 : 44,
          height: open ? 88 : 44,
          my: 1,
          border: "2px solid grey",
          transition: "0.25s",
          bgcolor: getAvatarBgColor(),
          fontSize: open ? 32 : 18,
          fontWeight: "bold",
          color: "white",
        }}
        alt={name}
      >
        {initials}
      </Avatar>
      <Typography
        align="center"
        sx={{ fontSize: open ? 17 : 0, transition: "0.25s" }}
      >
        {name}
      </Typography>
      <Typography
        align="center"
        sx={{
          fontSize: open ? 15 : 0,
          transition: "0.25s",
          color: theme.palette.info.main,
        }}
      >
        {roleName}
      </Typography>

      <Divider />

      <List>{renderMenuItems(menuItems.main)}</List>

      {menuItems.tools && (
        <>
          <Divider />
          <List>{renderMenuItems(menuItems.tools)}</List>
        </>
      )}

      {menuItems.analytics && (
        <>
          <Divider />
          <List>{renderMenuItems(menuItems.analytics)}</List>
        </>
      )}
    </Drawer>
  );
};

export default Sidebar;