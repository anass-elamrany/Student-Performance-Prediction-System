import React from "react";
import ReactDOM from "react-dom/client";
import './index.css';
import { RouterProvider } from "react-router-dom";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { getDesignTokens } from './theme';
import { router } from "./routes";

// @ts-ignore
const theme = createTheme(getDesignTokens("light", null));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
