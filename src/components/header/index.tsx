import React from 'react';
import { useGetIdentity } from '@refinedev/core';
import {
  Layout as AntdLayout,
  Typography,
  Avatar,
  Space,
  theme,
  Badge,
  Dropdown,
  List,
} from 'antd';
import { BellOutlined, ExclamationCircleOutlined, ClockCircleOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons';
import { useQualityAlerts } from '../../contexts/quality-alert';
import { useContext } from 'react';
import { ColorModeContext } from '../../contexts/color-mode';

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC = () => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<{
    name: string;
    avatar: string;
  }>();
  const { alerts, unreadAlertsCount, resolveAlert } = useQualityAlerts();
  const { setMode, mode } = useContext(ColorModeContext);

  const headerStyles: React.CSSProperties = {
    background: token.colorBgElevated,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px 24px',
    height: '64px',
  };

  // Bildirim Dropdown içeriği
  const notificationList = (
    <div style={{ minWidth: 320, maxHeight: 400, overflowY: 'auto', padding: 8 }}>
      <List
        dataSource={alerts}
        locale={{ emptyText: 'No notifications' }}
        renderItem={item => (
          <List.Item
            style={{
              background: !item.resolved ? token.colorBgElevated : '#18191c',
              border: !item.resolved ? `1.5px solid ${token.colorPrimary}` : '1px solid #23272f',
              borderRadius: 8,
              marginBottom: 8,
              color: !item.resolved ? token.colorText : '#b0b0b0',
              boxShadow: !item.resolved ? '0 2px 8px rgba(0,0,0,0.10)' : undefined,
            }}
            actions={[
              !item.resolved && (
                <a key="mark" onClick={() => resolveAlert(item.id)} style={{ fontSize: 12, color: token.colorPrimary }}>
                  Mark as read
                </a>
              ),
            ]}
          >
            <List.Item.Meta
              avatar={
                item.type === 'issue' ? (
                  <ExclamationCircleOutlined style={{ color: '#f5222d', fontSize: 20 }} />
                ) : (
                  <ClockCircleOutlined style={{ color: '#faad14', fontSize: 20 }} />
                )
              }
              title={<span style={{ fontWeight: !item.resolved ? 600 : 400, color: !item.resolved ? '#fff' : '#b0b0b0' }}>{item.title}</span>}
              description={
                <>
                  <div style={{ color: !item.resolved ? '#e0e0e0' : '#b0b0b0' }}>{item.description}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.timestamp.toLocaleString()}</div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </div>
  );

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        {/* Dark/Light Mode Toggle Button */}
        <span
          onClick={() => setMode()}
          style={{
            fontSize: 20,
            cursor: 'pointer',
            color: token.colorPrimary,
            marginRight: 8,
            transition: 'color 0.3s',
          }}
          title={mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          {mode === 'light' ? <SunOutlined /> : <MoonOutlined />}
        </span>
        <Dropdown overlay={notificationList} trigger={["click"]} placement="bottomRight" arrow>
          <Badge count={unreadAlertsCount} overflowCount={99}>
            <BellOutlined
              style={{
                fontSize: '20px',
                color: token.colorPrimary,
                cursor: 'pointer',
              }}
            />
          </Badge>
        </Dropdown>
        <Space size="middle">
          {user?.name && (
            <Text strong style={{ marginRight: '8px' }}>
              {user.name}
            </Text>
          )}
          {user?.avatar && (
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              size="large"
              style={{ cursor: 'pointer' }}
            />
          )}
        </Space>
      </Space>
    </AntdLayout.Header>
  );
};
