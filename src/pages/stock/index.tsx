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
  Input,
  Select,
  Statistic,
  Modal,
  Form,
  InputNumber,
  message,
  DatePicker,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  BarChartOutlined,
  InboxOutlined,
  ReloadOutlined,
  ExportOutlined,
  HeartFilled,
  HeartOutlined,
  EditOutlined,
  DeleteOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import {
  categoryService,
  productService,
  stockItemService,
  authService,
  setAuthToken,
} from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

// Type definitions
interface Category {
  id: number;
  name: string;
  description?: string;
}

interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  category_id: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

interface StockItem {
  id: number;
  product_id: number;
  quantity: number;
  location: string;
  batch_number: string;
  manufacturing_date?: string;
  expiration_date?: string;
  created_at: string;
  updated_at: string;
}

// Table data type
interface ProductTableData {
  key: string;
  id: number;
  name: string;
  sku: string;
  category: string;
  categoryId: number;
  stock: number;
  location: string;
  unitPrice: string;
  stockItemId?: number;
}

// Predefined categories for fallback
const PREDEFINED_CATEGORIES = [
  { name: 'Beverages', description: 'Drinks and liquids' },
  { name: 'Dairy', description: 'Milk and dairy products' },
  { name: 'Bakery', description: 'Bread and baked goods' },
  { name: 'Fruits', description: 'Fresh fruits' },
  { name: 'Vegetables', description: 'Fresh vegetables' },
  { name: 'Meat', description: 'Meat products' },
  { name: 'Seafood', description: 'Fish and seafood' },
  { name: 'Frozen Foods', description: 'Frozen items' },
  { name: 'Canned Goods', description: 'Canned and jarred items' },
  { name: 'Dry Goods', description: 'Pasta, rice, cereals' },
];

