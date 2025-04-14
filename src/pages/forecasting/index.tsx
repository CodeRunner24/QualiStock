import React, { useState } from 'react';
import {
  Typography,
  Card,
  Space,
  Row,
  Col,
  Button,
  Select,
  DatePicker,
  Table,
  Progress,
  Tabs,
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FilterOutlined,
  ExportOutlined,
  SyncOutlined,
  RiseOutlined,
  FallOutlined,
  MinusOutlined,
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { TabPane } = Tabs;

export const Forecasting: React.FC = () => {
  // States for demo
  const [activeTab, setActiveTab] = useState('demand');
  const [timeRange, setTimeRange] = useState('30days');

  // Stats data
  const statsData = [
    {
      title: 'Forecasted Turnover',
      value: '$148.5k',
      icon: <LineChartOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      change: '+12.5%',
      period: 'next 30 days',
    },
    {
      title: 'Forecasted Volume',
      value: '2,845',
      icon: <BarChartOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      change: '+8.2%',
      period: 'next 30 days',
    },
    {
      title: 'Accuracy Rate',
      value: '94.7%',
      icon: <RiseOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      change: '+1.3%',
      period: 'vs. last month',
    },
  ];

  // Forecasting table columns
  const demandColumns = [
    {
      title: 'PRODUCT CATEGORY',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'CURRENT STOCK',
      dataIndex: 'currentStock',
      key: 'currentStock',
    },
    {
      title: 'FORECASTED DEMAND',
      dataIndex: 'forecastedDemand',
      key: 'forecastedDemand',
    },
    {
      title: 'RECOMMENDED ACTION',
      dataIndex: 'action',
      key: 'action',
      render: (text: string) => {
        const color = text.includes('Order')
          ? 'blue'
          : text.includes('Monitor')
          ? 'orange'
          : 'green';
        return <span style={{ color }}>{text}</span>;
      },
    },
    {
      title: 'CONFIDENCE',
      dataIndex: 'confidence',
      key: 'confidence',
      render: (value: number) => (
        <Progress
          percent={value}
          size="small"
          status={value > 80 ? 'success' : value > 60 ? 'normal' : 'exception'}
          strokeColor={
            value > 80 ? '#52c41a' : value > 60 ? '#faad14' : '#ff4d4f'
          }
        />
      ),
    },
  ];

  // Demand forecasting data
  const demandData = [
    {
      key: '1',
      category: 'Dairy Products',
      currentStock: 245,
      forecastedDemand: '320 units',
      action: 'Order 75 more units',
      confidence: 92,
    },
    {
      key: '2',
      category: 'Fresh Produce',
      currentStock: 520,
      forecastedDemand: '620 units',
      action: 'Order 100 more units',
      confidence: 88,
    },
    {
      key: '3',
      category: 'Bakery',
      currentStock: 180,
      forecastedDemand: '165 units',
      action: 'Sufficient stock',
      confidence: 95,
    },
    {
      key: '4',
      category: 'Meat & Poultry',
      currentStock: 110,
      forecastedDemand: '150 units',
      action: 'Order 40 more units',
      confidence: 85,
    },
    {
      key: '5',
      category: 'Frozen Foods',
      currentStock: 280,
      forecastedDemand: '240 units',
      action: 'Monitor excess 40 units',
      confidence: 76,
    },
  ];

  // Trend data
  const trendData = [
    {
      key: '1',
      category: 'Organic Products',
      trend: 'Increasing',
      growthRate: '+18.5%',
      impact: 'High',
      recommendation: 'Increase inventory by 20%',
    },
    {
      key: '2',
      category: 'Plant-Based Alternatives',
      trend: 'Increasing',
      growthRate: '+22.3%',
      impact: 'High',
      recommendation: 'Diversify product range',
    },
    {
      key: '3',
      category: 'Gluten-Free Products',
      trend: 'Stable',
      growthRate: '+4.2%',
      impact: 'Medium',
      recommendation: 'Maintain current levels',
    },
    {
      key: '4',
      category: 'Canned Goods',
      trend: 'Decreasing',
      growthRate: '-8.7%',
      impact: 'Medium',
      recommendation: 'Reduce inventory by 10%',
    },
    {
      key: '5',
      category: 'Ready-to-Eat Meals',
      trend: 'Increasing',
      growthRate: '+15.2%',
      impact: 'Medium',
      recommendation: 'Increase inventory by 15%',
    },
  ];

  const trendColumns = [
    {
      title: 'PRODUCT CATEGORY',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'TREND',
      dataIndex: 'trend',
      key: 'trend',
      render: (text: string) => {
        let color = 'blue';
        let icon = <RiseOutlined />;

        if (text === 'Decreasing') {
          color = 'red';
          icon = <FallOutlined />;
        } else if (text === 'Stable') {
          color = 'orange';
          icon = <MinusOutlined />;
        }

        return (
          <Space>
            {icon}
            <span style={{ color }}>{text}</span>
          </Space>
        );
      },
    },
    {
      title: 'GROWTH RATE',
      dataIndex: 'growthRate',
      key: 'growthRate',
      render: (text: string) => {
        const isPositive = text.includes('+');
        return (
          <span style={{ color: isPositive ? '#52c41a' : '#ff4d4f' }}>
            {text}
          </span>
        );
      },
    },
    {
      title: 'IMPACT',
      dataIndex: 'impact',
      key: 'impact',
    },
    {
      title: 'RECOMMENDATION',
      dataIndex: 'recommendation',
      key: 'recommendation',
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={2}>Forecasting</Title>
          </Col>
          <Col>
            <Button icon={<SyncOutlined />}>Update Forecasts</Button>
          </Col>
        </Row>
      </div>

      {/* Stats Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={8} key={index}>
            <Card bordered={false} bodyStyle={{ padding: '20px' }}>
              <Space direction="vertical" size={0}>
                <Space align="center">
                  {stat.icon}
                  <Text type="secondary">{stat.title}</Text>
                </Space>
                <Title level={2} style={{ margin: '8px 0 0 0' }}>
                  {stat.value}
                </Title>
                <Text type="success">
                  {stat.change} <Text type="secondary">({stat.period})</Text>
                </Text>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Filters and controls */}
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col>
            <Space>
              <Text strong>Time Range:</Text>
              <Select
                value={timeRange}
                style={{ width: 120 }}
                onChange={(value) => setTimeRange(value as string)}
              >
                <Option value="7days">Next 7 days</Option>
                <Option value="30days">Next 30 days</Option>
                <Option value="90days">Next 90 days</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text strong>Date Range:</Text>
              <RangePicker />
            </Space>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Button icon={<ExportOutlined />}>Export Forecast</Button>
          </Col>
        </Row>
      </div>

      {/* Tabs for different forecast views */}
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
          <TabPane tab="Demand Forecast" key="demand">
            <Paragraph style={{ marginBottom: 16 }}>
              Projected inventory needs based on historical sales data, seasonal
              patterns, and market trends.
            </Paragraph>
            <Table
              columns={demandColumns}
              dataSource={demandData}
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Market Trends" key="trends">
            <Paragraph style={{ marginBottom: 16 }}>
              Emerging market trends affecting inventory requirements and
              consumer demand patterns.
            </Paragraph>
            <Table
              columns={trendColumns}
              dataSource={trendData}
              pagination={false}
            />
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Forecasting;
