import BandPublic from '../Pages/BandPublic/BandPublic';
import Blog from '../Pages/Blog/Blog';
import Cart from '../Pages/Cart/Cart';
import DashboardBlog from '../Pages/Dashboard/DashboardBlog';
import Dashboard from '../Pages/Dashboard/Dashboard';
import DashboardProducts from '../Pages/Dashboard/DashboardProducts';
import DashboardShows from '../Pages/Dashboard/DashboardShows';
import { Navigate, Route, Routes } from 'react-router-dom';
import PostDetail from '../Pages/PostDetail/PostDetail';
import ProductDetail from '../Pages/ProductDetail/ProductDetail';
import ShowDetail from '../Pages/ShowDetail/ShowDetail';
import Store from '../Pages/Store/Store';
import TicketCart from '../Pages/TicketCart/TicketCart';
import Tickets from '../Pages/Tickets/Tickets';

function App() {
    return (
        <Routes>
            <Route path="/" element={<BandPublic />} />
            <Route path="/tienda" element={<Store />} />
            <Route path="/tienda/producto/:productId" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/shows" element={<Tickets />} />
            <Route path="/shows/:showId" element={<ShowDetail />} />
            <Route path="/carrito-tickets" element={<TicketCart />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:postId" element={<PostDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/productos" element={<DashboardProducts />} />
            <Route path="/dashboard/shows" element={<DashboardShows />} />
            <Route path="/dashboard/blog" element={<DashboardBlog />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;