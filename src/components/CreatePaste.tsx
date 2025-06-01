import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  Paper,
  Snackbar,
  Alert,
} from '@mui/material';

const API_URL = import.meta.env.PROD 
  ? 'https://paste.emon100.com'
  : '';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABfpP4I26bhLp-Vo';

interface PasteResponse {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          创建新的 Paste
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            margin="normal"
          />
          <TextField
            fullWidth
            label="内容"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            margin="normal"
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
            margin="normal"
            required
          />
          <Box sx={{ mt: 2, mb: 2 }}>
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
            sx={{ mt: 2 }}
            disabled={!token}
          >
            创建
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
} 