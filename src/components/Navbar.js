import React from 'react';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function Navbar({ toggleSidebar, isSidebarOpen }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'primary.dark',
        boxShadow: '0 2px 12px rgba(15, 40, 26, 0.2)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1.5, sm: 2 } }}>
        <IconButton
          edge="start"
          color="inherit"
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="primary-navigation"
          aria-expanded={isSidebarOpen}
          onClick={toggleSidebar}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontWeight: 650,
            fontSize: { xs: '0.95rem', sm: '1.15rem' },
            lineHeight: 1.2,
          }}
        >
          <span className="navbar-title-short">Animal Tracking</span>
          <span className="navbar-title-full">WildGuard: AI-Powered Animal Tracking System</span>
        </Typography>
        <IconButton
          color="inherit"
          aria-label="Notifications"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <NotificationsIcon />
        </IconButton>
        <IconButton
          color="inherit"
          aria-label="Account"
          sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
