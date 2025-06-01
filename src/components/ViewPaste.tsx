import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress
} from '@mui/material';

const API_URL = import.meta.env.PROD 
  ? 'https://paste.emon100.com'
  : '';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABfpP4I26bhLp-Vo';

interface Paste {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const turnstileRef = useRef<any>(null);

  useEffect(() => {
    if (token) {
      fetchPaste();
    }
  }, [token]);

  const fetchPaste = async () => {
    try {
      const response = await fetch(`${API_URL}/api/paste/${id}`, {
        headers: {
          'CF-Turnstile-Token': token,
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText === '密码错误') {
          setToken('');
          turnstileRef.current?.reset();
        }
        throw new Error(errorText);
      }
      const data = await response.json() as Paste;
      setPaste(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button component={Link} to="/" variant="contained">
            返回首页
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!paste) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography gutterBottom>
            请完成验证码验证以查看内容
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mb: 2 }}>
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setToken}
              onError={() => setToken('')}
              onExpire={() => setToken('')}
            />
            {loading && <CircularProgress size={24} />}
          </Box>
          <Button component={Link} to="/" variant="contained">
            返回首页
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: '100%',
        maxWidth: 600,
        mx: 'auto',
        px: { xs: 1, sm: 2 },
        boxSizing: 'border-box',
        overflowX: 'hidden',
      }}
    >
      <Paper elevation={3} sx={{ p: { xs: 1, sm: 4 }, width: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
        <Typography variant="h4" gutterBottom>
          {paste.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          创建于: {new Date(paste.createdAt).toLocaleString()}
        </Typography>
        <Box
          component="pre"
          sx={{
            mt: 2,
            p: 2,
            bgcolor: 'grey.900',
            borderRadius: 1,
            overflow: 'auto',
            wordBreak: 'break-all',
            whiteSpace: 'pre-wrap',
            maxWidth: '100%',
          }}
        >
          {paste.content}
        </Box>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{ mt: 2 }}
        >
          创建新的 Paste
        </Button>
      </Paper>
    </Container>
  );
} 