import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#286747',
      dark: '#194c34',
      light: '#e7f1e9',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#66816d',
    },
    background: {
      default: '#f4f7f4',
      paper: '#ffffff',
    },
    text: {
      primary: '#203329',
      secondary: '#5f7064',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
});

export default theme;
