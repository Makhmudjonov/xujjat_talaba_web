// src/routes.ts
import AccountPage from './pages/AccountPage';
import Dashboard from './pages/Dashboard';
import HujjatYuborish from './pages/Punkt';
import ApplicationFormWrapper from './pages/ApplicationFormWrapper';

const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/hujjat', element: <HujjatYuborish /> },
  {
    path: '/student/application-form/:applicationTypeId',
    element: <ApplicationFormWrapper />,
  },
];

export default routes;
