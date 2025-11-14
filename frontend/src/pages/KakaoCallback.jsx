import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const processKakaoLogin = async () => {
      if (processing) return;
      setProcessing(true);

      const token = searchParams.get('token');
      const error = searchParams.get('error');

      if (error) {
        console.error('Kakao login error:', error);
        navigate('/login?error=kakao_auth_failed', { replace: true });
        return;
      }

      if (token) {
        try {
          // Save token
          localStorage.setItem('token', token);

          // Fetch user info
          const response = await api.get('/users/me');
          const user = response.data;

          // Save user
          localStorage.setItem('user', JSON.stringify(user));

          // Check if profile is complete
          const isProfileComplete = user.name && user.email && user.phone;

          if (!isProfileComplete) {
            // Redirect to complete profile
            navigate('/complete-profile', { replace: true });
          } else {
            // Update auth context
            window.location.href = '/';
          }
        } catch (err) {
          console.error('Failed to fetch user info:', err);
          localStorage.removeItem('token');
          navigate('/login?error=fetch_user_failed', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };

    processKakaoLogin();
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      fontSize: '1.2rem',
      color: '#666'
    }}>
      로그인 처리중...
    </div>
  );
};

export default KakaoCallback;
