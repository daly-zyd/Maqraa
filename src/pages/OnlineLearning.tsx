import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Home from './Home';

export const OnlineLearning: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/#online-learning', { replace: true });
  }, [navigate]);

  return <Home />;
};

export default OnlineLearning;
