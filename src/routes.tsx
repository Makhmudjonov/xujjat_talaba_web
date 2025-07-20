// src/routes.ts
import AccountPage from './pages/AccountPage';
import Dashboard from './pages/Dashboard';
import HujjatYuborish from './pages/Punkt';
import ApplicationFormWrapper from './pages/ApplicationFormWrapper';
import TestList from './pages/questionList';
import TestSessionPage from './pages/TestSessionPage';

const routes = [
  { path: '/', element: <Dashboard /> },
  { path: '/stats', element: <Dashboard /> },
  { path: '/account', element: <AccountPage /> },
  { path: '/hujjat', element: <HujjatYuborish /> },
  { path: '/tests', element: <TestList /> },
  { path: "/test/start", element: <TestSessionPage />},
  {
    path: '/student/application-form/:applicationTypeId',
    element: <ApplicationFormWrapper />,
  },
];

export default routes;
