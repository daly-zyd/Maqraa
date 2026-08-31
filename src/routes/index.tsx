import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import About from '../pages/About';
import Programs from '../pages/Programs';
import ProgramDetail from '../pages/ProgramDetail';
import Team from '../pages/Team';
import Quran from '../pages/Quran';
import Tazkiya from '../pages/Tazkiya';
import Contact from '../pages/Contact';
import Admin from '../pages/Admin';
import { ScrollToTop } from '../components/ScrollToTop';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/programs/:slug" element={<ProgramDetail />} />
          <Route path="/team" element={<Team />} />
          <Route path="/teachers" element={<Navigate to="/team" replace />} />
          <Route path="/online-learning" element={<Home />} />
          <Route path="/quran" element={<Quran />} />
          <Route path="/tazkiya" element={<Tazkiya />} />
          <Route path="/events" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
};
export default AppRoutes;
