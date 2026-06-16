import { createTheme } from '@mui/material/styles';

/**
 * Material Design 3 Theme configuration for the CMS Admin SPA.
 */
export const md3Theme = createTheme({
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: '#0061a4', // MD3 standard dynamic color mapping (mocked here)
          onMain: '#ffffff',
          container: '#d1e4ff',
          onContainer: '#001d36',
        },
        secondary: {
          main: '#535f70',
          onMain: '#ffffff',
          container: '#d7e3f7',
          onContainer: '#101c2b',
        },
        background: {
          default: '#fdfbff',
          paper: '#fdfbff',
        },
        surface: {
          main: '#fdfbff',
          onMain: '#1a1c1e',
        },
      } as any,
    },
    dark: {
      palette: {
        primary: {
          main: '#9eca1ff',
          onMain: '#003258',
          container: '#00497d',
          onContainer: '#d1e4ff',
        },
        background: {
          default: '#1a1c1e',
          paper: '#1a1c1e',
        },
      } as any,
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 500 },
    h2: { fontSize: '2rem', fontWeight: 500 },
    body1: { fontSize: '1rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // MD3 Pill shape
          textTransform: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: 'none',
          backgroundColor: 'var(--mui-palette-surface-main)',
          border: '1px solid var(--mui-palette-secondary-container)',
        },
      },
    },
  },
});
