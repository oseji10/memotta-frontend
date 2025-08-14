import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();

    useEffect(() => {
      // Check for the token or session
      const token = Cookies.get('token');
      if (!token) {
        router.push('/'); // Redirect to login if no token
      }
    }, []);

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
