import { useLogin } from '@refinedev/core';
import { ThemedTitleV2 } from '@refinedev/antd';
import {
  Button,
  Layout,
  Typography,
  Form,
  Input,
  Card,
  Alert,
  Tabs,
  message,
} from 'antd';
import { useState } from 'react';
import { setAuthToken, authService, userService } from '../services/api';

type LoginFormValues = {
  username: string;
  password: string;
};

type SignupFormValues = {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
};

export const Login: React.FC = () => {
  const { mutate: login, isLoading, error } = useLogin();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('login');
  const [form] = Form.useForm();
  const [tokenForm] = Form.useForm();
  const [isSignupLoading, setIsSignupLoading] = useState(false);

  const handleLogin = (values: LoginFormValues) => {
    // Use the Refine login hook which is connected to the authProvider
    login(values, {
      onSuccess: () => {
        setLoginError(null);
      },
      onError: (error) => {
        console.error('Login error:', error);
        setLoginError(
          error?.message || 
          'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.'
        );
      },
    });
  };

  const handleSignup = async (values: SignupFormValues) => {
    if (values.password !== values.confirmPassword) {
      message.error('Şifreler eşleşmiyor!');
      return;
    }

    try {
      setIsSignupLoading(true);
      // Use the userService for registration
      await userService.register({
        username: values.username,
        email: values.email,
        password: values.password,
        is_active: true,
        is_admin: false
      });

      message.success('Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
      setActiveTab('login');
      form.resetFields();
    } catch (error: any) {
      console.error('Registration error:', error);
      message.error(error?.response?.data?.detail || 'Kayıt sırasında bir hata oluştu!');
    } finally {
      setIsSignupLoading(false);
    }
  };

  const handleTokenLogin = (values: { token: string }) => {
    try {
      if (values.token) {
        // Save token to localStorage
        localStorage.setItem('qualistock_token', values.token);
        
        message.success(
          'Token başarıyla ayarlandı. Anasayfaya yönlendiriliyorsunuz...'
        );
        
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      } else {
        message.error('Geçersiz token. Lütfen doğru bir token giriniz.');
      }
    } catch (error) {
      console.error('Token login error:', error);
      message.error('Token ile giriş yapılırken bir hata oluştu.');
    }
  };

  return (
    <Layout
      style={{
        height: '100vh',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Card
        title={
          <ThemedTitleV2
            collapsed={false}
            wrapperStyles={{
              fontSize: '22px',
              marginBottom: '16px',
              marginTop: '8px',
            }}
          />
        }
        style={{ width: 430 }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'login',
              label: 'Giriş Yap',
              children: (
                <Form
                  layout="vertical"
                  requiredMark={false}
                  initialValues={{ username: 'admin', password: '123456' }}
                  onFinish={handleLogin}
                  form={form}
                >
                  <Form.Item
                    label="Kullanıcı Adı veya E-posta"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: 'Lütfen kullanıcı adınızı girin!',
                      },
                    ]}
                  >
                    <Input
                      placeholder="Kullanıcı adı veya e-posta girin"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Şifre"
                    name="password"
                    rules={[
                      { required: true, message: 'Lütfen şifrenizi girin!' },
                    ]}
                  >
                    <Input.Password placeholder="Şifre girin" size="large" />
                  </Form.Item>

                  {loginError && (
                    <Alert
                      message="Giriş Hatası"
                      description={loginError}
                      type="error"
                      showIcon
                      style={{ marginBottom: 16 }}
                    />
                  )}

                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={isLoading}
                      block
                    >
                      Giriş Yap
                    </Button>
                  </Form.Item>

                  <Typography.Text
                    type="secondary"
                    style={{ display: 'block', textAlign: 'center' }}
                  >
                    <small>Varsayılan kullanıcı: admin / 123456</small>
                  </Typography.Text>
                </Form>
              ),
            },
            {
              key: 'signup',
              label: 'Kayıt Ol',
              children: (
                <Form
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleSignup}
                >
                  <Form.Item
                    label="E-posta"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: 'Lütfen e-posta adresinizi girin!',
                      },
                      {
                        type: 'email',
                        message: 'Lütfen geçerli bir e-posta adresi girin!',
                      },
                    ]}
                  >
                    <Input
                      placeholder="E-posta adresinizi girin"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Kullanıcı Adı"
                    name="username"
                    rules={[
                      {
                        required: true,
                        message: 'Lütfen kullanıcı adı girin!',
                      },
                      {
                        min: 4,
                        message: 'Kullanıcı adı en az 4 karakter olmalıdır!',
                      },
                    ]}
                  >
                    <Input placeholder="Kullanıcı adı girin" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Şifre"
                    name="password"
                    rules={[
                      { required: true, message: 'Lütfen şifre girin!' },
                      { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' },
                    ]}
                  >
                    <Input.Password placeholder="Şifre girin" size="large" />
                  </Form.Item>

                  <Form.Item
                    label="Şifre Tekrar"
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      {
                        required: true,
                        message: 'Lütfen şifrenizi tekrar girin!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error('İki şifre birbiriyle eşleşmiyor!')
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      placeholder="Şifrenizi tekrar girin"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      htmlType="submit"
                      loading={isSignupLoading}
                      block
                    >
                      Kayıt Ol
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'token',
              label: 'Token Girişi',
              children: (
                <Form
                  layout="vertical"
                  requiredMark={false}
                  onFinish={handleTokenLogin}
                  form={tokenForm}
                >
                  <Form.Item
                    label="Token"
                    name="token"
                    rules={[
                      {
                        required: true,
                        message: 'Lütfen bir token girin!',
                      },
                    ]}
                  >
                    <Input.Password
                      placeholder="JWT token girin"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button type="primary" size="large" htmlType="submit" block>
                      Token ile Giriş Yap
                    </Button>
                  </Form.Item>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </Layout>
  );
};
