import React from 'react';
import { Typography, Card, Row, Col, Space, List, Button } from 'antd';
import {
  LineChartOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

// Custom Box icon
const BoxOutlined: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <span role="img" className="anticon">
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      {...props}
    >
      <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15Z" />
    </svg>
  </span>
);

export const Dashboard: React.FC = () => {
  // Sample quality alerts
  const qualityAlerts = [
    {
      type: 'issue',
      title: 'Quality Issue Detected',
      description:
        'Batch #A123 - Deterioration detected in dairy products section',
      icon: (
        <ExclamationCircleOutlined style={{ fontSize: 24, color: '#f5222d' }} />
      ),
    },
    {
      type: 'expiration',
      title: 'Expiration Alert',
      description: '15 items in produce section expire within 48 hours',
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />,
    },
  ];

  // Quick Actions
  const quickActions = [
    { title: 'Scan New Items', key: 'scan' },
    { title: 'Check Quality', key: 'check' },
    { title: 'View Reports', key: 'reports' },
    { title: 'Manage Alerts', key: 'alerts' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={[16, 16]}>
        {/* Monthly Turnover Card */}
        <Col xs={24} lg={24}>
          <Card bordered={false}>
            <Space align="center">
              <LineChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text type="secondary">Monthly Turnover</Text>
                <Title level={3} style={{ margin: 0 }}>
                  $125.3k
                </Title>
              </div>
            </Space>
            <Text
              type="success"
              style={{ position: 'absolute', right: 24, top: 24 }}
            >
              +3.4%
            </Text>
          </Card>
        </Col>

        {/* Total Stock Items Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Space align="center">
              <BoxOutlined style={{ fontSize: 24, color: '#1890ff' }} />
              <div>
                <Text type="secondary">Total Stock Items</Text>
                <Title level={3} style={{ margin: 0 }}>
                  2,453
                </Title>
              </div>
            </Space>
            <Text
              type="success"
              style={{ position: 'absolute', right: 24, top: 24 }}
            >
              +5.2%
            </Text>
          </Card>
        </Col>

        {/* Quality Alerts Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Space align="center">
              <WarningOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <Text type="secondary">Quality Alerts</Text>
                <Title level={3} style={{ margin: 0 }}>
                  12
                </Title>
              </div>
            </Space>
            <Text
              type="danger"
              style={{ position: 'absolute', right: 24, top: 24 }}
            >
              -2.1%
            </Text>
          </Card>
        </Col>

        {/* Expiring Soon Card */}
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false}>
            <Space align="center">
              <ClockCircleOutlined style={{ fontSize: 24, color: '#faad14' }} />
              <div>
                <Text type="secondary">Expiring Soon</Text>
                <Title level={3} style={{ margin: 0 }}>
                  45
                </Title>
              </div>
            </Space>
            <Text
              type="success"
              style={{ position: 'absolute', right: 24, top: 24 }}
            >
              +1.8%
            </Text>
          </Card>
        </Col>
      </Row>

      {/* Recent Quality Alerts */}
      <Card
        title="Recent Quality Alerts"
        style={{ marginTop: 16 }}
        bordered={false}
      >
        <List
          itemLayout="horizontal"
          dataSource={qualityAlerts}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Quick Actions */}
      <Card title="Quick Actions" style={{ marginTop: 16 }} bordered={false}>
        <List
          itemLayout="horizontal"
          dataSource={quickActions}
          renderItem={(item) => (
            <List.Item actions={[<Button type="link">{'>'}</Button>]}>
              <List.Item.Meta title={item.title} />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
