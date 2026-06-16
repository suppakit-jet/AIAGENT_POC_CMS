
import { useState } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, Typography, Container, Button, Tabs, Tab } from '@mui/material';
import { md3Theme } from './design-system/theme';
import { ContentEditor } from './features/content/pages/ContentEditor';
import { MediaLibrary } from './features/media/pages/MediaLibrary';
import { AuditLog } from './features/audit/pages/AuditLog';
import { Login } from './features/auth/pages/Login';
import { useAuthStore } from './features/auth/store/auth.store';

function App() {
  const { user, logout } = useAuthStore();
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <ThemeProvider theme={md3Theme}>
      <CssBaseline />
      {!user ? (
        <Login />
      ) : (
        <>
          <AppBar position="static" color="primary" elevation={0}>
            <Toolbar>
              <Typography variant="h6" color="inherit" sx={{ flexGrow: 1 }}>
                CMS Admin (Hermes Agent Powered)
              </Typography>
              <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} textColor="inherit" indicatorColor="secondary">
                <Tab label="Content Editor" />
                <Tab label="Media Library" />
                <Tab label="Audit Log" />
              </Tabs>
              <Typography variant="body2" sx={{ ml: 4, mr: 2 }}>{user.email} ({user.role})</Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </Toolbar>
          </AppBar>
          <Container>
            {tabIndex === 0 && <ContentEditor />}
            {tabIndex === 1 && <MediaLibrary />}
            {tabIndex === 2 && <AuditLog />}
          </Container>
        </>
      )}
    </ThemeProvider>
  );
}

export default App;
