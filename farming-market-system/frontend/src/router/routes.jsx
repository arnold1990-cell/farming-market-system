import { lazy } from 'react';
import ProtectedRoute from '../routes/ProtectedRoute';
import RoleRoute from '../routes/RoleRoute';

const LandingPage = lazy(() => import('../pages/LandingPage'));
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const MarketplacePage = lazy(() => import('../pages/MarketplacePage'));
const ProductDetailsPage = lazy(() => import('../pages/ProductDetailsPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const CustomerMapPage = lazy(() => import('../pages/CustomerMapPage'));
const HarvestCalendarPage = lazy(() => import('../pages/HarvestCalendarPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const BuyerDashboardPage = lazy(() => import('../pages/buyer/BuyerDashboardPage'));
const FarmerDashboardPage = lazy(() => import('../pages/farmer/FarmerDashboardPage'));
const FarmerProductsPage = lazy(() => import('../pages/farmer/FarmerProductsPage'));
const FarmerOrdersPage = lazy(() => import('../pages/farmer/FarmerOrdersPage'));
const FarmerProductDetailsPage = lazy(() => import('../pages/farmer/FarmerProductDetailsPage'));
const FarmerProfilePage = lazy(() => import('../pages/farmer/FarmerProfilePage'));
const FarmerWeatherPage = lazy(() => import('../pages/farmer/FarmerWeatherPage'));
const DeliveryDashboardPage = lazy(() => import('../pages/delivery/DeliveryDashboardPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const AdminManagementPage = lazy(() => import('../pages/admin/AdminManagementPage'));
const FarmersPage = lazy(() => import('../pages/admin/FarmersPage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));

export const routes = [
  { path: '/', element: <LandingPage /> },
  { path: '/home', element: <LandingPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/market', element: <MarketplacePage /> },
  { path: '/marketplace', element: <MarketplacePage /> },
  { path: '/map', element: <CustomerMapPage /> },
  { path: '/calendar', element: <HarvestCalendarPage /> },
  { path: '/profile', element: <ProfilePage /> },
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
