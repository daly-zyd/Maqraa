import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { can } from './permissions';

interface RequireAuthProps {
  /** When set, the user must hold this capability (anywhere); otherwise they are sent to the dashboard. */
  capability?: string;
  children: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ capability, children }) => {
  const { me, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="py-24 text-center text-stone-500" role="status">جارٍ التحميل…</p>;
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (capability && !can(me, capability)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
