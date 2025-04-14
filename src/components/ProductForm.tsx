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
  FormHelperText
} from '@mui/material';
import { productService, categoryService } from '../services/api';

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  productId?: number;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ productId, onSuccess }) => {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [unitPrice, setUnitPrice] = useState<number | ''>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // Kategorileri yükle
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAll();
        setCategories(data);
      } catch (err: any) {
        setError('Kategoriler yüklenirken bir hata oluştu.');
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  // Düzenleme modunda ürün bilgilerini yükle
  useEffect(() => {
    if (productId) {
      setIsEdit(true);
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const product = await productService.getById(productId);
          setName(product.name);
          setSku(product.sku);
          setDescription(product.description || '');
          setCategoryId(product.category_id);
          setUnitPrice(product.unit_price);
          setLoading(false);
        } catch (err: any) {
          setError('Ürün bilgileri yüklenirken bir hata oluştu.');
          setLoading(false);
          console.error(err);
        }
      };

      fetchProduct();
    }
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basit doğrulama
    if (!name || !sku || categoryId === '' || unitPrice === '') {
      setError('Lütfen zorunlu alanları doldurun.');
      return;
    }

    try {
      setLoading(true);
      const productData = {
        name,
        sku,
        description,
        category_id: categoryId,
        unit_price: unitPrice
      };

      if (isEdit && productId) {
        await productService.update(productId, productData);
      } else {
        await productService.create(productData);
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

  return (
    <Container component="main" maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography component="h1" variant="h5" align="center">
          {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {isEdit ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!'}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="name"
                label="Ürün Adı"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="sku"
                label="SKU (Stok Kodu)"
                name="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                disabled={loading || isEdit} // Düzenleme modunda SKU değiştirilemez
                helperText={isEdit && "SKU düzenlenemez"}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                label="Açıklama"
                name="description"
                multiline
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Kategori</InputLabel>
                <Select
                  labelId="category-label"
                  id="category"
                  value={categoryId}
                  label="Kategori"
                  onChange={(e) => setCategoryId(Number(e.target.value))}
                  disabled={loading}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {categories.length === 0 && (
                  <FormHelperText error>Henüz kategori bulunmuyor.</FormHelperText>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="unitPrice"
                label="Birim Fiyat"
                name="unitPrice"
                type="number"
                inputProps={{ min: 0, step: 0.01 }}
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : '')}
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
  );
};

export default ProductForm; 