import AccountPage from './pages/AccountPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import Arizalar from './pages/admin/Arizalar';
import Dashboard from './pages/Dashboard';
import HujjatYuborish from './pages/Punkt';


const routes = [
  { path: '/', exact: true, element: <Dashboard /> },
  { path: '/account', exact: true, element: <AccountPage /> },
  { path: '/hujjat', exact: true, element: <HujjatYuborish /> },
  { path: '/admin', exact: true, element: <AdminDashboard /> },
  // { path: '/admin/applications', exact: true, element: <Arizalar /> },

];

export default routes;
