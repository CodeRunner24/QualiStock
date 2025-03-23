import {
  AuthBindings,
  Authenticated,
  GitHubBanner,
  Refine,
} from '@refinedev/core';
import { DevtoolsPanel, DevtoolsProvider } from '@refinedev/devtools';
import { RefineKbar, RefineKbarProvider } from '@refinedev/kbar';

import {
  ErrorComponent,
  ThemedLayoutV2,
  ThemedSiderV2,
  useNotificationProvider,
} from '@refinedev/antd';
import '@refinedev/antd/dist/reset.css';

import { useAuth0 } from '@auth0/auth0-react';
import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import dataProvider from '@refinedev/simple-rest';
import { App as AntdApp } from 'antd';
import axios from 'axios';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router';
import { Header } from './components/header';
import { ColorModeContextProvider } from './contexts/color-mode';
import { QualityAlertProvider } from './contexts/quality-alert';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { QualityControl } from './pages/quality';
import { StockManagement } from './pages/stock';
import { ExpirationTracking } from './pages/expiration';
import { Forecasting } from './pages/forecasting';

function App() {
  const { isLoading, user, logout, getIdTokenClaims } = useAuth0();

  if (isLoading) {
    return <span>loading...</span>;
  }

  const authProvider: AuthBindings = {
    login: async () => {
      return {
        success: true,
      };
    },
    logout: async () => {
      logout({ returnTo: window.location.origin });
      return {
        success: true,
      };
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      // Geçici olarak hep authenticated döndür
      return {
        authenticated: true,
      };

      // try {
      //   const token = await getIdTokenClaims();
      //   if (token) {
      //     axios.defaults.headers.common = {
      //       Authorization: `Bearer ${token.__raw}`,
      //     };
      //     return {
      //       authenticated: true,
      //     };
      //   } else {
      //     return {
      //       authenticated: false,
      //       error: {
      //         message: 'Check failed',
      //         name: 'Token not found',
      //       },
      //       redirectTo: '/login',
      //       logout: true,
      //     };
      //   }
      // } catch (error: any) {
      //   return {
      //     authenticated: false,
      //     error: new Error(error),
      //     redirectTo: '/login',
      //     logout: true,
      //   };
      // }
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      if (user) {
        return {
          ...user,
          avatar: user.picture,
        };
      }
      return null;
    },
  };

  return (
    <BrowserRouter>
      <GitHubBanner />
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <QualityAlertProvider>
            <AntdApp>
              <DevtoolsProvider>
                <Refine
                  dataProvider={dataProvider('http://localhost:8000')}
                  notificationProvider={useNotificationProvider}
                  routerProvider={routerBindings}
                  authProvider={authProvider}
                  resources={[
                    {
                      name: 'dashboard',
                      list: '/dashboard',
                      meta: {
                        label: 'Dashboard',
                        icon: 'dashboard',
                      },
                    },
                    {
                      name: 'stock',
                      list: '/stock',
                      meta: {
                        label: 'Stock Management',
                        icon: 'database',
                      },
                    },
                    {
                      name: 'quality',
                      list: '/quality',
                      meta: {
                        label: 'Quality Control',
                        icon: 'safety-certificate',
                      },
                    },
                    {
                      name: 'expiration',
                      list: '/expiration',
                      meta: {
                        label: 'Expiration Tracking',
                        icon: 'calendar',
                      },
                    },
                    {
                      name: 'forecasting',
                      list: '/forecasting',
                      meta: {
                        label: 'Forecasting',
                        icon: 'line-chart',
                      },
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: 'GUHAjt-6Jff9A-K2FjgT',
                  }}
                >
                  <Routes>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-inner"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <ThemedLayoutV2
                            Header={Header}
                            Sider={(props) => (
                              <ThemedSiderV2 {...props} fixed />
                            )}
                          >
                            <Outlet />
                          </ThemedLayoutV2>
                        </Authenticated>
                      }
                    >
                      <Route
                        index
                        element={<NavigateToResource resource="dashboard" />}
                      />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/stock" element={<StockManagement />} />
                      <Route path="/quality" element={<QualityControl />} />
                      <Route
                        path="/expiration"
                        element={<ExpirationTracking />}
                      />
                      <Route path="/forecasting" element={<Forecasting />} />

                      <Route path="*" element={<ErrorComponent />} />
                    </Route>
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-outer"
                          fallback={<Outlet />}
                        >
                          <NavigateToResource />
                        </Authenticated>
                      }
                    >
                      <Route path="/login" element={<Login />} />
                    </Route>
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </AntdApp>
          </QualityAlertProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;
