import React, { useState } from 'react';
import {
  Typography,
  Input,
  Button,
  Tabs,
  Card,
  Badge,
  Space,
  Tag,
  Row,
  Col,
  Tooltip,
  DatePicker,
  Dropdown,
} from 'antd';
import {
  SearchOutlined,
  CalendarOutlined,
  FilterOutlined,
  PlusOutlined,
  ExportOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

export const QualityControl: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');

  // Sample inspection data
  const inspections = [
    {
      id: 1,
      name: 'Fresh Strawberries',
      batch: 'BAT-2024-001',
      status: 'pending',
      time: 'Today, 10:30 AM',
      issues: [
        {
          type: 'quality',
          description:
            'Detected soft spots, expected to last only 3 days instead of normal 7 days',
        },
      ],
    },
    {
      id: 2,
      name: 'Apples',
      batch: 'BAT-2024-002',
      status: 'passed',
      time: 'Today, 09:15 AM',
      issues: [
        {
          type: 'quality',
          description: 'Detected minor bruising, expected shelf life 20 days',
        },
      ],
    },
    {
      id: 3,
      name: 'Organic Bananas',
      batch: 'BAT-2024-003',
      status: 'failed',
      time: 'Yesterday, 16:45 PM',
      issues: [
        {
          type: 'quality',
          description:
            'Premature ripening detected, unsuitable for distribution',
        },
      ],
    },
  ];

  // Filter inspections based on active tab
  const filteredInspections = inspections.filter(
    (inspection) => inspection.status === activeTab
  );

  // Dashboard stats
  const dashboardStats = [
    {
      title: 'Inspections Today',
      value: 24,
      icon: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
      change: '+5%',
      changeType: 'increase',
    },
    {
      title: 'Failed Checks',
      value: 3,
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      change: '-2%',
      changeType: 'decrease',
    },
    {
      title: 'Pass Rate',
      value: '96.5%',
      icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      change: '+1.2%',
      changeType: 'increase',
    },
    {
      title: 'Avg. Response Time',
      value: '18m',
      icon: <ClockCircleOutlined style={{ color: '#722ed1' }} />,
      change: '-12%',
      changeType: 'decrease',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={2}>Quality Control</Title>
          </Col>
        </Row>
      </div>

      {/* Dashboard Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {dashboardStats.map((stat, index) => (
          <Col span={6} key={index}>
            <Card bordered={false} bodyStyle={{ padding: '20px' }}>
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space align="center">
                  {stat.icon}
                  <Text type="secondary">{stat.title}</Text>
                </Space>
                <Row align="middle" gutter={8}>
                  <Col>
                    <Title level={2} style={{ margin: '8px 0 0 0' }}>
                      {stat.value}
                    </Title>
                  </Col>
                  <Col>
                    <Tag
                      color={
                        stat.changeType === 'increase' ? 'success' : 'error'
                      }
                      style={{ margin: 0 }}
                    >
                      {stat.change}
                    </Tag>
                  </Col>
                </Row>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Search and filters */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col flex="300px">
            <Input
              placeholder="Search batches..."
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
            />
          </Col>
          <Col>
            <Button icon={<CalendarOutlined />}>Date Range</Button>
          </Col>
          <Col>
            <Button icon={<FilterOutlined />}>Filters</Button>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ backgroundColor: '#4361ee' }}
              >
                New Inspection
              </Button>
              <Button icon={<ExportOutlined />}>Export Report</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ marginBottom: 16, borderBottom: '1px solid #f0f0f0' }}
      >
        <TabPane tab="Pending" key="pending" />
        <TabPane tab="Passed" key="passed" />
        <TabPane tab="Failed" key="failed" />
      </Tabs>

      {/* Inspection cards */}
      {filteredInspections.map((inspection) => (
        <Card
          key={inspection.id}
          style={{ marginBottom: 16 }}
          bodyStyle={{ padding: 0 }}
        >
          <div
            style={{
              padding: '12px 16px',
              backgroundColor:
                inspection.status === 'pending'
                  ? '#23272f'
                  : inspection.status === 'passed'
                  ? '#1e2e22'
                  : '#2a1e1e',
              color:
                inspection.status === 'pending'
                  ? '#faad14'
                  : inspection.status === 'passed'
                  ? '#52c41a'
                  : '#ff4d4f',
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Text strong style={{ color: 'inherit' }}>
              {inspection.status.charAt(0).toUpperCase() +
                inspection.status.slice(1)}
            </Text>
            <Text type="secondary" style={{ color: '#b0b0b0' }}>{inspection.time}</Text>
          </div>
          <div style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 16,
                alignItems: 'flex-start',
              }}
            >
              <div>
                <Title level={4} style={{ margin: 0, marginBottom: 4 }}>
                  {inspection.name}
                </Title>
                <Text type="secondary">Batch: {inspection.batch}</Text>
              </div>
              {inspection.status === 'pending' && (
                <Badge
                  count={
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                  }
                  style={{ backgroundColor: 'transparent' }}
                />
              )}
            </div>

            {inspection.issues.map((issue, idx) => (
              <div key={idx} style={{ marginBottom: 8 }}>
                <Space direction="vertical" size={2}>
                  <Space>
                    <ExclamationCircleOutlined style={{ color: '#fa8c16' }} />
                    <Text strong>Quality Issue</Text>
                  </Space>
                  <Text>{issue.description}</Text>
                </Space>
              </div>
            ))}

            <div
              style={{
                marginTop: 16,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Button type="link" style={{ paddingLeft: 0 }}>
                View Details
              </Button>
              <Space>
                {inspection.status === 'pending' && (
                  <>
                    <Tooltip title="Approve">
                      <Button
                        shape="circle"
                        icon={<CheckCircleOutlined />}
                        style={{ color: '#52c41a' }}
                      />
                    </Tooltip>
                    <Tooltip title="Reject">
                      <Button
                        shape="circle"
                        icon={<CloseCircleOutlined />}
                        style={{ color: '#ff4d4f' }}
                      />
                    </Tooltip>
                  </>
                )}
              </Space>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default QualityControl;
