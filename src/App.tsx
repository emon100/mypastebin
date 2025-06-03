import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Suspense, lazy } from 'react';

const CreatePaste = lazy(() => import('./components/CreatePaste'));
const ViewPaste = lazy(() => import('./components/ViewPaste'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<CreatePaste />} />
            <Route path="/:id" element={<ViewPaste />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
}

export default App;
