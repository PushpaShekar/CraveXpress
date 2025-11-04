import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error(error);
      navigate('/login');
      return;
    }

    if (token) {
      localStorage.setItem('token', token);
      
      // Fetch user data
      fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          updateUser(user);
          toast.success('Successfully logged in with Google!');
          navigate('/');
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to fetch user data');
          navigate('/login');
        });
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, updateUser]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
};

export default AuthCallback;

