import React, { useState } from 'react';
import { userService } from '../services/api';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Alert, 
  Paper, 
  Grid,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDebugInfo(null);

    // Basit doğrulama
    if (!username || !email || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    try {
      setLoading(true);
      console.log('Gönderilen kayıt bilgileri:', { username, email, password });
      
      // API'ye kayıt isteği gönder
      const userData = {
        username,
        email,
        password,
        is_active: true,
        is_admin: false
      };
      
      const response = await userService.register(userData);
      console.log('Kayıt cevabı:', response);
      
      setSuccess(true);
      setDebugInfo(response);
      
      // 2 saniye sonra giriş sayfasına yönlendir
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Kayıt hatası:', err);
      setDebugInfo({
        request: { username, email },
        error: err.response?.data || err.message
      });
      
      setError(
        err.response?.data?.detail || 
        'Kayıt sırasında bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Hesap Oluştur
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Kullanıcı Adı"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="E-posta Adresi"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Şifre"
                type="password"
                id="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || success}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Şifreyi Onayla"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || success}
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
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ mr: 1 }} color="inherit" />
                Kayıt Yapılıyor...
              </>
            ) : (
              'Kayıt Ol'
            )}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 1 }}
            disabled={loading}
          >
            Zaten bir hesabınız var mı? Giriş yapın
          </Button>
        </Box>
        
        {process.env.NODE_ENV === 'development' && debugInfo && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Debug Bilgisi:</Typography>
            <pre style={{ overflow: 'auto', maxHeight: '200px' }}>
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default Register;