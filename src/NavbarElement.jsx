import React, { useState, useEffect } from 'react';
import { AppBar, Toolbar, IconButton, Switch, TextField, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import './CSS/light-mode.css'; // Ensure you include your default light theme CSS
import './CSS/dark-mode.css';  // Ensure you include your dark theme CSS

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Toggle the theme on the body element
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Title or Branding */}
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Language
        </Typography>

        {/* Theme Toggle Switch */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body1" sx={{ marginRight: 1 }}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Typography>
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            color="default"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
