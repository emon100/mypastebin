import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const API_URL = import.meta.env.VITE_API_URL || '';

interface Paste {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

const StyledContainer = styled(Container)({
  width: '100%',
  maxWidth: '100%',
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
  width: '100%',
  fontSize: '0.875rem',
  lineHeight: 1.5,
});

const HeaderContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: 16,
});

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchPaste();
  }, [id]);

  const fetchPaste = async () => {
    try {
      const response = await fetch(`${API_URL}/api/paste/${id}`);
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const data = await response.json() as Paste;
      setPaste(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (paste) {
      try {
        await navigator.clipboard.writeText(paste.content);
        setCopySuccess(true);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  const handleCloseSnackbar = () => {
    setCopySuccess(false);
  };

  if (error) {
    return (
      <StyledContainer>
        <StyledPaper elevation={3} sx={{ textAlign: 'left' }}>
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

  if (loading) {
    return (
      <StyledContainer>
        <StyledPaper elevation={3} sx={{ textAlign: 'center' }}>
          <CircularProgress />
        </StyledPaper>
      </StyledContainer>
    );
  }

  if (!paste) {
    return (
      <StyledContainer>
        <StyledPaper elevation={3} sx={{ textAlign: 'left' }}>
          <Typography color="error" gutterBottom>
            Paste 不存在
          </Typography>
          <Button component={Link} to="/" variant="contained">
            返回首页
          </Button>
        </StyledPaper>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <StyledPaper elevation={3} sx={{ textAlign: 'left' }}>
        <HeaderContainer>
          <div>
            <Typography variant="h4" gutterBottom>
              {paste.title}
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              创建于: {new Date(paste.createdAt).toLocaleString()}
            </Typography>
          </div>
          <Tooltip title="复制内容">
            <IconButton onClick={handleCopy} color="primary">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
        </HeaderContainer>
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
      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          内容已复制到剪贴板
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
} 