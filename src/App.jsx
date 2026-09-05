import Landing from '../Pages/Landing/Landing';
import BandPublic from '../Pages/BandPublic/BandPublic';
import Blog from '../Pages/Blog/Blog';
import Cart from '../Pages/Cart/Cart';
import DashboardBlog from '../Pages/Dashboard/DashboardBlog';
import Dashboard from '../Pages/Dashboard/Dashboard';
import DashboardBand from '../Pages/Dashboard/DashboardBand';
import DashboardMessageDetail from '../Pages/Dashboard/DashboardMessageDetail';
import DashboardMessages from '../Pages/Dashboard/DashboardMessages';
import DashboardProducts from '../Pages/Dashboard/DashboardProducts';
import DashboardShows from '../Pages/Dashboard/DashboardShows';
import Login from '../Pages/Login/Login';
import { Navigate, Route, Routes } from 'react-router-dom';
import PostDetail from '../Pages/PostDetail/PostDetail';
import ProductDetail from '../Pages/ProductDetail/ProductDetail';
import ShowDetail from '../Pages/ShowDetail/ShowDetail';
import Store from '../Pages/Store/Store';
import TicketCart from '../Pages/TicketCart/TicketCart';
import Tickets from '../Pages/Tickets/Tickets';
import ProtectedRoute from '../Components/ProtectedRoute/ProtectedRoute';

function App() {
    return (
        <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/login" element={<Login />} />

    {/* Public band */}
    <Route path="/:slug" element={<BandPublic />} />
    <Route path="/:slug/store" element={<Store />} />
    <Route path="/:slug/store/product/:productId" element={<ProductDetail />} />
    <Route path="/:slug/shows" element={<Tickets />} />
    <Route path="/:slug/shows/:showId" element={<ShowDetail />} />
    <Route path="/:slug/blog" element={<Blog />} />
    <Route path="/:slug/blog/:postId" element={<PostDetail />} />

    {/* Slug-scoped dashboard routes */}
    <Route path="/:slug/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/banda" element={<ProtectedRoute><DashboardBand /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/mensajes" element={<ProtectedRoute><DashboardMessages /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/mensajes/:messageId" element={<ProtectedRoute><DashboardMessageDetail /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/productos" element={<ProtectedRoute><DashboardProducts /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/shows" element={<ProtectedRoute><DashboardShows /></ProtectedRoute>} />
    <Route path="/:slug/dashboard/blog" element={<ProtectedRoute><DashboardBlog /></ProtectedRoute>} />

    <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
    );
}

export default App;