import React, { useState, useEffect } from 'react';
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
  message,
} from 'antd';
import {
  ClockCircleOutlined,
  CalendarOutlined,
  FilterOutlined,
  InboxOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { expirationService } from '../../services/api';

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
  // State tanımlamaları
  const [statsData, setStatsData] = useState([
    {
      title: 'Total Expiring Items',
      value: 0,
      icon: <BoxIcon style={{ color: '#1890ff', fontSize: 24 }} />,
    },
    {
      title: 'Critical (< 7 days)',
      value: 0,
      icon: <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />,
    },
    {
      title: 'This Week',
      value: 0,
      icon: <CalendarOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [timeFilter, setTimeFilter] = useState('This Week');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [expiringItems, setExpiringItems] = useState([]);
  const [criticalCount, setCriticalCount] = useState(0);
  const [categories, setCategories] = useState<string[]>([
    'All Categories',
    'Dairy',
    'Produce',
    'Bakery',
    'Meat',
  ]);

  // Verileri yükle
  const loadData = async () => {
    try {
      setLoading(true);

      // İstatistikleri al
      const stats = await expirationService.getStats();

      // Kritik öğeleri al
      const criticalItems = await expirationService.getCriticalItems();

      // Filtreye göre sona eren öğeleri al
      let daysParam = 30; // default
      if (timeFilter === 'Today') daysParam = 1;
      if (timeFilter === 'This Week') daysParam = 7;
      if (timeFilter === 'This Month') daysParam = 30;

      const params: any = { days: daysParam };
      if (categoryFilter !== 'All Categories') {
        // Kategori ID'sini bulmak için daha fazla işlem gerekebilir
        const categoryId = getCategoryIdByName(categoryFilter);
        if (categoryId) params.category_id = categoryId;
      }

      const items = await expirationService.getExpiringItems(params);

      // İstatistikleri güncelle
      setStatsData([
        {
          title: 'Total Expiring Items',
          value: stats.total_expiring || 0,
          icon: <BoxIcon style={{ color: '#1890ff', fontSize: 24 }} />,
        },
        {
          title: 'Critical (< 7 days)',
          value: stats.critical_expiring || 0,
          icon: (
            <ClockCircleOutlined style={{ color: '#ff4d4f', fontSize: 24 }} />
          ),
        },
        {
          title: 'This Week',
          value: stats.this_week_expiring || 0,
          icon: <CalendarOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
        },
      ]);

      // Kategorileri düzenle
      if (criticalItems && criticalItems.length > 0) {
        const uniqueCategories = [
          ...new Set(criticalItems.map((item) => item.category)),
        ];
        setCategories(['All Categories', ...uniqueCategories]);
      }

      // Kritik öğe sayısını belirle
      setCriticalCount(criticalItems ? criticalItems.length : 0);

      // Tabloya eklenecek verileri formatla
      const formattedItems = formatExpiringItems(items || []);
      setExpiringItems(formattedItems);
    } catch (error) {
      console.error('Failed to load expiration data:', error);
      message.error('Verileri yüklerken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri çek
  useEffect(() => {
    loadData();
  }, []);

  // Filtre değiştiğinde verileri güncelle
  useEffect(() => {
    loadData();
  }, [timeFilter, categoryFilter]);

  // Yardımcı fonksiyonlar
  const getCategoryIdByName = (name: string) => {
    // Bu işlev backend'den kategori ID'sini almak için implemente edilmeli
    // Şimdilik null döndürüyoruz
    return null;
  };

  const formatExpiringItems = (items: any[]) => {
    const now = new Date();

    return items.map((item, index) => {
      const expirationDate = new Date(item.expiration_date);
      const daysLeft = Math.ceil(
        (expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        key: item.id || index.toString(),
        name: item.product?.name || 'Unnamed Product',
        category: item.product?.category?.name || 'Uncategorized',
        quantity: item.quantity || 0,
        location: item.location || 'Unknown',
        expirationDate: expirationDate.toLocaleDateString(),
        status: `${daysLeft} days left`,
      };
    });
  };

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
        if (
          text.includes('2 days') ||
          text.includes('1 days') ||
          text.includes('0 days')
        ) {
          color = 'red';
        } else if (text.includes('3 days') || text.includes('4 days')) {
          color = 'orange';
        } else if (
          text.includes('5 days') ||
          text.includes('6 days') ||
          text.includes('7 days')
        ) {
          color = 'gold';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={16} align="middle" style={{ marginBottom: 16 }}>
        <Col flex="auto">
          <Title level={2}>Expiration Tracking</Title>
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Refresh
          </Button>
        </Col>
      </Row>

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
            {categories.map((category) => (
              <Option key={category} value={category}>
                {category}
              </Option>
            ))}
          </Select>
        </div>
      </div>

      {/* Alert for critical items */}
      {criticalCount > 0 && (
        <Alert
          message="Critical Expiration Alert"
          description={`${criticalCount} items will expire within 7 days. Immediate action required.`}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Expiring Items Table */}
      <Card
        title="Expiring Items"
        bordered={false}
        className="table-card"
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={expiringItems}
          pagination={{ pageSize: 10 }}
          className="custom-table"
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default ExpirationTracking;
