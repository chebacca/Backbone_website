import { createTheme, ThemeOptions } from '@mui/material/styles';
import { ThemeMode } from '@/context/ThemeContext';

// Define custom color palette
const colors = {
  // Primary colors (Blue gradient inspired by Dashboard v14)
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
    main: '#00d4ff',
    dark: '#0099cc',
    light: '#33ddff',
    contrastText: '#000000',
  },
  
  // Secondary colors (Purple accent)
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
    main: '#764ba2',
    dark: '#512e70',
    light: '#9575cd',
    contrastText: '#ffffff',
  },
  
  // Dark theme colors
  darkBackground: {
    default: '#0a0a0a',
    paper: '#1a1a2e',
    elevated: '#16213e',
  },
  
  // Light theme colors
  lightBackground: {
    default: '#fafafa',
    paper: '#ffffff',
    elevated: '#f5f5f5',
  },
  
  // Dark text colors
  darkText: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  
  // Light text colors
  lightText: {
    primary: '#212121',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  
  // Success, error, warning, info
  success: {
    main: '#4caf50',
    dark: '#388e3c',
    light: '#81c784',
  },
  
  error: {
    main: '#f44336',
    dark: '#d32f2f',
    light: '#ef5350',
  },
  
  warning: {
    main: '#ff9800',
    dark: '#f57c00',
    light: '#ffb74d',
  },
  
  info: {
    main: '#2196f3',
    dark: '#1976d2',
    light: '#64b5f6',
  },
};

// Define typography
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  
  h1: {
    fontSize: '3.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  
  h2: {
    fontSize: '2.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  
  h3: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  
  h5: {
    fontSize: '1.25rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  
  h6: {
    fontSize: '1.125rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  
  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    textTransform: 'none' as const,
    letterSpacing: '0.02em',
  },
  
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  overline: {
    fontSize: '0.75rem',
    fontWeight: 500,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
  },
};

// Define component overrides
const components = {
  // Button overrides
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        padding: '12px 24px',
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none' as const,
        boxShadow: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
          transform: 'translateY(-1px)',
        },
      },
      containedPrimary: {
        background: 'linear-gradient(135deg, #00d4ff 0%, #667eea 100%)',
        color: '#000000',
        '&:hover': {
          background: 'linear-gradient(135deg, #33ddff 0%, #7b8eed 100%)',
        },
      },
      outlinedPrimary: {
        borderColor: colors.primary.main,
        color: colors.primary.main,
        '&:hover': {
          borderColor: colors.primary.light,
          backgroundColor: 'rgba(0, 212, 255, 0.1)',
        },
      },
    },
  },
  
  // Card overrides
  MuiCard: {
    styleOverrides: {
      root: {
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
        borderRadius: 0,
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        transition: 'all 0.3s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
        },
      },
    },
  },
  
  // Paper overrides
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: 'background.paper',
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      },
      elevation2: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      },
      elevation3: {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  
  // AppBar overrides
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(26, 26, 46, 0.95)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  
  // TextField overrides
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.2)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.3)',
          },
          '&.Mui-focused fieldset': {
            borderColor: colors.primary.main,
            borderWidth: 2,
          },
        },
        '& .MuiInputLabel-root': {
          color: 'rgba(255, 255, 255, 0.7)',
          '&.Mui-focused': {
            color: colors.primary.main,
          },
        },
      },
    },
  },
  
  // Chip overrides
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontWeight: 500,
      },
      colorPrimary: {
        backgroundColor: 'rgba(0, 212, 255, 0.2)',
        color: colors.primary.main,
      },
    },
  },
  
  // Dialog overrides
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        backgroundColor: 'background.paper',
      },
    },
  },
  
  // Menu overrides
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        backgroundColor: 'background.elevated',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
      },
    },
  },
  
  // List overrides
  MuiListItem: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        margin: '2px 0',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
        },
      },
    },
  },
  
  // Tab overrides
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none' as const,
        fontWeight: 500,
        fontSize: '0.875rem',
        minHeight: 48,
      },
    },
  },
  
};

