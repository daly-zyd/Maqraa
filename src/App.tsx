import React from "react";
import AppRoutes from "./routes";
import { CinemaIntro } from "./components/CinemaIntro";
import { ThemeProvider } from "./features/theme/ThemeContext";

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <CinemaIntro />
      <AppRoutes />
    </ThemeProvider>
  );
};

export default App;
