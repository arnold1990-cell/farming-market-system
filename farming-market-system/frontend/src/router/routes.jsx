import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import MarketplacePage from '../pages/MarketplacePage';
import ProductDetailsPage from '../pages/ProductDetailsPage';
import CartPage from '../pages/CartPage';
import CheckoutPage from '../pages/CheckoutPage';
import OrdersPage from '../pages/OrdersPage';
import CustomerMapPage from '../pages/CustomerMapPage';
import HarvestCalendarPage from '../pages/HarvestCalendarPage';
import BuyerDashboardPage from '../pages/buyer/BuyerDashboardPage';
import FarmerDashboardPage from '../pages/farmer/FarmerDashboardPage';
import FarmerProductsPage from '../pages/farmer/FarmerProductsPage';
import FarmerOrdersPage from '../pages/farmer/FarmerOrdersPage';
import FarmerProductDetailsPage from '../pages/farmer/FarmerProductDetailsPage';
import FarmerProfilePage from '../pages/farmer/FarmerProfilePage';
import FarmerWeatherPage from '../pages/farmer/FarmerWeatherPage';
import DeliveryDashboardPage from '../pages/delivery/DeliveryDashboardPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AdminManagementPage from '../pages/admin/AdminManagementPage';
import FarmersPage from '../pages/admin/FarmersPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from '../routes/RoleRoute';

export const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/marketplace', element: <MarketplacePage /> },
  { path: '/map', element: <CustomerMapPage /> },
  { path: '/calendar', element: <HarvestCalendarPage /> },
  { path: '/products/:id', element: <ProductDetailsPage /> },

  { path: '/cart', element: <CartPage /> },
  { path: '/checkout', element: <ProtectedRoute><RoleRoute roles={['BUYER']}><CheckoutPage /></RoleRoute></ProtectedRoute> },
  { path: '/orders', element: <ProtectedRoute><RoleRoute roles={['BUYER']}><OrdersPage /></RoleRoute></ProtectedRoute> },
  { path: '/buyer/dashboard', element: <ProtectedRoute><RoleRoute roles={['BUYER']}><BuyerDashboardPage /></RoleRoute></ProtectedRoute> },
  { path: '/buyer/map', element: <ProtectedRoute><RoleRoute roles={['BUYER']}><CustomerMapPage /></RoleRoute></ProtectedRoute> },
  { path: '/buyer/calendar', element: <ProtectedRoute><RoleRoute roles={['BUYER']}><HarvestCalendarPage /></RoleRoute></ProtectedRoute> },

  { path: '/farmer/dashboard', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerDashboardPage /></RoleRoute></ProtectedRoute> },
  { path: '/farmer/products', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerProductsPage /></RoleRoute></ProtectedRoute> },
  { path: '/farmer/orders', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerOrdersPage /></RoleRoute></ProtectedRoute> },
  { path: '/farmer/calendar', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerWeatherPage /></RoleRoute></ProtectedRoute> },
  { path: '/farmer/profile', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerProfilePage /></RoleRoute></ProtectedRoute> },
  { path: '/farmer/products/:id', element: <ProtectedRoute><RoleRoute roles={['FARMER']}><FarmerProductDetailsPage /></RoleRoute></ProtectedRoute> },

  { path: '/delivery/dashboard', element: <ProtectedRoute><RoleRoute roles={['DELIVERY_AGENT']}><DeliveryDashboardPage /></RoleRoute></ProtectedRoute> },
  { path: '/agent/dashboard', element: <ProtectedRoute><RoleRoute roles={['DELIVERY_AGENT']}><DeliveryDashboardPage /></RoleRoute></ProtectedRoute> },

  { path: '/admin/dashboard', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminDashboardPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/users', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminManagementPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/farmers', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><FarmersPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/products', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminManagementPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/orders', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminManagementPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/categories', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminManagementPage /></RoleRoute></ProtectedRoute> },
  { path: '/admin/deliveries', element: <ProtectedRoute><RoleRoute roles={['ADMIN']}><AdminManagementPage /></RoleRoute></ProtectedRoute> },

  { path: '*', element: <NotFoundPage /> }
];
