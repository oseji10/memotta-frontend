import React, { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter for redirection
import Link from "next/link";
import {
  Avatar,
  Box,
  Menu,
  Button,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import axios from "axios"; // Import axios for API call
import { IconListCheck, IconMail, IconUser, IconBellRinging } from "@tabler/icons-react";
import { getStaffEmail, getCandidateName, getApplicationType, getRole } from "@/lib/auth";

const Profile = () => {
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);
  const router = useRouter(); // Initialize router for redirection

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl2(event.currentTarget);
  };

  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const role = getRole();
  const fullname = getCandidateName();

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call backend logout endpoint
      await axios.post(
        `${process.env.NEXT_PUBLIC_APP_URL}/users/logout`,
        {},
        { withCredentials: true }
      );
      // Clear localStorage
      localStorage.removeItem('user');
      // Redirect to homepage
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally show an error message to the user
      // Clear localStorage and redirect anyway
      localStorage.removeItem('user');
      router.push('/');
    }
    // Close the menu
    handleClose2();
  };

  return (
    <Box>
      {/* <IconButton
        size="large"
        aria-label="show notifications"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
      >
        <Badge variant="dot" color="primary">
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton> */}
      <b>{fullname}  </b>
      <IconButton
        size="large"
        aria-label="show profile menu"
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
          }),
        }}
        onClick={handleClick2}
      >
        <Avatar
          src="/images/profile/user-1.jpg"
          alt="profile image"
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>
      {/* ------------------------------------------- */}
      {/* Profile Dropdown */}
      {/* ------------------------------------------- */}
      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "200px",
          },
        }}
      >
        <MenuItem>
          <ListItemIcon>
            <IconUser width={20} />
          </ListItemIcon>
          <ListItemText>My Profile</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconMail width={20} />
          </ListItemIcon>
          <ListItemText>My Account</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <IconListCheck width={20} />
          </ListItemIcon>
          <ListItemText>My Tasks</ListItemText>
        </MenuItem>
        <Box mt={1} py={1} px={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={handleLogout} // Call handleLogout instead of href
          >
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;