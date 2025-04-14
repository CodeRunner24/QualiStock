import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Alert, 
  Paper, 
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { stockItemService, productService } from '../services/api';

interface Product {
  id: number;
  name: string;
  sku: string;
}

interface StockItemFormProps {
  stockItemId?: number;
  onSuccess: () => void;
}

const StockItemForm: React.FC<StockItemFormProps> = ({ stockItemId, onSuccess }) => {
  const [productId, setProductId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [location, setLocation] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [manufacturingDate, setManufacturingDate] = useState<Date | null>(null);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Ürünleri yükle
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productService.getAll();
        setProducts(data);
      } catch (err: any) {
        setError('Ürünler yüklenirken bir hata oluştu.');
        console.error(err);
      }
    };

    fetchProducts();
  }, []);

  // Düzenleme modunda stok öğesini yükle
  useEffect(() => {
    if (stockItemId) {
      setIsEdit(true);
      const fetchStockItem = async () => {
        try {
          setLoading(true);
          const stockItem = await stockItemService.getById(stockItemId);
          setProductId(stockItem.product_id);
          setQuantity(stockItem.quantity);
          setLocation(stockItem.location);
          setBatchNumber(stockItem.batch_number);
          setManufacturingDate(stockItem.manufacturing_date ? new Date(stockItem.manufacturing_date) : null);
          setExpirationDate(stockItem.expiration_date ? new Date(stockItem.expiration_date) : null);
          setLoading(false);
        } catch (err: any) {
          setError('Stok bilgileri yüklenirken bir hata oluştu.');
          setLoading(false);
          console.error(err);
        }
      };

      fetchStockItem();
    }
  }, [stockItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basit doğrulama
    if (productId === '' || quantity === '' || !location || !batchNumber) {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const stockItemData = {
        product_id: productId,
        quantity,
        location,
        batch_number: batchNumber,
        manufacturing_date: manufacturingDate,
        expiration_date: expirationDate
      };

      if (isEdit && stockItemId) {
        await stockItemService.update(stockItemId, stockItemData);
      } else {
        await stockItemService.create(stockItemData);
      }
      
      setSuccess(true);
      setLoading(false);
      
      // Başarı durumunda callback'i çağır
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      );
      setLoading(false);
    }
  };

  const handleProductChange = (event: SelectChangeEvent) => {
    setProductId(Number(event.target.value));
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container component="main" maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          <Typography component="h1" variant="h5" align="center">
            {isEdit ? 'Stok Kaydını Düzenle' : 'Yeni Stok Ekle'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              {isEdit ? 'Stok kaydı başarıyla güncellendi!' : 'Stok kaydı başarıyla eklendi!'}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel id="product-label">Ürün</InputLabel>
                  <Select
                    labelId="product-label"
                    id="product"
                    value={productId.toString()}
                    label="Ürün"
                    onChange={handleProductChange}
                    disabled={loading || isEdit} // Düzenleme modunda ürün değiştirilemez
                  >
                    {products.map((product) => (
                      <MenuItem key={product.id} value={product.id.toString()}>
                        {product.name} ({product.sku})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="quantity"
                  label="Miktar"
                  name="quantity"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="location"
                  label="Lokasyon"
                  name="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="batchNumber"
                  label="Parti Numarası"
                  name="batchNumber"
                  value={batchNumber}
                  onChange={(e) => setBatchNumber(e.target.value)}
                  disabled={loading || isEdit} // Düzenleme modunda parti no değiştirilemez
                  helperText={isEdit && "Parti numarası düzenlenemez"}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Üretim Tarihi"
                  value={manufacturingDate}
                  onChange={(newValue) => setManufacturingDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                  disabled={loading}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Son Kullanma Tarihi"
                  value={expirationDate}
                  onChange={(newValue) => setExpirationDate(newValue)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      variant: 'outlined'
                    }
                  }}
                  disabled={loading}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? 'İşleniyor...' : isEdit ? 'Güncelle' : 'Ekle'}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={onSuccess}
              sx={{ mt: 1 }}
              disabled={loading}
            >
              İptal
            </Button>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default StockItemForm; 