import React from "react";
import AppRoutes from "./routes";
import { CinemaIntro } from "./components/CinemaIntro";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "./features/theme/ThemeContext";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <MotionConfig reducedMotion="user">
        <CinemaIntro />
        <AppRoutes />
      </MotionConfig>
    </ThemeProvider>
  );
};

export default App;
