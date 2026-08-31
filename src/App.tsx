import React from "react";
import AppRoutes from "./routes";
import { CinemaIntro } from "./components/CinemaIntro";

export const App: React.FC = () => {
  return (
    <>
      <CinemaIntro />
      <AppRoutes />
    </>
  );
};

export default App;
