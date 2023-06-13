import { ThemeProvider } from '@emotion/react';
import CheckIcon from '@mui/icons-material/Check';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ErrorIcon from '@mui/icons-material/Error';
import MenuIcon from '@mui/icons-material/Menu';
import { Alert, Chip, CircularProgress, Snackbar, Tooltip, useMediaQuery } from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { createTheme, styled } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, Route, MemoryRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import { RootState, useAppDispatch } from './index';
import BulkGenerate from './pages/bulkGenerate';
import Settings from './pages/settings';
import SingleGenerate from './pages/singleGenerate';
import AppStateSlice from './slices/AppStateSlice';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));


export default function App() {
  const appState = useSelector((state: RootState) => state.appState);
  const dispatch = useAppDispatch();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: prefersDarkMode ? 'dark' : 'light',
        },
        // other theme configurations...
      }),
    [prefersDarkMode]
  );

  const [open, setOpen] = useState(false);
  const [appBarTitle, setAppBarTitle] = useState('Single Generate');

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const templateLocation = localStorage.getItem('template-location')
    if (templateLocation !== null) {
      dispatch(AppStateSlice.actions.setTemplateLocation(templateLocation))
    }

    const snipeItUrl = localStorage.getItem('snipeit-url')
    if (snipeItUrl !== null) {
      dispatch(AppStateSlice.actions.setSnipeItUrl(snipeItUrl))
    }

    const snipeItAccessToken = localStorage.getItem('snipeit-access-token')
    if (snipeItAccessToken !== null) {
      dispatch(AppStateSlice.actions.setSnipeItAccessToken(snipeItAccessToken))
    }

    const sslVerification = localStorage.getItem('ssl-verification')
    if (sslVerification !== null) {
      dispatch(AppStateSlice.actions.setSslVerification(sslVerification === 'true'))
    }
  }, [])

  useEffect(() => {
    if (appState.snipeItUrl !== '' && appState.snipeItAccessToken !== '') {
      dispatch(AppStateSlice.actions.setConnectionStatus('connecting'))
      fetch(`${appState.snipeItUrl}/api/v1/users/me`, {
        headers: {
          'Authorization': `Bearer ${appState.snipeItAccessToken}`
        }
      }).then((response) => {
        if (response.status === 200) {
          dispatch(AppStateSlice.actions.setConnectionStatus('connected'))
          dispatch(AppStateSlice.actions.setConnectionError(''))
          return response.json()
        } else {
          dispatch(AppStateSlice.actions.setConnectionStatus('failed'))
          dispatch(AppStateSlice.actions.setConnectionError(`Connection failed with status code ${response.status}`))
        }
      }).then((data) => {
        // not really an error, but the connection error is displayed as the tooltip for the connection status.
        dispatch(AppStateSlice.actions.setConnectionError(`Connected as ${data.first_name} ${data.last_name} on ${appState.snipeItUrl}`))
      }).catch((error) => {
        dispatch(AppStateSlice.actions.setConnectionStatus('failed'))
        dispatch(AppStateSlice.actions.setConnectionError(`Connection failed with error ${error}`))
      })
    } else {
      dispatch(AppStateSlice.actions.setConnectionStatus('disconnected'))
      dispatch(AppStateSlice.actions.setConnectionError('Missing Connection Information'))
    }

  }, [appState.snipeItUrl, appState.snipeItAccessToken, appState.sslVerification])

  return (
    <ThemeProvider theme={theme}>
      <Router>
      <Box sx={{ display: 'flex'}}>
        <CssBaseline />
        <AppBar position="fixed" open={open}>
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={{ mr: 2, ...(open && { display: 'none' }) }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{flexGrow: 1}}>
              {appBarTitle}
            </Typography>
            <Tooltip title={appState.connectionError} arrow>
              <Chip 
              variant='filled'
              color={appState.connectionStatus === 'connected' ? 'success' : appState.connectionStatus === 'failed' ? 'error' : appState.connectionStatus === 'connecting' ? 'warning' : 'error'}
              label={
                appState.connectionStatus === 'connected' ? 'Connected to SnipeIT' : appState.connectionStatus === 'failed' ? 'SnipeIT Connection Failed' : appState.connectionStatus === 'connecting' ? 'Connecting to SnipeIT' : 'SnipeIT Connection Failed'
              }
              icon={
                appState.connectionStatus === 'connected' ? <CheckIcon /> : appState.connectionStatus === 'failed' ? <ErrorIcon /> : appState.connectionStatus === 'connecting' ? <CircularProgress size={20} /> : <ErrorIcon />
              }
              />
            </Tooltip>
            
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            <ListItem key={1} disablePadding>
              <ListItemButton component={Link} to="/" onClick={() => setOpen(false)}>
                <ListItemText primary={"Single Generate"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={2} disablePadding>
              <ListItemButton component={Link} to="/bulk-generate" onClick={() => setOpen(false)} disabled>
                <ListItemText primary={"Bulk Generate (Coming Soon)"} />
              </ListItemButton>
            </ListItem>
            <ListItem key={3} disablePadding>
              <ListItemButton component={Link} to="/settings" onClick={() => setOpen(false)}>
                <ListItemText primary={"Settings"} />
              </ListItemButton>
            </ListItem>
          </List>
        </Drawer>
        <Main open={open}>
          <DrawerHeader />
          
            <Routes>
              <Route path="/" element={<SingleGenerate setAppBarTitle={setAppBarTitle} />} />
              <Route path="/bulk-generate" element={<BulkGenerate setAppBarTitle={setAppBarTitle} />} />
              <Route path="/settings" element={<Settings setAppBarTitle={setAppBarTitle} />} />
            </Routes>
          
        </Main>
      </Box>
      <Snackbar
        open={appState.snackBar.open}
        autoHideDuration={3000}
        onClose={() => dispatch(AppStateSlice.actions.closeSnackBar())}
      >
        <Alert
          onClose={() => dispatch(AppStateSlice.actions.closeSnackBar())}
          severity={appState.snackBar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {appState.snackBar.message}
        </Alert>
      </Snackbar>
    </Router>
    </ThemeProvider>
    
  );
}
