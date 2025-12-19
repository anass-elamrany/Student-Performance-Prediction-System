export const getDesignTokens = (mode, role) => {
  // Unified color scheme matching Landing Page
  // Unified color scheme matching Landing Page
  // DataCamp Navy Blue for Light Mode, Lighter Blue for Dark Mode
  const primaryColor = mode === 'dark' ? "#90CAF9" : "#05192D"; 
  const secondaryColor = "#9C27B0"; // Purple Accent

  return {
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: secondaryColor,
      },
      background: {
        default: mode === 'light' ? "#ffffff" : "#121212",
        paper: mode === 'light' ? "#f7f9fc" : "#1e1e1e",
      },
    },
    typography: {
      fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 800 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: 'none' },
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 0, 
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 0, 
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
             borderRadius: 0, // Square design
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 0, 
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 0,
          },
        },
      },
    },
  };
};