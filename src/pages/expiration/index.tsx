import React, { useState } from 'react';
import {
  Typography,
  Card,
  Space,
  Row,
  Col,
  Table,
  Tag,
  Button,
  Select,
  Alert,
  Dropdown,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;

// Custom BoxOutlined icon
const BoxIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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

export const ExpirationTracking: React.FC = () => {
  // Stats data
  const statsData = [
    {
      title: 'Total Expiring Items',
      value: 105,
      icon: <BoxIcon style={{ color: '#1890ff', fontSize: 24 }} />,
    },
    {
      title: 'Critical (< 48 hours)',
      value: 36,
      icon: <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
    },
    {
      title: 'This Week',
      value: 69,
      icon: <CalendarOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
    },
  ];

  // Filter states
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');

  // Table columns
  const columns = [
    {
      title: 'ITEM NAME',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'QUANTITY',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'EXPIRATION DATE',
      dataIndex: 'expirationDate',
      key: 'expirationDate',
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      key: 'status',
      render: (text: string) => {
        let color = 'green';
        if (text.includes('2 days')) {
          color = 'red';
        } else if (text.includes('3 days')) {
          color = 'orange';
        } else if (text.includes('5 days')) {
          color = 'gold';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  // Table data
  const data = [
    {
      key: '1',
      name: 'Organic Milk',
      category: 'Dairy',
      quantity: 24,
      location: 'Cold Storage A',
      expirationDate: '2024-11-25',
      status: '5 days left',
    },
    {
      key: '2',
      name: 'Fresh Vegetables',
      category: 'Produce',
      quantity: 45,
      location: 'Section B2',
      expirationDate: '2024-11-23',
      status: '3 days left',
    },
    {
      key: '3',
      name: 'Yogurt Cups',
      category: 'Dairy',
      quantity: 36,
      location: 'Cold Storage B',
      expirationDate: '2024-11-22',
      status: '2 days left',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Expiration Tracking</Title>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={8} key={index}>
            <Card
              bordered={false}
              bodyStyle={{ padding: '20px', backgroundColor: '#f9f9f9' }}
            >
              <Space direction="vertical" size={0}>
                <Space align="center">
                  {stat.icon}
                  <Text type="secondary">{stat.title}</Text>
                </Space>
                <Title level={2} style={{ margin: '8px 0 0 0' }}>
                  {stat.value}
                </Title>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters */}
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center' }}>
        <Space>
          <FilterOutlined />
          <Text strong>Filter by:</Text>
        </Space>
        <div style={{ marginLeft: 16 }}>
          <Select
            value={timeFilter}
            style={{ width: 150, marginRight: 16 }}
            onChange={(value) => setTimeFilter(value)}
          >
            <Option value="Today">Today</Option>
            <Option value="This Week">This Week</Option>
            <Option value="This Month">This Month</Option>
          </Select>
          <Select
            value={categoryFilter}
            style={{ width: 150 }}
            onChange={(value) => setCategoryFilter(value)}
          >
            <Option value="All Categories">All Categories</Option>
            <Option value="Dairy">Dairy</Option>
            <Option value="Produce">Produce</Option>
            <Option value="Bakery">Bakery</Option>
            <Option value="Meat">Meat</Option>
          </Select>
        </div>
      </div>

      {/* Alert for critical items */}
      <Alert
        message="Critical Expiration Alert"
        description="36 items will expire within 48 hours. Immediate action required."
        type="error"
        icon={<ExclamationCircleOutlined />}
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Expiring Items Table */}
      <Card
        title="Expiring Items"
        bordered={false}
        className="table-card"
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={data}
          pagination={false}
          className="custom-table"
        />
      </Card>
    </div>
  );
};

export default ExpirationTracking;
