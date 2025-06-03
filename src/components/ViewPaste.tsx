import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

const API_URL = import.meta.env.VITE_API_URL || '';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABfpP4I26bhLp-Vo';

interface Paste {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

const StyledContainer = styled(Container)({
  width: '100%',
  maxWidth: 600,
  margin: '0 auto',
  padding: '0 16px',
  boxSizing: 'border-box',
  overflowX: 'hidden',
  '@media (min-width: 600px)': {
    padding: '0 32px',
  },
});

const StyledPaper = styled(Paper)({
  padding: '16px',
  width: '100%',
  boxSizing: 'border-box',
  overflowX: 'hidden',
  '@media (min-width: 600px)': {
    padding: '32px',
  },
});

const StyledPre = styled('pre')({
  marginTop: 16,
  padding: 16,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
  borderRadius: 4,
  overflow: 'auto',
  wordBreak: 'break-all',
  whiteSpace: 'pre-wrap',
  maxWidth: '100%',
});

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
      <StyledContainer>
        <StyledPaper elevation={3} sx={{ textAlign: 'center' }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button component={Link} to="/" variant="contained">
            返回首页
          </Button>
        </StyledPaper>
      </StyledContainer>
    );
  }

  if (!paste) {
    return (
      <StyledContainer>
        <StyledPaper elevation={3} sx={{ textAlign: 'center' }}>
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
        </StyledPaper>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom>
          {paste.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          创建于: {new Date(paste.createdAt).toLocaleString()}
        </Typography>
        <StyledPre>
          {paste.content}
        </StyledPre>
        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{ mt: 2 }}
        >
          创建新的 Paste
        </Button>
      </StyledPaper>
    </StyledContainer>
  );
} 