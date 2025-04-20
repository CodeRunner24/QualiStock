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

import routerBindings, {
  CatchAllNavigate,
  DocumentTitleHandler,
  NavigateToResource,
  UnsavedChangesNotifier,
} from '@refinedev/react-router';
import dataProvider from '@refinedev/simple-rest';
import { App as AntdApp } from 'antd';
import axios from 'axios';
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { ColorModeContextProvider } from './contexts/color-mode';
import { QualityAlertProvider } from './contexts/quality-alert';
import { Login } from './pages/login';
import { Dashboard } from './pages/dashboard';
import { QualityControl } from './pages/quality';
import { StockManagement } from './pages/stock';
import { ExpirationTracking } from './pages/expiration';
import { Forecasting } from './pages/forecasting';

// Basit kullanıcı tipleri
interface User {
  id: number;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  // Sayfa yüklendiğinde oturum kontrolü
  useEffect(() => {
    const storedUser = localStorage.getItem('qualistock_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));

      // Token varsa, API isteklerine ekleme
      const token = localStorage.getItem('qualistock_token');
      if (token) {
        axios.defaults.headers.common = {
          Authorization: `Bearer ${token}`,
        };
      }
    }
  }, []);

  const authProvider: AuthBindings = {
    login: async ({ username, password }) => {
      try {
        // Backend API'ye giriş isteği gönder
        const response = await fetch('http://localhost:8001/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            username: username,
            password: password,
          }),
        });

        // API yanıtını kontrol et
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Login failed:', errorData);
          return {
            success: false,
            error: {
              name: 'Login Failed',
              message:
                errorData.detail || 'Geçersiz kullanıcı adı/e-posta veya şifre',
            },
          };
        }

        const data = await response.json();

        // Token'ı localStorage'a kaydet
        localStorage.setItem('qualistock_token', data.access_token);

        // Kullanıcı bilgilerini al
        const userResponse = await fetch(
          'http://localhost:8001/auth/users/me',
          {
            headers: {
              Authorization: `Bearer ${data.access_token}`,
            },
          }
        );

        if (userResponse.ok) {
          const userData = await userResponse.json();
          localStorage.setItem('qualistock_user', JSON.stringify(userData));
          setUser(userData);
        }

        return {
          success: true,
          redirectTo: '/dashboard',
        };
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          error: {
            name: 'Login Failed',
            message: 'Bağlantı hatası. Lütfen daha sonra tekrar deneyin.',
          },
        };
      }
    },
    logout: async () => {
      // Kullanıcı bilgilerini temizle
      localStorage.removeItem('qualistock_user');
      localStorage.removeItem('qualistock_token');
      setUser(null);

      return {
        success: true,
        redirectTo: '/login',
      };
    },
    onError: async (error) => {
      console.error(error);
      return { error };
    },
    check: async () => {
      // Token var mı kontrol et
      const token = localStorage.getItem('qualistock_token');
      if (token) {
        try {
          // Token geçerli mi kontrol et
          const response = await fetch('http://localhost:8001/auth/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            // Kullanıcı bilgilerini güncelle
            const userData = await response.json();
            localStorage.setItem('qualistock_user', JSON.stringify(userData));
            setUser(userData);

            return {
              authenticated: true,
            };
          }

          // Token geçersizse temizle
          localStorage.removeItem('qualistock_token');
          localStorage.removeItem('qualistock_user');
          setUser(null);
        } catch (error) {
          console.error('Authentication check error:', error);
        }
      }

      return {
        authenticated: false,
        error: {
          message: 'Check failed',
          name: 'Not authenticated',
        },
        redirectTo: '/login',
        logout: true,
      };
    },
    getPermissions: async () => null,
    getIdentity: async () => {
      const token = localStorage.getItem('qualistock_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:8001/auth/users/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error('Get identity error:', error);
        }
      }

      const storedUser = localStorage.getItem('qualistock_user');
      if (storedUser) {
        return JSON.parse(storedUser) as User;
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
                  dataProvider={dataProvider('http://localhost:8001')}
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
