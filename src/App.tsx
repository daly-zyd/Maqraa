import React from "react";
import AppRoutes from "./routes";
import { CinemaIntro } from "./components/CinemaIntro";
import { AuthProvider } from "./features/auth/AuthContext";
import { ThemeProvider } from "./features/theme/ThemeContext";

/* Motion is CSS only; prefers-reduced-motion is honoured in index.css and by the motion-reduce: variants. */
export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CinemaIntro />
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
