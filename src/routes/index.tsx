import {
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';

import { AppLayout } from '@/layouts/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { DietFoodPage } from '@/pages/DietFood';
import { MetricsPage } from '@/pages/MetricasPage'; 
import { ProtectedRoute } from './ProtectRoute';

export function Router() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route
            path="/"
            element={<DashboardPage drawerId="main-drawer" />}
          />

          <Route
            path="/foods"
            element={<DietFoodPage />}
          />

          <Route
            path="/progress"
            element={<MetricsPage drawerId="main-drawer" />}
          />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}
