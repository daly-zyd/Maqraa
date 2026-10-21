import React from "react";
import AppRoutes from "./routes";
import { CinemaIntro } from "./components/CinemaIntro";
import { MotionConfig } from "framer-motion";
import { AuthProvider } from "./features/auth/AuthContext";
import { ThemeProvider } from "./features/theme/ThemeContext";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <AuthProvider>
          <CinemaIntro />
          <AppRoutes />
        </AuthProvider>
      </MotionConfig>
    </ThemeProvider>
  );
};

export default App;
