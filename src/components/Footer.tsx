import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

const Footer = () => {
  const theme = useTheme(); // Access the Material-UI theme

  return (
    <Box
      component="footer" // Semantically render as a footer HTML element
      sx={{
        backgroundColor: theme.palette.background.paper, // Use theme's background color
        padding: theme.spacing(2, 3), // Apply consistent padding using theme spacing
        borderTop: `1px solid ${theme.palette.divider}`, // Use theme's divider color for the top border
        textAlign: 'center', // Center align the text
        mt: 'auto', // Push the footer to the bottom of the page if it's within a flex container
        py: theme.spacing(3), // Increase vertical padding for more visual space
      }}
    >
      <Typography variant="body2" color="text.secondary">
        &copy; {new Date().getFullYear()} Tanlov Dashboard. Barcha huquqlar himoyalangan.
      </Typography>
    </Box>
  );
};

export default Footer;