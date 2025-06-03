import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const API_URL = import.meta.env.VITE_API_URL || '';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

interface PasteResponse {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

const StyledContainer = styled(Container)({
  paddingTop: 32,
  paddingBottom: 32,
});

const StyledPaper = styled(Paper)({
  padding: 32,
});

const StyledForm = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const turnstileRef = useRef<any>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('请完成验证码验证');
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/paste`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${password}`,
          'CF-Turnstile-Token': token,
        },
        body: JSON.stringify({ content, title }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText === '密码错误') {
          setToken('');
          turnstileRef.current?.reset();
        }
        throw new Error(errorText);
      }

      const data = await response.json() as PasteResponse;
      navigate(`/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
    }
  };

  return (
    <StyledContainer maxWidth="md">
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom>
          创建新的 Paste
        </Typography>
        <StyledForm onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            multiline
            rows={10}
            required
          />
          <TextField
            fullWidth
            label="管理员密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Box>
            <Turnstile
              ref={turnstileRef}
              siteKey={TURNSTILE_SITE_KEY}
              onSuccess={setToken}
              onError={() => setToken('')}
              onExpire={() => setToken('')}
            />
          </Box>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={!token}
          >
            创建
          </Button>
        </StyledForm>
      </StyledPaper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
} 