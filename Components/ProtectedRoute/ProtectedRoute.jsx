import { useLayoutEffect } from 'react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';

function ProtectedRoute({ children }) {
  const { slug = '' } = useParams();
  const location = useLocation();
  const { hasSessionForSlug, activateSession } = useAuth();

  const isAllowed = hasSessionForSlug(slug);

  useLayoutEffect(() => {
    if (isAllowed) {
      activateSession(slug);
    }
  }, [activateSession, isAllowed, slug]);

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
