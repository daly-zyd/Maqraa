import React, { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import { RequireAuth } from '../features/auth/RequireAuth';
import { CAP } from '../features/auth/permissions';
import { ScrollToTop } from '../components/ScrollToTop';

const About = lazy(() => import('../pages/About'));
const Programs = lazy(() => import('../pages/Programs'));
const ProgramDetail = lazy(() => import('../pages/ProgramDetail'));
const Team = lazy(() => import('../pages/Team'));
const Quran = lazy(() => import('../pages/Quran'));
const Tazkiya = lazy(() => import('../pages/Tazkiya'));
const Contact = lazy(() => import('../pages/Contact'));
const Admin = lazy(() => import('../pages/Admin'));
const Styleguide = lazy(() => import('../pages/Styleguide'));
const Login = lazy(() => import('../pages/Login'));
const Dashboard = lazy(() => import('../pages/Dashboard'));
const Profile = lazy(() => import('../pages/Profile'));
const Schedule = lazy(() => import('../pages/Schedule'));

export const AppRoutes: React.FC = () => {
  return (
    <HashRouter>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<p className="py-24 text-center text-stone-500" role="status">جارٍ التحميل…</p>}>
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
          <Route path="/styleguide" element={<Styleguide />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/dashboard/schedule" element={<RequireAuth capability={CAP.scheduleViewOwn}><Schedule /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          {/* Catch-all fallback */}
          <Route path="*" element={<Home />} />
        </Routes>
        </Suspense>
      </Layout>
    </HashRouter>
  );
};
export default AppRoutes;