export const StockManagement: React.FC = () => {
  // State definitions
  const [categoryFilter, setCategoryFilter] =
    useState<string>('All Categories');
  const [locationFilter, setLocationFilter] = useState<string>('All Locations');
  const [loading, setLoading] = useState<boolean>(false);
  const [tableData, setTableData] = useState<ProductTableData[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStockItems: 0,
    stockValue: 0,
  });

  // Modal and Form states
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isAddCategoryModalVisible, setIsAddCategoryModalVisible] =
    useState<boolean>(false);
  const [addProductForm] = Form.useForm();
  const [addStockForm] = Form.useForm();
  const [addCategoryForm] = Form.useForm();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [newProductId, setNewProductId] = useState<number | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  // Monitor location field changes
  const [locationValue, setLocationValue] = useState<string>('');

  // Handle location change
  const handleLocationChange = (value: string) => {
    setLocationValue(value);
    if (value === 'new') {
      addStockForm.setFieldsValue({ location: 'new' });
    }
  };

  // Function to retry API requests with a delay
  const retryRequest = async (
    requestFn: () => Promise<any>,
    maxRetries = 1,
    delay = 1000
  ) => {
    let retries = 0;

    while (retries <= maxRetries) {
      try {
        return await requestFn();
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          throw error;
        }
        console.warn(`Request failed, retrying (${retries}/${maxRetries})...`);
        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  };

  // Token kontrolü
  const checkAndPromptForToken = () => {
    const isAuthenticated = authService.isAuthenticated();

    if (!isAuthenticated) {
      const token = prompt(
        'API token gerekli. Lütfen token giriniz (Swagger UI /docs sayfasından alabilirsiniz):'
      );

      if (token) {
        if (setAuthToken(token)) {
          message.success('Token başarıyla ayarlandı. Sayfa yenileniyor...');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
          return true;
        } else {
          message.error('Geçersiz token formatı');
          return false;
        }
      } else {
        message.warning(
          'Token gerekli. API istekleri yetkilendirilmemiş olarak çalışacak.'
        );
        return false;
      }
    }

    return true;
  };

  // Load data
  const loadData = async () => {
    setLoading(true);
    try {
      // API istekleri için token kontrolü yap
      checkAndPromptForToken();

      console.log('Stock sayfası veri yükleme başladı');
      // Load categories
      let categoriesData = [];
      try {
        console.log('Kategoriler yükleniyor...');
        categoriesData = await retryRequest(() => categoryService.getAll());
        console.log('Categories data loaded:', categoriesData);
        setCategories(categoriesData);
      } catch (categoryError) {
        console.error('Error loading categories:', categoryError);
        // API hatası, ancak 401 hatası için özel işlem yapmıyoruz - API interceptor bunu hallediyor
        message.warning('Could not load categories. Using default categories.');
        // Fallback to predefined categories
        categoriesData = PREDEFINED_CATEGORIES.map((cat, index) => ({
          id: index + 1,
          name: cat.name,
          description: cat.description,
        }));
        setCategories(categoriesData);
      }

      // Load products
      let productsData = [];
      try {
        console.log('Ürünler yükleniyor...');
        productsData = await retryRequest(() => productService.getAll());
        console.log('Products data loaded:', productsData);
      } catch (productError) {
        console.error('Error loading products:', productError);
        // API hatası, ancak 401 hatası için özel işlem yapmıyoruz - API interceptor bunu hallediyor
        message.warning('Could not load products. Using sample data.');
        // Use mock product data
        productsData = [
          {
            id: 1,
            name: 'Apple',
            sku: 'FRT-001',
            description: 'Fresh red apple',
            category_id: 4, // Fruits
            unit_price: 1.99,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            name: 'Milk',
            sku: 'DRY-001',
            description: 'Fresh dairy milk',
            category_id: 2, // Dairy
            unit_price: 2.49,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
      }

      // Load stock items
      let stockItemsData = [];
      try {
        console.log('Stok öğeleri yükleniyor...');
        stockItemsData = await retryRequest(() => stockItemService.getAll());
        console.log('Stock items data loaded:', stockItemsData);

        // Extract unique locations
        const uniqueLocations = Array.from(
          new Set(stockItemsData.map((item: StockItem) => item.location))
        ).filter(Boolean) as string[];
        setLocations(uniqueLocations);
      } catch (stockError) {
        console.error('Error loading stock items:', stockError);
        // API hatası, ancak 401 hatası için özel işlem yapmıyoruz - API interceptor bunu hallediyor
        message.warning('Could not load stock items. Using sample data.');
        // Use mock stock data
        stockItemsData = [
          {
            id: 1,
            product_id: 1,
            quantity: 100,
            location: 'Warehouse A',
            batch_number: 'BATCH-001',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 2,
            product_id: 2,
            quantity: 50,
            location: 'Cold Storage',
            batch_number: 'BATCH-002',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];
        setLocations(['Warehouse A', 'Cold Storage']);
      }

      // Process the data
      try {
        // Tablo verilerini hazırlamak için 3 farklı yaklaşım deneyeceğiz
        let formattedTableData = [];

        // 1. Ürünlere dayalı bir tablo oluştur, içinde stok bilgileri de olsun
        if (productsData.length > 0) {
          console.log('Processing data based on products...');

          // Tüm ürünler için tablo satırları oluştur, stok bilgisi olmasa bile
          formattedTableData = productsData.map((product: Product) => {
            // Bu ürün için tüm stok öğelerini bul
            const productStockItems = stockItemsData.filter(
              (item: StockItem) => item.product_id === product.id
            );

            // Bu ürün için toplam stok miktarını hesapla
            const totalQuantity = productStockItems.reduce(
              (sum: number, item: StockItem) => sum + (item.quantity || 0),
              0
            );

            // İlk stok öğesi bilgilerini al (varsa)
            const firstStockItem =
              productStockItems.length > 0 ? productStockItems[0] : null;

            // Bu ürünün kategorisini bul
            const category = categoriesData.find(
              (c: Category) => c.id === product.category_id
            );

            return {
              key: `product-${product.id}`,
              id: product.id,
              name: product.name,
              sku: product.sku,
              category: category?.name || 'Uncategorized',
              categoryId: product.category_id,
              stock: totalQuantity,
              location: firstStockItem?.location || 'Not in stock',
              unitPrice: `$${product.unit_price.toFixed(2)}`,
              stockItemId: firstStockItem?.id,
            };
          });
        }
        // 2. Stok öğelerine göre tablo oluştur, ürün bilgisi ekleyerek
        else if (stockItemsData.length > 0) {
          console.log('Processing data based on stock items...');

          formattedTableData = stockItemsData.map((stockItem: StockItem) => {
            const product = productsData.find(
              (p: Product) => p.id === stockItem.product_id
            );

            const category =
              product &&
              categoriesData.find(
                (c: Category) => c.id === product.category_id
              );

            return {
              key: `stock-${stockItem.id}`,
              id: product?.id || 0,
              name: product?.name || 'Unknown Product',
              sku: product?.sku || 'UNKNOWN',
              category: category?.name || 'Uncategorized',
              categoryId: product?.category_id || 0,
              stock: stockItem.quantity || 0,
              location: stockItem.location || 'Unknown',
              unitPrice: product
                ? `$${product.unit_price.toFixed(2)}`
                : '$0.00',
              stockItemId: stockItem.id,
            };
          });
        }

        console.log('Formatted table data:', formattedTableData);
        setTableData(formattedTableData);

        // Calculate statistics
        let totalStockValue = 0;
        let totalStockCount = 0;
        const categoryData: Record<string, number> = {};

        formattedTableData.forEach(
          (item: {
            quantity: number;
            product?: { unit_price: number; category_id?: number | null };
          }) => {
            const quantity = item.quantity || 0;
            const unitPrice = item.product?.unit_price || 0;
            const categoryId = item.product?.category_id;

            totalStockCount += quantity;
            totalStockValue += quantity * unitPrice;

            // Group by category for pie chart
            if (categoryId) {
              const category = categoriesData.find(
                (c: Category) => c.id === categoryId
              );
              const categoryName = category?.name || 'Uncategorized';
              categoryData[categoryName] =
                (categoryData[categoryName] || 0) + quantity;
            } else {
              categoryData['Uncategorized'] =
                (categoryData['Uncategorized'] || 0) + quantity;
            }
          }
        );

        const categoryChartData = Object.entries(categoryData).map(
          ([name, value]) => ({
            name,
            value,
          })
        );

        setStats({
          totalProducts: productsData.length,
          lowStockItems: formattedTableData.filter(
            (item: { quantity: number }) => item.quantity < 10
          ).length,
          stockValue: totalStockValue,
        });
      } catch (processError) {
        console.error('Error processing data:', processError);
        message.error(
          'Error processing stock data. Some information may be incomplete.'
        );
        // Set safe default values
        setTableData([]);
        setStats({
          totalProducts: 0,
          lowStockItems: 0,
          stockValue: 0,
        });
      }
    } catch (error) {
      console.error('Error in loadData:', error);
      message.error('Failed to load stock management data.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent redirection
  useEffect(() => {
    const handleNavigation = (event: any) => {
      // Sadece gerçek bir beforeunload event'i olduğunda çalış
      if (
        event.type === 'beforeunload' &&
        window.location.pathname === '/stock'
      ) {
        // Kullanıcı sayfadan ayrılmaya çalışıyorsa, normal davranışı engelleme
        // Ancak sayfayı değiştirme girişimleri için engelleme yapma
        console.log('Sayfadan ayrılma önlendi');
        event.preventDefault();
        event.returnValue = ''; // Bu, tarayıcının standart bir dialog göstermesini sağlar
        return false;
      }
    };

    // Tarayıcı yenileme veya sayfa değiştirme için event listener
    window.addEventListener('beforeunload', handleNavigation);

    return () => {
      window.removeEventListener('beforeunload', handleNavigation);
    };
  }, [loading]);

  // Load data when page is loaded
  useEffect(() => {
    loadData();
  }, []);

  // Show add product modal
  const showAddProductModal = () => {
    setIsAddModalVisible(true);
    setCurrentStep(0);
    addProductForm.resetFields();
    addStockForm.resetFields();
  };

  // Show add category modal
  const showAddCategoryModal = () => {
    setIsAddCategoryModalVisible(true);
    addCategoryForm.resetFields();
  };

  // Close modals
  const handleCancel = () => {
    setIsAddModalVisible(false);
    setCurrentStep(0);
    setNewProductId(null);
  };

  const handleCategoryCancel = () => {
    setIsAddCategoryModalVisible(false);
  };

  // Create category
  const handleCreateCategory = async (values: any) => {
    try {
      setLoading(true);
      const categoryData = {
        name: values.name,
        description: values.description || '',
      };

      await categoryService.create(categoryData);
      message.success('Category created successfully!');
      handleCategoryCancel();
      loadData(); // Refresh data
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('An error occurred while creating the category.');
    } finally {
      setLoading(false);
    }
  };

  // Create product
  const handleCreateProduct = async (values: any) => {
    if (values.category_id === 'add_new') {
      showAddCategoryModal();
      return;
    }

    try {
      setLoading(true);

      let categoryId = values.category_id;

      // Eğer önceden tanımlanmış bir kategori seçildiyse
      if (
        typeof categoryId === 'string' &&
        categoryId.startsWith('predefined-')
      ) {
        const index = parseInt(categoryId.split('-')[1]);
        const selectedCategory = PREDEFINED_CATEGORIES[index];

        // Yeni kategori oluştur
        try {
          const categoryData = {
            name: selectedCategory.name,
            description: selectedCategory.description || '',
          };

          const categoryResponse = await categoryService.create(categoryData);
          categoryId = categoryResponse.id; // Yeni kategorinin ID'sini kullan
        } catch (error) {
          console.error('Error creating predefined category:', error);
          message.error('Failed to create the category. Please try again.');
          setLoading(false);
          return;
        }
      }

      // Kategori ID'sinin sayısal değer olduğundan emin olalım
      const numericCategoryId = Number(categoryId);

      if (isNaN(numericCategoryId)) {
        message.error('Invalid category ID. Please select a valid category.');
        setLoading(false);
        return;
      }

      const productData = {
        name: values.name,
        sku: values.sku,
        description: values.description || '',
        category_id: numericCategoryId,
        unit_price: Number(values.unit_price),
      };

      console.log('Sending product data to API:', productData);

      const response = await productService.create(productData);
      console.log('Product creation response:', response);

      if (response && response.id) {
        setNewProductId(response.id);
        message.success('Product created successfully!');
        setCurrentStep(1); // Move to stock addition step
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error creating product:', error);
      message.error('An error occurred while creating the product.');
    } finally {
      setLoading(false);
    }
  };

  // Add stock item
  const handleAddStock = async (values: any) => {
    if (!newProductId) {
      message.error('Product ID not found. Please try again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating stock item...');

      // Eğer kullanıcı "Add New Location" seçtiyse
      let location = values.location;
      if (location === 'new' && values.newLocation) {
        location = values.newLocation;
      }

      // Gerekli verilerin doğru formatta olduğundan emin ol
      const stockData = {
        product_id: Number(newProductId),
        quantity: Number(values.quantity),
        location: location,
        batch_number: values.batch_number,
        manufacturing_date: values.manufacturing_date
          ? values.manufacturing_date.toISOString()
          : undefined,
        expiration_date: values.expiration_date
          ? values.expiration_date.toISOString()
          : undefined,
      };

      console.log('Sending stock item data to API:', stockData);

      // Token kontrolü ve CORS sorunu için baştan token kontrolü yap
      if (!authService.isAuthenticated()) {
        message.warning('Authentication token required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await stockItemService.create(stockData);
      console.log('Stock item created successfully:', response);

      message.success('Stock item added successfully!');
      handleCancel(); // Close modal

      // Verileri yeniden yükle, yeni eklenen stok öğesini görmek için
      // Biraz gecikme ekleyerek backend'in güncellemesine izin ver
      setTimeout(() => {
        loadData();

        // Son kullanma tarihi varsa ve yönlendirme yapmak istiyorsak
        if (values.expiration_date) {
          message.info(
            'Son kullanma tarihli ürün eklendi. Expiration sayfasında görüntülenebilir.'
          );

          // Kullanıcıyı expiration sayfasına yönlendirmek için bir buton göster
          Modal.confirm({
            title: 'Expiration Takip',
            content:
              'Son kullanma tarihli yeni ürün eklendi. Expiration sayfasına gitmek ister misiniz?',
            okText: 'Evet, Git',
            cancelText: 'Hayır',
            onOk: () => {
              window.location.href = '/expiration';
            },
          });
        }
      }, 500);
    } catch (error: any) {
      console.error('Error adding stock:', error);

      // CORS hatası için özel mesaj göster
      if (error.toString().includes('CORS')) {
        message.error(
          'CORS error: Backend server might be unavailable or misconfigured.'
        );
      } else {
        // Genel hata mesajı
        message.error('An error occurred while adding the stock item.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: 'PRODUCT NAME',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: ProductTableData, b: ProductTableData) =>
        a.name.localeCompare(b.name),
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
    },
    {
      title: 'CATEGORY',
      dataIndex: 'category',
      key: 'category',
      filters: categories.map((cat) => ({ text: cat.name, value: cat.name })),
      onFilter: (value: any, record: ProductTableData) =>
        record.category === value,
    },
    {
      title: 'IN STOCK',
      dataIndex: 'stock',
      key: 'stock',
      sorter: (a: ProductTableData, b: ProductTableData) => a.stock - b.stock,
      render: (text: number, record: ProductTableData) => {
        let color = 'green';
        if (record.stock < 10) {
          color = 'red';
        } else if (record.stock < 20) {
          color = 'orange';
        }
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'LOCATION',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'UNIT PRICE',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      sorter: (a: ProductTableData, b: ProductTableData) => {
        const priceA = parseFloat(a.unitPrice.replace('$', ''));
        const priceB = parseFloat(b.unitPrice.replace('$', ''));
        return priceA - priceB;
      },
      render: (text: string) => (
        <span style={{ fontWeight: 'bold' }}>{text}</span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      render: (_: any, record: ProductTableData) => (
        <Space>
          <Button type="text" size="small">
            Edit
          </Button>
          <Button type="text" size="small">
            Details
          </Button>
        </Space>
      ),
    },
  ];

  // Search function
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  // Filtered data
  const filteredData = tableData.filter((item) => {
    const matchesSearch = searchText
      ? item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase())
      : true;

    const matchesCategory =
      categoryFilter === 'All Categories' || item.category === categoryFilter;

    const matchesLocation =
      locationFilter === 'All Locations' || item.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  // Statistics data
  const statsData = [
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: <InboxOutlined style={{ color: '#1890ff', fontSize: 24 }} />,
      changePercent: 0, // Change percentage can be updated with real data
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockItems,
      icon: <BarChartOutlined style={{ color: '#faad14', fontSize: 24 }} />,
      changePercent: 0,
    },
    {
      title: 'Stock Value',
      value: `$${stats.stockValue.toFixed(2)}`,
      icon: <BarChartOutlined style={{ color: '#52c41a', fontSize: 24 }} />,
      changePercent: 0,
    },
  ];

  // Step content for forms
  const steps = [
    {
      title: 'Add Product',
      content: (
        <Form
          form={addProductForm}
          layout="vertical"
          onFinish={handleCreateProduct}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[{ required: true, message: 'Please enter product name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="sku"
            label="SKU (Stock Code)"
            rules={[{ required: true, message: 'Please enter SKU!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Category"
            rules={[{ required: true, message: 'Please select a category!' }]}
          >
            <Select>
              {categories.length > 0
                ? categories.map((category) => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))
                : PREDEFINED_CATEGORIES.map((category, index) => (
                    <Option
                      key={`predefined-${index}`}
                      value={`predefined-${index}`}
                    >
                      {category.name}
                    </Option>
                  ))}
              <Option value="add_new">+ Add New Category</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="unit_price"
            label="Unit Price"
            rules={[{ required: true, message: 'Please enter unit price!' }]}
          >
            <InputNumber
              min={0}
              precision={2}
              style={{ width: '100%' }}
              formatter={(value) =>
                `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
              }
              parser={(value: any) => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Product and Continue
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Add Stock',
      content: (
        <Form form={addStockForm} layout="vertical" onFinish={handleAddStock}>
          <Form.Item
            name="quantity"
            label="Quantity"
            rules={[{ required: true, message: 'Please enter quantity!' }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="location"
            label="Location"
            rules={[{ required: true, message: 'Please enter location!' }]}
          >
            <Select onChange={handleLocationChange}>
              {locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
              <Option value="new">+ Add New Location</Option>
            </Select>
          </Form.Item>

          {locationValue === 'new' && (
            <Form.Item
              name="newLocation"
              label="New Location Name"
              rules={[
                { required: true, message: 'Please enter new location name!' },
              ]}
            >
              <Input placeholder="Enter new location name" />
            </Form.Item>
          )}

          <Form.Item
            name="batch_number"
            label="Batch Number"
            rules={[{ required: true, message: 'Please enter batch number!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item name="manufacturing_date" label="Manufacturing Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="expiration_date" label="Expiration Date">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Add Stock and Complete
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Title level={2}>Stock Management</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              style={{ backgroundColor: '#1890ff' }}
              onClick={showAddProductModal}
            >
              Add New Product
            </Button>
          </Col>
        </Row>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {statsData.map((stat, index) => (
          <Col span={8} key={index}>
            <Card bordered={false} bodyStyle={{ padding: '20px' }}>
              <Space direction="vertical" size={0}>
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
                    {stat.changePercent !== 0 && (
                      <Tag
                        color={stat.changePercent > 0 ? 'success' : 'error'}
                        style={{ margin: 0 }}
                      >
                        {stat.changePercent > 0 ? '+' : ''}
                        {stat.changePercent}%
                      </Tag>
                    )}
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
          <Col span={8}>
            <Search
              placeholder="Search products..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>
          <Col span={4}>
            <Select
              value={categoryFilter}
              style={{ width: '100%' }}
              onChange={(value) => setCategoryFilter(value)}
            >
              <Option value="All Categories">All Categories</Option>
              {categories.map((category) => (
                <Option key={category.id} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={4}>
            <Select
              value={locationFilter}
              style={{ width: '100%' }}
              onChange={(value) => setLocationFilter(value)}
            >
              <Option value="All Locations">All Locations</Option>
              {locations.map((location) => (
                <Option key={location} value={location}>
                  {location}
                </Option>
              ))}
            </Select>
          </Col>
          <Col flex="auto" style={{ textAlign: 'right' }}>
            <Space>
              <Button icon={<ReloadOutlined />} onClick={loadData}>
                Refresh
              </Button>
              <Button icon={<ExportOutlined />}>Export</Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Products Table */}
      <Card
        title={
          <Space size="middle">
            <span>Products</span>
            <Tag color="blue">{filteredData.length} items</Tag>
          </Space>
        }
        bordered={false}
        className="table-card"
        style={{ marginBottom: 16 }}
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          className="custom-table"
          loading={loading}
        />
      </Card>

      {/* Add Product Modal */}
      <Modal
        title={steps[currentStep].title}
        visible={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        {steps[currentStep].content}
      </Modal>

      {/* Add Category Modal */}
      <Modal
        title="Add New Category"
        visible={isAddCategoryModalVisible}
        onCancel={handleCategoryCancel}
        footer={null}
        width={600}
      >
        <Form
          form={addCategoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please enter category name!' }]}
          >
            <Select>
              {PREDEFINED_CATEGORIES.map((category, index) => (
                <Option key={index} value={category.name}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Create Category
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StockManagement;
