import React, { useState, ChangeEvent } from 'react';
import { authService } from '../services/api';
import { 
  Box, 
  Button, 
  Container, 
  TextField, 
  Typography, 
  Alert, 
  Paper,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/system';

// MaterialUI Grid tiplerinde sorun olduğu için div kullanıp stil veriyoruz
const GridContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}));

const GridItem = styled('div')(({ theme }) => ({
  width: '100%',
}));

const NavContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  marginTop: '8px',
}));

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basit doğrulama
    if (!username || !password) {
      setError('Lütfen kullanıcı adı ve şifre girin.');
      return;
    }

    try {
      setLoading(true);
      // Giriş isteği gönder
      await authService.login(username, password);
      
      // Başarılı giriş sonrası anasayfaya yönlendir
      navigate('/');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        'Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.'
      );
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center">
          Giriş Yap
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <GridContainer>
            <GridItem>
              <TextField
                required
                fullWidth
                id="username"
                label="Kullanıcı Adı"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                disabled={loading}
              />
            </GridItem>
            <GridItem>
              <TextField
                required
                fullWidth
                name="password"
                label="Şifre"
                type="password"
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                disabled={loading}
              />
            </GridItem>
          </GridContainer>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </Button>
          
          <NavContainer>
            <Link href="#" variant="body2" onClick={() => navigate('/register')}>
              Hesabınız yok mu? Kayıt olun
            </Link>
          </NavContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login; 