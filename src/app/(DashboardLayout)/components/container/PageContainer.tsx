"use client";

import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '../../../../lib/api';
import { getRole } from '@/lib/auth';
import { CircularProgress, Box } from '@mui/material';

type Props = {
  description?: string;
  children: JSX.Element | JSX.Element[];
  title?: string;
  allowedRoles?: string[];
};

// const PageContainer = ({ title, description, children }: Props) => {
const PageContainer = ({ title, description, children, allowedRoles = [] }: Props) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null); // null indicates loading
  const [role, setRole] = useState<string>('');
  const [name, setName] = useState<string>('');
  //  const [userRole, setUserRole] = useState<string>('');
const userRole = getRole();
  const refreshToken = async () => {
    try {
      await api.post('/refresh', {}, { withCredentials: true });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      router.push('/');
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get(`/user`, { withCredentials: true });
        setIsAuthenticated(true);
        // setRole(userRole);
        setName(response.data.firstName || '');
         if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
          router.push('/dashboard/unauthorized'); // Redirect to "not authorized" page
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        router.push('/');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && error.config && !error.config.__isRetryRequest) {
          error.config.__isRetryRequest = true;
          const refreshed = await refreshToken();
          if (refreshed) {
            return api(error.config);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(interceptor);
    };
  }, [router, refreshToken]);

  if (isAuthenticated === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return null; // Redirect handled in useEffect
  }

  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{title}</title>
          <meta name="description" content={description} />
        </Helmet>
        {children}
      </div>
    </HelmetProvider>
  );
};

export default PageContainer;
