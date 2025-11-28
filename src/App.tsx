import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from './state/authStore';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminWorks } from './pages/admin/AdminWorks';
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { MarketingNewWork } from './pages/marketing/MarketingNewWork';
import { WriterDashboard } from './pages/writer/WriterDashboard';

const RequireAuth = ({ children, roles }: { children: JSX.Element; roles?: string[] }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" replace />;

  return children;
};

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <RequireAuth roles={['ADMIN']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="works" element={<AdminWorks />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/marketing/*"
        element={
          <RequireAuth roles={['MARKETING']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<MarketingDashboard />} />
                <Route path="work/new" element={<MarketingNewWork />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/writer/*"
        element={
          <RequireAuth roles={['WRITER']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<WriterDashboard />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
              </Routes>
            </Layout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}