// Create theme function that accepts mode
export const createAppTheme = (mode: ThemeMode) => {
  const isDark = mode === 'dark';
  
  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      background: isDark ? colors.darkBackground : colors.lightBackground,
      text: isDark ? colors.darkText : colors.lightText,
      success: colors.success,
      error: colors.error,
      warning: colors.warning,
      info: colors.info,
    },
    typography,
    components: {
      ...components,
      // Override components for light mode
      MuiButton: {
        ...components.MuiButton,
        styleOverrides: {
          ...components.MuiButton?.styleOverrides,
          root: {
            ...components.MuiButton?.styleOverrides?.root,
            // Adjust button colors for light mode
            ...(isDark ? {} : {
              '&.MuiButton-contained': {
                backgroundColor: colors.primary.main,
                color: colors.primary.contrastText,
                '&:hover': {
                  backgroundColor: colors.primary.dark,
                },
              },
              '&.MuiButton-outlined': {
                borderColor: colors.primary.main,
                color: colors.primary.main,
                '&:hover': {
                  backgroundColor: `${colors.primary.main}10`,
                },
              },
            }),
          },
        },
      },
      MuiAppBar: {
        ...components.MuiAppBar,
        styleOverrides: {
          ...components.MuiAppBar?.styleOverrides,
          root: {
            ...components.MuiAppBar?.styleOverrides?.root,
            backgroundColor: isDark ? colors.darkBackground.paper : colors.lightBackground.paper,
            color: isDark ? colors.darkText.primary : colors.lightText.primary,
          },
        },
      },
      MuiPaper: {
        ...components.MuiPaper,
        styleOverrides: {
          ...components.MuiPaper?.styleOverrides,
          root: {
            ...components.MuiPaper?.styleOverrides?.root,
            backgroundColor: isDark ? colors.darkBackground.paper : colors.lightBackground.paper,
            color: isDark ? colors.darkText.primary : colors.lightText.primary,
          },
        },
      },
      MuiCard: {
        ...components.MuiCard,
        styleOverrides: {
          ...components.MuiCard?.styleOverrides,
          root: {
            ...components.MuiCard?.styleOverrides?.root,
            backgroundColor: isDark ? colors.darkBackground.paper : colors.lightBackground.paper,
            color: isDark ? colors.darkText.primary : colors.lightText.primary,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiChip: {
        ...components.MuiChip,
        styleOverrides: {
          ...components.MuiChip?.styleOverrides,
          root: {
            ...components.MuiChip?.styleOverrides?.root,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
            color: isDark ? colors.darkText.primary : colors.lightText.primary,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiTypography: {
        styleOverrides: {
          root: {
            color: isDark ? colors.darkText.primary : colors.lightText.primary,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    shape: {
      borderRadius: 0,
    },
    spacing: 8,
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
      },
    },
    shadows: isDark ? [
      'none',
      '0 2px 8px rgba(0, 0, 0, 0.2)',
      '0 4px 12px rgba(0, 0, 0, 0.3)',
      '0 6px 16px rgba(0, 0, 0, 0.4)',
      '0 8px 20px rgba(0, 0, 0, 0.5)',
      '0 10px 24px rgba(0, 0, 0, 0.6)',
      '0 12px 28px rgba(0, 0, 0, 0.7)',
      '0 14px 32px rgba(0, 0, 0, 0.8)',
      '0 16px 36px rgba(0, 0, 0, 0.9)',
      '0 18px 40px rgba(0, 0, 0, 1)',
      '0 20px 44px rgba(0, 0, 0, 1)',
      '0 22px 48px rgba(0, 0, 0, 1)',
      '0 24px 52px rgba(0, 0, 0, 1)',
      '0 26px 56px rgba(0, 0, 0, 1)',
      '0 28px 60px rgba(0, 0, 0, 1)',
      '0 30px 64px rgba(0, 0, 0, 1)',
      '0 32px 68px rgba(0, 0, 0, 1)',
      '0 34px 72px rgba(0, 0, 0, 1)',
      '0 36px 76px rgba(0, 0, 0, 1)',
      '0 38px 80px rgba(0, 0, 0, 1)',
      '0 40px 84px rgba(0, 0, 0, 1)',
      '0 42px 88px rgba(0, 0, 0, 1)',
      '0 44px 92px rgba(0, 0, 0, 1)',
      '0 46px 96px rgba(0, 0, 0, 1)',
      '0 48px 100px rgba(0, 0, 0, 1)',
    ] : [
      'none',
      '0 2px 4px rgba(0, 0, 0, 0.1)',
      '0 4px 8px rgba(0, 0, 0, 0.12)',
      '0 6px 12px rgba(0, 0, 0, 0.14)',
      '0 8px 16px rgba(0, 0, 0, 0.16)',
      '0 10px 20px rgba(0, 0, 0, 0.18)',
      '0 12px 24px rgba(0, 0, 0, 0.20)',
      '0 14px 28px rgba(0, 0, 0, 0.22)',
      '0 16px 32px rgba(0, 0, 0, 0.24)',
      '0 18px 36px rgba(0, 0, 0, 0.26)',
      '0 20px 40px rgba(0, 0, 0, 0.28)',
      '0 22px 44px rgba(0, 0, 0, 0.30)',
      '0 24px 48px rgba(0, 0, 0, 0.32)',
      '0 26px 52px rgba(0, 0, 0, 0.34)',
      '0 28px 56px rgba(0, 0, 0, 0.36)',
      '0 30px 60px rgba(0, 0, 0, 0.38)',
      '0 32px 64px rgba(0, 0, 0, 0.40)',
      '0 34px 68px rgba(0, 0, 0, 0.42)',
      '0 36px 72px rgba(0, 0, 0, 0.44)',
      '0 38px 76px rgba(0, 0, 0, 0.46)',
      '0 40px 80px rgba(0, 0, 0, 0.48)',
      '0 42px 84px rgba(0, 0, 0, 0.50)',
      '0 44px 88px rgba(0, 0, 0, 0.52)',
      '0 46px 92px rgba(0, 0, 0, 0.54)',
      '0 48px 96px rgba(0, 0, 0, 0.56)',
    ],
  };

  return createTheme(themeOptions);
};

// Default theme (dark mode for backward compatibility)
export const theme = createAppTheme('dark');

// Export color palette for use in components
export { colors };
