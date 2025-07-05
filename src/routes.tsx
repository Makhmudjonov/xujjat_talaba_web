import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Dashboard from './pages/Dashboard';
import HujjatYuborish from './pages/Punkt';
import ApplicationFormWrapper from './pages/ApplicationFormWrapper'; // ✅ wrapper import

const routes = [
  { path: '/', exact: true, element: <Dashboard /> },
  { path: '/account', exact: true, element: <AccountPage /> },
  { path: '/hujjat', exact: true, element: <HujjatYuborish /> },
  { path: '/admin', exact: true, element: <AdminDashboard /> },
  { path: '/student/application-form/:applicationTypeId', exact: true, element: <ApplicationFormWrapper /> }, // ✅ fix
];

export default routes;
