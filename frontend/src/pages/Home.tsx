import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{name: string; email: string} | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getMe();
        setUser(res.user);
      } catch {
        localStorage.removeItem('token');
        navigate('/login');
      }
    })();
  }, [navigate]);

  function logout() {
    localStorage.removeItem('token');
    navigate('/login');
  }

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Welcome {user?.name || ''}</h1>
      <p>{user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
