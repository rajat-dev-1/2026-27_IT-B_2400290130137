import { createBrowserRouter } from 'react-router-dom';

import PublicLayout from '../components/layout/PublicLayout';
import AppLayout from '../components/layout/AppLayout';

import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import AuthCallbackPage from '../pages/AuthCallbackPage';
import DashboardPage from '../pages/DashboardPage';
import RepositoryPage from '../pages/RepositoryPage';
import DesignSystemPage from '../pages/DesignSystemPage';
import NotFoundPage from '../pages/NotFoundPage';
import ProtectedRoute from '../routes/ProtectedRoute';
import ErrorBoundary from '../components/ui/ErrorBoundary';

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/auth/callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "*",
        element: <NotFoundPage />,
      }
    ]
  },
  {
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/dashboard",
        element: <ProtectedRoute><DashboardPage /></ProtectedRoute>,
      },
      {
        path: "/repositories/:repoId",
        element: <ProtectedRoute><RepositoryPage /></ProtectedRoute>,
      },
      {
        path: "/design-system",
        element: <DesignSystemPage />,
      }
    ]
  }
]);
