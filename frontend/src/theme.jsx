export const getDesignTokens = (mode, role) => {
  const roleColors = {
    admin: "#3f51b5",
    teacher: "#4caf50",
    student: "#ff9800",
  };

  const primaryColor = role && roleColors[role] ? roleColors[role] : "#05192D"; // DataCamp Navy Blue

  return {
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      secondary: {
        main: "#9C27B0", // Purple Accent
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
      button: { fontWeight: 600, textTransform: 'none' }, // Cast to any if needed, but 'none' is valid CSS. However, Material UI types can be strict.
    },

    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        },
      },
    },
  };
};