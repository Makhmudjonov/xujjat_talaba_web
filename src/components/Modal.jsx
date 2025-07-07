import React from 'react';
import {
  Modal as MuiModal, // Alias Material-UI's Modal to avoid naming conflict
  Box,
  IconButton,
  Backdrop, // For the semi-transparent overlay
  Fade,     // For smooth transition
  useTheme, // To access theme for consistent styling
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close'; // Material-UI close icon

const CustomModal = ({ isOpen, onClose, children }) => {
  const theme = useTheme(); // Get the current theme

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      closeAfterTransition // Close the modal only after the exit transition finishes
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500, // Duration of the backdrop transition
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)', // Match the semi-transparent black overlay
        },
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: theme.zIndex.modal, // Ensure it's on top of other content
      }}
    >
      <Fade in={isOpen}>
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper, // Use theme's paper background
            padding: theme.spacing(3), // Consistent padding
            borderRadius: theme.shape.borderRadius * 2, // Rounded corners
            boxShadow: theme.shadows[12], // A strong shadow for a prominent modal
            maxWidth: '90%', // Max width 90% of screen
            width: 500, // Fixed width up to max-width
            maxHeight: '90vh', // Prevent content from going off screen vertically
            overflowY: 'auto', // Add scroll if content exceeds max height
            position: 'relative', // For absolute positioning of the close button
            outline: 'none', // Remove focus outline
          }}
        >
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: theme.spacing(1), // Adjust position from top
              right: theme.spacing(1), // Adjust position from right
              color: theme.palette.text.secondary, // Secondary text color for the icon
              '&:hover': {
                color: theme.palette.text.primary, // Darker on hover
                backgroundColor: theme.palette.action.hover, // Subtle background on hover
              },
            }}
          >
            <CloseIcon /> {/* Use Material-UI's close icon */}
          </IconButton>
          {children}
        </Box>
      </Fade>
    </MuiModal>
  );
};

export default CustomModal;