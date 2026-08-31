import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

export const Events: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/', { replace: true });
  }, [navigate]);

  return <Home />;
};

export default Events;
