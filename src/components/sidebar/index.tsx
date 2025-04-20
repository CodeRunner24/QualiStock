import React from 'react';
import { Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import {
  DashboardOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  CalendarOutlined,
  LineChartOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

export const Sidebar: React.FC = () => {
  const items = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/dashboard">Dashboard</Link>,
    },
    {
      key: 'stock',
      icon: <DatabaseOutlined />,
      label: <Link to="/stock">Stock Management</Link>,
    },
    {
      key: 'quality',
      icon: <SafetyCertificateOutlined />,
      label: <Link to="/quality">Quality Control</Link>,
    },
    {
      key: 'expiration',
      icon: <CalendarOutlined />,
      label: <Link to="/expiration">Expiration Tracking</Link>,
    },
    {
      key: 'forecasting',
      icon: <LineChartOutlined />,
      label: <Link to="/forecasting">Forecasting</Link>,
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Settings</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  return (
    <Sider
      width={240}
      style={{
        backgroundColor: '#fff',
        boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24,
          borderBottom: '1px solid #f0f0f0',
          fontSize: 18,
          fontWeight: 600,
        }}
      >
        <span style={{ marginLeft: 8 }}>Inventory System</span>
      </div>
      <Menu
        mode="inline"
        defaultSelectedKeys={['dashboard']}
        style={{ height: '100%', borderRight: 0 }}
        items={items}
      />
    </Sider>
  );
};
