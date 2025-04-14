import { useGetIdentity } from '@refinedev/core';
import {
  Layout as AntdLayout,
  Typography,
  Avatar,
  Space,
  theme,
  Badge,
} from 'antd';
import React from 'react';
import { BellOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { useToken } = theme;

export const Header: React.FC = () => {
  const { token } = useToken();
  const { data: user } = useGetIdentity<{
    name: string;
    avatar: string;
  }>();

  const headerStyles: React.CSSProperties = {
    background: token.colorBgElevated,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '0px 24px',
    height: '64px',
  };

  return (
    <AntdLayout.Header style={headerStyles}>
      <Space>
        <Badge count={3}>
          <BellOutlined
            style={{
              fontSize: '20px',
              color: token.colorPrimary,
              cursor: 'pointer',
            }}
          />
        </Badge>
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
