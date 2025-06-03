import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { styled } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';

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

interface Paste {
  id: string;
  content: string;
  title: string;
  createdAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAABfpP4I26bhLp-Vo';

export default function AdminPanel() {
  const [password, setPassword] = useState('');
  const [pastes, setPastes] = useState<Paste[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPaste, setSelectedPaste] = useState<Paste | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [hasQueried, setHasQueried] = useState(false);
  const [token, setToken] = useState('');
  const turnstileRef = useRef<any>(null);

  const fetchPastes = async () => {
    if (!token) {
      setError('请完成验证码验证');
      return;
    }
    setLoading(true);
    setHasQueried(true);
    try {
      const response = await fetch(`${API_URL}/api/pastes`, {
        headers: {
          'Authorization': `Bearer ${password}`,
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

      const data = await response.json() as Paste[];
      setPastes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '发生错误');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}/${id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
  };

  const handlePreview = (paste: Paste) => {
    setSelectedPaste(paste);
    setShowPreview(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteAll = () => {
    setDeleteTarget('all');
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!token) {
      setError('请完成验证码验证');
      return;
    }
    try {
      const url = deleteTarget === 'all'
        ? `${API_URL}/api/pastes`
        : `${API_URL}/api/paste/${deleteTarget}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${password}`,
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

      // 刷新列表
      await fetchPastes();
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
    } finally {
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  return (
    <StyledContainer maxWidth={false} disableGutters>
      <StyledPaper elevation={3}>
        <Typography variant="h4" gutterBottom>
          所有 Paste
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            label="管理员密码"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            margin="normal"
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
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={fetchPastes}
              disabled={loading || !password || !token}
            >
              {loading ? '加载中...' : '查看所有 Paste'}
            </Button>
            {pastes.length > 0 && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleDeleteAll}
                disabled={loading || !token}
              >
                删除所有 Paste
              </Button>
            )}
          </Box>
        </Box>

        {pastes.length > 0 ? (
          <List>
            {pastes.map((paste) => (
              <ListItem
                key={paste.id}
                divider
                sx={{ alignItems: 'flex-start' }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={paste.title}
                      >
                        {paste.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, ml: 1, flexShrink: 0 }}>
                        <IconButton onClick={() => handleCopyLink(paste.id)}>
                          <CopyIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(paste.id)} color="error" disabled={!token}>
                          <DeleteIcon />
                        </IconButton>
                        <Button variant="outlined" size="small" onClick={() => handlePreview(paste)}>
                          预览
                        </Button>
                      </Box>
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="caption" display="block">
                        创建于: {new Date(paste.createdAt).toLocaleString()}
                      </Typography>
                      <Typography
                        component="span"
                        variant="body2"
                        sx={{
                          mt: 1,
                          maxHeight: '100px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {paste.content}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        ) : (
          hasQueried && !loading && (
            <Typography color="text.secondary" align="center" sx={{ my: 4 }}>
              当前无 Paste
            </Typography>
          )
        )}

        <Button
          component={Link}
          to="/"
          variant="contained"
          sx={{ mt: 2 }}
        >
          返回首页
        </Button>
      </StyledPaper>

      <Dialog
        open={showPreview}
        onClose={() => setShowPreview(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{selectedPaste?.title}</DialogTitle>
        <DialogContent>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            创建于: {selectedPaste && new Date(selectedPaste.createdAt).toLocaleString()}
          </Typography>
          <StyledPre>
            {selectedPaste?.content}
          </StyledPre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreview(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
      >
        <DialogTitle>
          {deleteTarget === 'all' ? '删除所有 Paste' : '删除 Paste'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget === 'all'
              ? '确定要删除所有 Paste 吗？此操作不可恢复。'
              : '确定要删除这个 Paste 吗？此操作不可恢复。'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)}>取消</Button>
          <Button onClick={confirmDelete} color="error" variant="contained" disabled={!token}>
            删除
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={copySuccess}
        autoHideDuration={2000}
        onClose={() => setCopySuccess(false)}
      >
        <Alert severity="success" onClose={() => setCopySuccess(false)}>
          链接已复制到剪贴板
        </Alert>
      </Snackbar>
    </StyledContainer>
  );
} 