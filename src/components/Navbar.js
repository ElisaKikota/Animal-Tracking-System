import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Logo from '../assets/logo.png'; // Ensure this path points to your logo

const navbarColor = '#3f51b'; // Define your common color
// Greened const navbarColor = '#3f501b'; // Define your common color

function Navbar({ toggleSidebar }) {
  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: navbarColor }}>
      <Toolbar>
        <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleSidebar}>
          <MenuIcon />
        </IconButton>
        <img src={Logo} alt="Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          AI-Powered Animal Tracking System
        </Typography>
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
