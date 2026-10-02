import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';

function ProtectedRoute({ children }) {
  const { slug = '' } = useParams();
  const location = useLocation();
  const { activeSlug, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // A URL for another band must not activate an older stored session.
  if (slug !== activeSlug) {
    return <Navigate to={`/${activeSlug}/dashboard`} replace />;
  }

  return children;
}

export default ProtectedRoute;
